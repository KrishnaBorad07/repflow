/**
 * Exercise-specific form analyzers.
 *
 * Each analyzer is a stateful object created by a factory:
 *   const a = createSquatAnalyzer();
 *   const result = a.update(keypoints);  // run per-frame
 *   a.reset();                            // between sets
 *
 * `update` returns:
 *   {
 *     ready: boolean,                  // false when keypoints insufficient
 *     phase: string,                   // exercise-specific phase name
 *     repCount: number,
 *     lastRep: { score, isPartial, ... } | null,
 *     jointStatus: { [keypoint_name]: 'good'|'warn'|'bad' },
 *     cue: string | null,
 *     metrics: { ... }                 // per-exercise numbers (debug/UI)
 *   }
 */

import { angleAt, getKeypointMap, LOWER_BODY_KEYPOINTS } from './poseAnalysis';

export function getAnalyzer(exerciseName) {
  if (!exerciseName) return null;
  const name = exerciseName.toLowerCase();
  if (name.includes('squat')) return createSquatAnalyzer();
  // Future: push-up, lunge, bicep curl, overhead press
  return null;
}

// ──── Squat analyzer ────

/**
 * Multi-signal squat detector. From a front-facing webcam the geometric
 * knee angle barely changes (hip and ankle stay nearly vertically aligned),
 * so we ALSO track the user's hip drop relative to a calibrated standing
 * baseline. Either signal — bent knees OR dropped hip — drives the phase
 * machine.
 *
 * Joint thresholds are intentionally generous; the cost of a missed rep is
 * higher than the cost of an over-counted one for early-stage UX.
 */
// Tunable thresholds. Designed for a typical webcam squat where the only
// reliable signal is HIP VERTICAL MOTION — knee angle is unreliable from
// front-on. We use a rolling baseline that auto-adapts to where the user
// is standing, so squats register regardless of distance from camera.
const SQUAT_THRESHOLDS = {
  hipDeep: 0.12,             // hip drop fraction-of-body-height to enter "bottom"
  hipShallow: 0.05,          // entry into "descending" zone
  hipStanding: 0.025,        // back to top (tight so we don't miss the up-cycle)
  // A rep only requires that hip dropped at least this much at some point.
  minHipDropForRep: 0.10,
  minBottomMs: 200,          // must dwell at bottom this long (no bouncing)
  minRepIntervalMs: 900,     // min time between counted reps
  baselineWindowMs: 5000,    // rolling window the standing baseline tracks
};

