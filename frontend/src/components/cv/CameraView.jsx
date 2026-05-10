import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import usePoseDetection from '../../hooks/usePoseDetection';
import useFormCoach from '../../hooks/useFormCoach';
import { areKeypointsVisible, FULL_BODY_KEYPOINTS } from '../../utils/poseAnalysis';
import PoseOverlay from './PoseOverlay';

/**
 * Live camera feed with on-device MoveNet pose detection (Spec 3.1).
 *
 * Stream and pose model both stay client-side — nothing is uploaded.
 *
 * Optionally accepts an `analyzer` (from utils/exerciseAnalyzers) and
 * fires:
 *   • onRepComplete(repNumber, lastRepData)  — on rep increments
 *   • onCue(cueText | null)                  — on cue text changes
 *   • onSetupReady(boolean)                  — full body visibility
 *
 * The analyzer's `jointStatus` drives skeleton coloring in PoseOverlay.
 */
export default function CameraView({
  active = true,
  analyzer = null,
  onRepComplete,
  onCue,
  onSetupReady,
  onFramingLost,                 // () => void — fired when full body framing is lost
  onCoachResult,                 // (result) => void — LLM verdict
  exerciseName = null,
  setNumber = null,
  coachEnabled = false,
  coachIntervalMs = 3000,
  showDebug = false,
}) {
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const streamRef = useRef(null);
  const debugRef = useRef(null);  // <pre> element written via .textContent

  // Track the last values we emitted so we don't fire callbacks on every frame.
  const lastRepCountRef = useRef(0);
  const lastCueRef = useRef(null);
  const wasBodyVisibleRef = useRef(false);
  const framingResetFiredRef = useRef(false);

  // Debounced framing state — MoveNet keypoint confidence wobbles around
  // the visibility threshold each frame, which would make the "Camera not
  // ready" overlay strobe. Require N consecutive frames before flipping.
  const visibleStreakRef = useRef(0);
  const invisibleStreakRef = useRef(0);
  const stableVisibleRef = useRef(false);
  const VISIBLE_FRAMES_TO_LOCK_ON = 6;     // ~200 ms at 30fps
  const INVISIBLE_FRAMES_TO_LOCK_OFF = 30; // ~1 s at 30fps — slow to give up

  // Refs the form coach reads each tick (avoids re-creating the interval).
  const repCountRef = useRef(0);
  const metricsRef = useRef(null);
  const metricsHistoryRef = useRef([]);  // rolling window of recent analyzer metrics
  const lastHistoryPushAtRef = useRef(0);
  const recentCuesRef = useRef([]);      // last N spoken cues, sent to LLM to prevent repetition
  const recentLLMResponsesRef = useRef([]); // last N raw LLM responses (debug)
  // LLM verdict held in a ref so the per-frame redraw can recolor the
  // skeleton without paying for a React re-render.
  const coachVerdictRef = useRef(null);

  // 'idle' | 'requesting' | 'active' | 'denied' | 'error'
  const [permission, setPermission] = useState('idle');
  const [permissionError, setPermissionError] = useState(null);
  const [bodyVisible, setBodyVisible] = useState(false);
  const [showPositioningTip, setShowPositioningTip] = useState(true);

  // ──── Camera lifecycle ────

  const startCamera = useCallback(async () => {
    setPermission('requesting');
    setPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setPermission('active');
    } catch (err) {
      console.error('Camera permission error:', err);
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setPermission('denied');
      } else {
        setPermission('error');
        setPermissionError(err?.message || 'Could not access camera');
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    overlayRef.current?.clear();
    setPermission('idle');
  }, []);

  useEffect(() => {
    if (active) startCamera();
    return stopCamera;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Auto-hide the positioning tip after 7s, or earlier when framing is good.
  useEffect(() => {
    if (!showPositioningTip) return undefined;
    const t = setTimeout(() => setShowPositioningTip(false), 7000);
    return () => clearTimeout(t);
  }, [showPositioningTip]);
  useEffect(() => {
    if (bodyVisible && showPositioningTip) {
      const t = setTimeout(() => setShowPositioningTip(false), 1500);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [bodyVisible, showPositioningTip]);

  // ──── Reset analyzer-derived diff trackers when analyzer changes ────
  useEffect(() => {
    lastRepCountRef.current = analyzer?.state?.repCount ?? 0;
    lastCueRef.current = null;
  }, [analyzer]);

  // ──── Per-frame pose handler ────

  const handlePose = useCallback((keypoints) => {
    const requiredKeypoints = analyzer?.requiredKeypoints || FULL_BODY_KEYPOINTS;
    const rawVisible = areKeypointsVisible(keypoints, requiredKeypoints);

    // Debounce the noisy raw signal. Only flip the stable state once we
    // see N consecutive frames in the new state — eliminates strobing.
    if (rawVisible) {
      visibleStreakRef.current += 1;
      invisibleStreakRef.current = 0;
    } else {
      invisibleStreakRef.current += 1;
      visibleStreakRef.current = 0;
    }
    let visible = stableVisibleRef.current;
    if (!visible && visibleStreakRef.current >= VISIBLE_FRAMES_TO_LOCK_ON) {
      visible = true;
    } else if (visible && invisibleStreakRef.current >= INVISIBLE_FRAMES_TO_LOCK_OFF) {
      visible = false;
    }
    stableVisibleRef.current = visible;

    // Framing transition: when we LOSE stable framing, drop in-flight analyzer
    // state so the next standing-baseline isn't calibrated against an old
    // camera distance. Phantom-rep guard.
    if (wasBodyVisibleRef.current && !visible) {
      analyzer?.reset();
      lastRepCountRef.current = 0;
      lastCueRef.current = null;
      lastTopicAtRef.current = {};      // fresh slate on framing loss
      recentCuesRef.current = [];
      framingResetFiredRef.current = false;
      if (onFramingLost) onFramingLost();
    }
    if (!wasBodyVisibleRef.current && visible && !framingResetFiredRef.current) {
      analyzer?.reset();
      lastRepCountRef.current = 0;
      framingResetFiredRef.current = true;
    }
    wasBodyVisibleRef.current = visible;

    // Only run the analyzer (and emit reps/cues) when the user is properly
    // framed. Without this, MoveNet keeps inferring partial-body keypoints
    // and the analyzer can't be trusted.
    let result = null;
    if (analyzer && visible) {
      result = analyzer.update(keypoints);

      repCountRef.current = result?.repCount ?? 0;
      metricsRef.current = result?.metrics ?? null;

      // Append to history at most every ~250 ms so the LLM sees rep
      // trajectory without ballooning payload size.
      const now = Date.now();
      if (result?.metrics && now - lastHistoryPushAtRef.current >= 250) {
        lastHistoryPushAtRef.current = now;
        const entry = { t: now, phase: result.phase, ...result.metrics };
        metricsHistoryRef.current = [...metricsHistoryRef.current.slice(-9), entry];
      }

      if (result?.repCount != null && result.repCount !== lastRepCountRef.current) {
        lastRepCountRef.current = result.repCount;
        if (onRepComplete) onRepComplete(result.repCount, result.lastRep);
      }

      const cue = result?.cue ?? null;
      if (cue !== lastCueRef.current) {
        lastCueRef.current = cue;
        if (onCue) onCue(cue);
      }
    }

    // Layer the LLM verdict on top of the analyzer's joint status. If the
    // coach says form is bad, paint every relevant joint red — the user
    // gets a whole-body visual signal even when the rule-based analyzer
    // can't pinpoint a specific joint from this camera angle.
    let jointStatus = result?.jointStatus || {};
    const verdict = coachVerdictRef.current;
    if (verdict && analyzer?.requiredKeypoints) {
      const overlayStatus = verdict.form_quality === 'bad'
        ? 'bad'
        : verdict.form_quality === 'needs_work'
        ? 'warn'
        : null;
      if (overlayStatus) {
        const layered = { ...jointStatus };
        for (const name of analyzer.requiredKeypoints) {
          // Only escalate severity, never downgrade an already-flagged joint.
          if (!layered[name] || severityRank(overlayStatus) > severityRank(layered[name])) {
            layered[name] = overlayStatus;
          }
        }
        jointStatus = layered;
      }
    }
    overlayRef.current?.draw(keypoints, jointStatus);

    setBodyVisible(visible);
    if (onSetupReady) onSetupReady(visible);

    // Imperative debug update — writes to the DOM directly so we don't
    // trigger a React re-render at 30 fps.
    if (debugRef.current && result) {
      const m = result.metrics || {};
      const llmLines = recentLLMResponsesRef.current
        .map((e) => `${e.t} [${e.quality?.[0] ?? '?'}/${e.view?.[0] ?? '?'}] ${e.raw ?? '(silent)'}`)
        .join('\n') || '(no LLM responses yet)';
      debugRef.current.textContent =
        `phase: ${result.phase}\n` +
        `reps:  ${result.repCount}\n` +
        `knee:  ${m.kneeAngle ?? '—'}°\n` +
        `hip:   ${m.hipDrop ?? '—'}\n` +
        `cave:  ${m.kneeCave ?? '—'}\n` +
        `tilt:  ${m.backTilt ?? '—'}°\n` +
        `calib: ${m.calibrated ? 'yes' : 'no'}\n` +
        `\n──── llm last 3 ────\n${llmLines}`;
    }
  }, [analyzer, onRepComplete, onCue, onSetupReady]);

  const { isModelLoading, isActive, error: poseError } = usePoseDetection({
    videoRef,
    enabled: active && permission === 'active',
    onPose: handlePose,
  });

  // ---------- Topic-based dedup (last line of defense) ----------
  // The LLM still repeats itself in different words ("sit deeper" → "go
  // lower" → "more depth"). Group cues by topic and refuse to surface or
  // speak the same topic within `topicQuietMs`. Critical safety topics
  // (back, knees) get a SHORTER lockout — they need to be re-raised faster.
  const lastTopicAtRef = useRef({});
  const TOPIC_QUIET_MS = {
    back: 6000,         // safety-critical → flag often
    knees: 6000,        // safety-critical
    depth: 12000,       // form, less urgent
    tempo: 11000,
    stability: 11000,
    praise: 14000,
    setup: 8000,
    other: 10000,
  };

  const handleCoachInternal = useCallback((result) => {
    // Record the RAW LLM response for the debug overlay BEFORE we filter.
    if (result) {
      const entry = {
        t: new Date().toLocaleTimeString().slice(0, 8),
        raw: result.suggestion,
        quality: result.form_quality,
        view: result.view_quality,
      };
      recentLLMResponsesRef.current = [...recentLLMResponsesRef.current.slice(-2), entry];
    }

    if (result?.suggestion) {
      // First filter: reject empty/generic phrases.
      if (isGenericCue(result.suggestion)) {
        result = { ...result, suggestion: null };
      }
    }
    if (result?.suggestion) {
      const topic = classifyTopic(result.suggestion);
      const quiet = TOPIC_QUIET_MS[topic] ?? 12000;
      const now = Date.now();
      const lastAt = lastTopicAtRef.current[topic] || 0;
      if (now - lastAt < quiet) {
        result = { ...result, suggestion: null, issue: result.issue };
      } else {
        lastTopicAtRef.current[topic] = now;
        recentCuesRef.current = [...recentCuesRef.current.slice(-3), result.suggestion];
      }
    }
    coachVerdictRef.current = result;
    if (onCoachResult) onCoachResult(result);
  }, [onCoachResult]);

  const {
    isAnalyzing: coachAnalyzing,
    lastResult: coachResult,
    error: coachError,
  } = useFormCoach({
    videoRef,
    // Don't fire the LLM until MoveNet is actually running — otherwise we'd
    // send a frame with no keypoint context and the model would just see a
    // raw image and start guessing about framing.
    enabled: coachEnabled && active && permission === 'active' && isActive && !!exerciseName,
    exerciseName,
    setNumber,
    repCountRef,
    metricsRef,
    metricsHistoryRef,
    recentCuesRef,
    intervalMs: coachIntervalMs,
    framesPerCall: 3,
    frameIntervalMs: 700,
    onResult: handleCoachInternal,
  });

  // ──── Render ────

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <video
        ref={videoRef}
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <PoseOverlay ref={overlayRef} videoRef={videoRef} />

      {/* Big framing prompt — covers the camera until full body is visible. */}
      {permission === 'active' && isActive && !bodyVisible && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm px-6 text-center pointer-events-none">
          <div className="bg-warn/15 border-2 border-warn rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <Camera size={28} className="text-warn" />
          </div>
          <div className="text-warn text-[10px] tracking-[0.18em] uppercase font-bold mb-2">
            Camera not ready
          </div>
          <div className="text-text text-[22px] font-semibold leading-tight max-w-[420px] mb-3">
            {analyzer?.setupHint || 'Step back so your full body fits in frame'}
          </div>
          <div className="text-muted text-[13px] max-w-[400px] leading-snug">
            Place your phone <span className="text-accent font-semibold">6–8 feet away</span>, ideally at a <span className="text-accent font-semibold">45° angle</span>. Hips, knees, and ankles all need to be in frame.
          </div>
          <div className="mt-5 border-2 border-dashed border-warn/50 rounded-[60px] w-[140px] h-[300px] max-h-[40%]" />
        </div>
      )}

      {permission === 'requesting' && (
        <Overlay>
          <Loader2 size={28} className="animate-spin text-accent" />
          <div className="text-sm">Requesting camera access…</div>
        </Overlay>
      )}

      {permission === 'denied' && (
        <Overlay>
          <AlertTriangle size={28} className="text-warn" />
          <div className="text-sm font-semibold">Camera blocked</div>
          <div className="text-xs text-muted text-center max-w-[280px]">
            Enable camera permission in your browser settings to use form analysis.
          </div>
          <button
            onClick={startCamera}
            className="mt-2 px-4 h-9 rounded-pill bg-accent text-accent-ink text-xs font-semibold"
          >
            Try again
          </button>
        </Overlay>
      )}

      {permission === 'error' && (
        <Overlay>
          <AlertTriangle size={28} className="text-bad" />
          <div className="text-sm font-semibold">Camera unavailable</div>
          {permissionError && (
            <div className="text-xs text-muted text-center max-w-[280px]">{permissionError}</div>
          )}
        </Overlay>
      )}

      {permission === 'active' && (isModelLoading || !isActive) && (
        <Overlay subtle>
          <Loader2 size={22} className="animate-spin text-accent" />
          <div className="text-xs text-muted">
            {isModelLoading ? 'Loading pose model…' : 'Starting…'}
          </div>
        </Overlay>
      )}


      {poseError && (
        <div className="absolute bottom-3 left-3 right-3 flex justify-center pointer-events-none">
          <div className="bg-bad/80 px-3 py-1.5 rounded-pill text-[11px]">{poseError}</div>
        </div>
      )}

      {/* Coach pulse — top-right small dot when an analysis call is in flight */}
      {coachEnabled && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-background/70 backdrop-blur-md border border-hairline rounded-pill px-2.5 py-1 text-[10px] pointer-events-none">
          <Sparkles size={10} className={coachAnalyzing ? 'text-accent animate-pulse' : 'text-muted'} />
          <span className={coachAnalyzing ? 'text-accent' : 'text-muted'}>
            {coachError ? 'coach offline' : coachAnalyzing ? 'analyzing…' : coachResult ? 'coaching' : 'standby'}
          </span>
        </div>
      )}

      {showDebug && analyzer && (
        <pre
          ref={debugRef}
          className="absolute bottom-3 left-3 bg-background/85 backdrop-blur-md border border-hairline rounded-[10px] px-2.5 py-2 text-[11px] font-mono leading-tight text-muted pointer-events-none"
        >
          loading…
        </pre>
      )}
    </div>
  );
}

function Overlay({ children, subtle = false }) {
  return (
    <div
      className={`absolute inset-0 flex flex-col gap-2 items-center justify-center text-text backdrop-blur-sm ${
        subtle ? 'bg-black/30' : 'bg-black/70'
      }`}
    >
      {children}
    </div>
  );
}

function severityRank(s) {
  return s === 'bad' ? 3 : s === 'warn' ? 2 : 1;
}

/**
 * Bucket a coaching cue into a coarse topic so we can rate-limit advice
 * by category, not just by exact-string match. Real trainers don't say
 * "sit deeper" then "go lower" then "more depth" 3 seconds apart.
 */
/**
 * Reject vague filler the LLM sometimes returns — phrases that don't
 * actually instruct the user to do anything specific. Better to be
 * silent than to say "watch your form".
 */
function isGenericCue(s) {
  const t = (s || '').toLowerCase().trim();
  if (!t || t.length < 6) return true;
  const filler = [
    'watch your form', 'fix your form', 'check your form',
    'looking good', 'keep going', 'keep it up', 'stay focused',
    'nice work', 'good rep', 'good job', 'well done',
    'be careful', 'pay attention',
  ];
  if (filler.some((f) => t === f || t.startsWith(f))) return true;
  // A real cue almost always names a body part or action verb.
  const hasBodyPartOrAction = /(back|spine|chest|knee|hip|shoulder|core|heel|foot|brace|sit|push|drive|drop|stand|tuck|squeeze|control|pause|slow|step|lock|stack|extend|hinge)/.test(t);
  return !hasBodyPartOrAction;
}

function classifyTopic(s) {
  const t = (s || '').toLowerCase();
  if (/(deep|deeper|lower|parallel|depth|drop|sit\s+down|hit\s+(?:full|the\s+bottom))/.test(t)) return 'depth';
  if (/(knee|knees|tracking|cave|caving)/.test(t)) return 'knees';
  if (/(back|spine|chest|round|tall|brace|core|hinge)/.test(t)) return 'back';
  if (/(tempo|slow|fast|control|bounce|rush|pause|speed|three\s*-?\s*second|control(?:led)?)/.test(t)) return 'tempo';
  if (/(heel|foot|feet|sway|balance|wobble|quiet)/.test(t)) return 'stability';
  if (/(great|strong|solid|nice|good|smooth|excellent|perfect)/.test(t)) return 'praise';
  if (/(camera|frame|step\s*back|move|phone)/.test(t)) return 'setup';
  return 'other';
}