export function createSquatAnalyzer() {
  const state = {
    phase: 'top',
    phaseAt: 0,
    bottomEnteredAt: 0,
    repCount: 0,
    lastRepAt: 0,
    bodyScale: 1,
    // Rolling window of recent { t, hipY } samples — used to derive a
    // self-adjusting "standing" baseline. We take the smallest hipY
    // (highest hip position) in this window as the current standing pose.
    hipYWindow: [],
    minKneeAngleThisRep: 180,
    maxHipDropThisRep: 0,
    maxBackTiltThisRep: 0,
    maxKneeCaveThisRep: 0,
    bottomDwellMs: 0,
    lastRep: null,
    cue: null,
    cueAt: 0,
    jointStatus: {},
  };

  function reset() {
    state.phase = 'top';
    state.phaseAt = 0;
    state.bottomEnteredAt = 0;
    state.repCount = 0;
    state.lastRepAt = 0;
    state.bodyScale = 1;
    state.hipYWindow = [];
    state.minKneeAngleThisRep = 180;
    state.maxHipDropThisRep = 0;
    state.maxBackTiltThisRep = 0;
    state.maxKneeCaveThisRep = 0;
    state.bottomDwellMs = 0;
    state.lastRep = null;
    state.cue = null;
    state.cueAt = 0;
    state.jointStatus = {};
  }

  function update(keypoints) {
    const kp = getKeypointMap(keypoints, 0.3);
    const lh = kp.left_hip, rh = kp.right_hip;
    const lk = kp.left_knee, rk = kp.right_knee;
    const la = kp.left_ankle, ra = kp.right_ankle;
    const ls = kp.left_shoulder, rs = kp.right_shoulder;

    // We require ankles in addition to hips and knees — without ankles the
    // body scale can't be calibrated (a hip drop in pixels means nothing).
    if (!lh || !rh || !lk || !rk || !la || !ra) {
      return {
        ready: false,
        phase: state.phase,
        repCount: state.repCount,
        jointStatus: {},
        cue: null,
        metrics: { reason: 'frame incomplete — ensure full body visible' },
      };
    }

    // ──── Geometry ────

    const midHip = { x: (lh.x + rh.x) / 2, y: (lh.y + rh.y) / 2 };
    const midAnkle = { x: (la.x + ra.x) / 2, y: (la.y + ra.y) / 2 };
    const midShoulder = ls && rs ? { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 } : null;

    // Body scale = shoulder-to-ankle (preferred) or hip-to-ankle (fallback).
    // Clamp the floor so a single bad frame can't shrink the denominator
    // and explode the normalized hipDrop into bogus values.
    if (midShoulder) {
      const newScale = Math.abs(midAnkle.y - midShoulder.y);
      if (newScale > 100) state.bodyScale = newScale;
    } else {
      const hipAnkle = Math.abs(midAnkle.y - midHip.y);
      if (hipAnkle > 80) state.bodyScale = hipAnkle * 1.7; // approx full body
    }
    const safeBodyScale = Math.max(state.bodyScale, 100);

    // Knee angle (avg both legs).
    const leftKneeAngle = angleAt(lh, lk, la);
    const rightKneeAngle = angleAt(rh, rk, ra);
    const kneeAngle = ((leftKneeAngle ?? 180) + (rightKneeAngle ?? 180)) / 2;

    // Knee cave — works only with side/45° view; harmless from front-on.
    const bodyWidth = Math.abs(rh.x - lh.x) || 1;
    const leftCave = la.x - lk.x;
    const rightCave = rk.x - ra.x;
    const kneeCave = (leftCave + rightCave) / bodyWidth;

    // Back tilt
    let backTilt = 0;
    if (midShoulder) {
      const dx = midShoulder.x - midHip.x;
      const dy = Math.max(midHip.y - midShoulder.y, 1);
      backTilt = Math.atan2(Math.abs(dx), dy) * 180 / Math.PI;
    }

    // ──── Self-adjusting standing baseline ────
    // Maintain a 5s rolling window of hip-Y samples. The smallest value
    // in that window (highest hip position) is our current standing
    // baseline. This auto-recalibrates if the user changes position and
    // doesn't depend on knee angle (which is unreliable from front-on).
    const now = Date.now();
    state.hipYWindow.push({ t: now, y: midHip.y });
    const windowStart = now - SQUAT_THRESHOLDS.baselineWindowMs;
    state.hipYWindow = state.hipYWindow.filter((s) => s.t >= windowStart);

    let standingHipY = midHip.y;
    for (const s of state.hipYWindow) {
      if (s.y < standingHipY) standingHipY = s.y;
    }

    // Hip drop normalized by body scale. 0 = at the highest recent
    // position, 0.10+ = noticeable drop, 0.18+ = roughly parallel.
    const hipDrop = Math.max(0, (midHip.y - standingHipY) / safeBodyScale);

    // ──── Phase machine — driven primarily by hip vertical motion ────
    const T = SQUAT_THRESHOLDS;
    const prevPhase = state.phase;

    const isDeep = hipDrop > T.hipDeep;
    const isShallow = hipDrop > T.hipShallow;
    const isStanding = hipDrop < T.hipStanding;

    let repJustCompleted = false;

    if (isStanding) {
      if (prevPhase === 'ascending' || prevPhase === 'bottom' || prevPhase === 'descending') {
        // Three gates: reached enough depth + dwelled at bottom + cooldown.
        const reachedDepth = state.maxHipDropThisRep >= T.minHipDropForRep;
        const bottomedLongEnough = state.bottomDwellMs >= T.minBottomMs;
        const cooldownPassed = now - state.lastRepAt >= T.minRepIntervalMs;

        if (reachedDepth && bottomedLongEnough && cooldownPassed) {
          state.lastRep = scoreRep(state);
          state.repCount += 1;
          state.lastRepAt = now;
          repJustCompleted = true;
        }
        // Reset rep accumulators regardless.
        state.minKneeAngleThisRep = 180;
        state.maxHipDropThisRep = 0;
        state.maxKneeCaveThisRep = 0;
        state.maxBackTiltThisRep = 0;
        state.bottomDwellMs = 0;
        state.bottomEnteredAt = 0;
      }
      if (prevPhase !== 'top') state.phaseAt = now;
      state.phase = 'top';
    } else if (isDeep) {
      if (prevPhase !== 'bottom') {
        state.phase = 'bottom';
        state.phaseAt = now;
        state.bottomEnteredAt = now;
      }
    } else if (isShallow) {
      if (prevPhase === 'top') {
        state.phase = 'descending';
        state.phaseAt = now;
      } else if (prevPhase === 'bottom') {
        state.phase = 'ascending';
        state.phaseAt = now;
      }
    }

    if (state.phase === 'bottom') {
      state.bottomDwellMs = now - state.bottomEnteredAt;
    }

    // Per-rep accumulators while NOT at the top.
    if (state.phase !== 'top') {
      state.minKneeAngleThisRep = Math.min(state.minKneeAngleThisRep, kneeAngle);
      state.maxHipDropThisRep = Math.max(state.maxHipDropThisRep, hipDrop);
      state.maxKneeCaveThisRep = Math.max(state.maxKneeCaveThisRep, kneeCave);
      state.maxBackTiltThisRep = Math.max(state.maxBackTiltThisRep, backTilt);
    }

    // ──── Real-time joint status ────
    const kneeStatus = kneeCave > 0.25 ? 'bad' : kneeCave > 0.10 ? 'warn' : 'good';
    const backStatus = backTilt > 60 ? 'bad' : backTilt > 45 ? 'warn' : 'good';

    state.jointStatus = {
      left_knee: kneeStatus,
      right_knee: kneeStatus,
      left_hip: backStatus,
      right_hip: backStatus,
      left_shoulder: backStatus,
      right_shoulder: backStatus,
    };

    // Rule-based cues are intentionally disabled — the LLM coach owns the
    // cue surface so the user only hears one voice. Joint coloring still
    // applies for visual feedback on the skeleton.
    const cue = null;
    state.cue = null;

    return {
      ready: true,
      phase: state.phase,
      repCount: state.repCount,
      lastRep: state.lastRep,
      jointStatus: { ...state.jointStatus },
      cue,
      repJustCompleted,
      metrics: {
        kneeAngle: Math.round(kneeAngle),
        hipDrop: hipDrop.toFixed(2),
        kneeCave: kneeCave.toFixed(2),
        backTilt: Math.round(backTilt),
        bottomMs: state.bottomDwellMs,
        calibrated: state.hipYWindow.length > 30,  // ~1s of samples
      },
    };
  }

  return {
    update,
    reset,
    requiredKeypoints: LOWER_BODY_KEYPOINTS,
    setupHint: 'Stand back so your legs are fully visible',
    get state() { return state; },
  };
}

function scoreRep(state) {
  const { maxHipDropThisRep, maxKneeCaveThisRep, maxBackTiltThisRep } = state;

  // Depth scored from hip drop only (most reliable signal across angles).
  let depth, depthPts;
  if (maxHipDropThisRep >= 0.20)      { depth = 'good';    depthPts = 4; }
  else if (maxHipDropThisRep >= 0.13) { depth = 'partial'; depthPts = 2; }
  else                                { depth = 'shallow'; depthPts = 0; }

  const trackPts = maxKneeCaveThisRep < 0.10 ? 3 : maxKneeCaveThisRep < 0.25 ? 1 : 0;
  const backPts = maxBackTiltThisRep < 45 ? 3 : maxBackTiltThisRep < 60 ? 1 : 0;

  const score = depthPts + trackPts + backPts;
  return {
    score,
    isPartial: depth !== 'good',
    depth,
    kneeCave: +maxKneeCaveThisRep.toFixed(2),
    backTilt: Math.round(maxBackTiltThisRep),
  };
}
