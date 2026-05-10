import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pause, Camera, CameraOff, Info, Sparkles, Volume2, VolumeX } from 'lucide-react';
import Button from '../components/common/Button';
import RestTimer from '../components/workout/RestTimer';
import WorkoutComplete from '../components/workout/WorkoutComplete';
import VideoPlayer from '../components/workout/VideoPlayer';
import CameraView from '../components/cv/CameraView';
import RepCounter from '../components/cv/RepCounter';
import Chip from '../components/common/Chip';
import useWorkout from '../hooks/useWorkout';
import useVoiceCoach from '../hooks/useVoiceCoach';
import { formatTimer } from '../utils/formatters';
import { getAnalyzer } from '../utils/exerciseAnalyzers';
import { TRAINER } from '../utils/trainerPhrases';
import { repTick, setCompleteSound, restEndSound } from '../utils/audio';

const VOICE_PREF_KEY = 'repflow_voice_enabled';

export default function ActiveWorkoutPage() {
  const navigate = useNavigate();
  const {
    activeWorkout,
    sessionId,
    currentExerciseIndex,
    currentSetIndex,
    isResting,
    restTimeRemaining,
    elapsedSeconds,
    isPaused,
    summary,
    isEnding,
    completeSet,
    skipRest,
    togglePause,
    finishWorkout,
    resetWorkout,
  } = useWorkout();

  const [cameraActive, setCameraActive] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [liveRepCount, setLiveRepCount] = useState(0);  // counted (good-form) reps
  const [lastRep, setLastRep] = useState(null);
  const [coachVerdict, setCoachVerdict] = useState(null); // latest LLM result
  const [rejectedFlash, setRejectedFlash] = useState(null); // brief reject feedback
  const [voiceEnabled, setVoiceEnabledState] = useState(() => {
    try { return localStorage.getItem(VOICE_PREF_KEY) !== '0'; } catch { return true; }
  });

  // OpenAI TTS voice coach — speaks LLM cues out loud.
  const { speak: speakCoach } = useVoiceCoach({ enabled: cameraActive && voiceEnabled });

  const toggleVoice = () => {
    setVoiceEnabledState((v) => {
      const next = !v;
      try { localStorage.setItem(VOICE_PREF_KEY, next ? '1' : '0'); } catch {}
      return next;
    });
  };

  // Latest LLM verdict accessed by per-frame logic (avoids stale closures).
  const coachVerdictRef = useRef(null);
  const autoLoggedSetRef = useRef(null);
  const restAlertedRef = useRef(false);
  const rejectedTimerRef = useRef(null);

  // Per-set trainer event flags so we don't fire each milestone twice.
  const trainerSetStartFiredRef = useRef(false);
  const trainerHalfwayFiredRef = useRef(false);
  const trainerLastRepFiredRef = useRef(false);

  const exercises = activeWorkout?.exercises || [];
  const currentExercise = exercises[currentExerciseIndex];
  const setsForCurrent = currentExercise?.sets ?? 4;
  const targetReps = currentExercise?.reps ?? 8;
  const setNumber = currentSetIndex + 1;

  const analyzer = useMemo(
    () => getAnalyzer(currentExercise?.name),
    [currentExercise?.id, currentExercise?.name]
  );

  // Reset live state on exercise change.
  useEffect(() => {
    setLiveRepCount(0);
    setLastRep(null);
    setCoachVerdict(null);
    coachVerdictRef.current = null;
    setRejectedFlash(null);
    autoLoggedSetRef.current = null;
    trainerSetStartFiredRef.current = false;
    trainerHalfwayFiredRef.current = false;
    trainerLastRepFiredRef.current = false;
  }, [analyzer]);

  // When the camera turns ON for an exercise that has an analyzer,
  // greet the user once with a real-trainer-style set intro.
  useEffect(() => {
    if (!cameraActive) {
      trainerSetStartFiredRef.current = false;
      return;
    }
    if (trainerSetStartFiredRef.current) return;
    if (!currentExercise || !analyzer) return;
    // Small delay so the model-loading overlay doesn't talk over itself.
    const t = setTimeout(() => {
      speakCoach(TRAINER.setStart(currentExercise.name, targetReps));
      trainerSetStartFiredRef.current = true;
    }, 1500);
    return () => clearTimeout(t);
  }, [cameraActive, currentExercise, analyzer, targetReps, speakCoach]);

  // Direct-navigation guard.
  useEffect(() => {
    if (!activeWorkout || !sessionId) {
      navigate('/dashboard', { replace: true });
    }
  }, [activeWorkout, sessionId, navigate]);

  // Pause camera while resting + reset per-set state.
  useEffect(() => {
    if (isResting) {
      if (cameraActive) setCameraActive(false);
      analyzer?.reset();
      setLiveRepCount(0);
      setLastRep(null);
      setCoachVerdict(null);
      coachVerdictRef.current = null;
      setRejectedFlash(null);
      autoLoggedSetRef.current = null;
      restAlertedRef.current = false;
      // Re-arm trainer milestones for the next set.
      trainerSetStartFiredRef.current = false;
      trainerHalfwayFiredRef.current = false;
      trainerLastRepFiredRef.current = false;
    }
  }, [isResting]); // eslint-disable-line react-hooks/exhaustive-deps

  // Rest-end alert (chime + trainer voice).
  useEffect(() => {
    if (isResting && restTimeRemaining > 0 && restTimeRemaining <= 1 && !restAlertedRef.current) {
      restAlertedRef.current = true;
      restEndSound();
      if (voiceEnabled) speakCoach(TRAINER.restEnd());
    }
  }, [isResting, restTimeRemaining, voiceEnabled, speakCoach]);

  // ──── Set completion ────

  const logSet = useCallback(
    async ({ auto = false, reps = null, formScore = null, repsGoodForm = null, isPartial = false } = {}) => {
      const setKey = `${currentExerciseIndex}:${currentSetIndex}`;
      if (auto && autoLoggedSetRef.current === setKey) return;
      autoLoggedSetRef.current = setKey;

      const result = await completeSet({
        reps_completed: reps ?? currentExercise?.reps ?? 0,
        weight_kg: currentExercise?.weight ?? 0,
        reps_good_form: repsGoodForm,
        form_score: formScore,
        is_partial: isPartial,
      });

      setCompleteSound();

      if (result?.isLastSetOfExercise && result?.isLastExercise) {
        await finishWorkout();
      }
    },
    [completeSet, currentExercise, currentExerciseIndex, currentSetIndex, finishWorkout]
  );

  // ──── Camera-mode callbacks ────

  // Rule-based analyzer fired a rep — gate it on the LLM's most recent verdict.
  const handleRepComplete = useCallback(
    (count, repData) => {
      if (repData) setLastRep(repData);

      const verdict = coachVerdictRef.current;
      const shouldCount =
        verdict == null ||           // no coach verdict yet → be permissive
        verdict.should_count_rep !== false;

      if (!shouldCount) {
        const issue = verdict?.issue || verdict?.suggestion || 'fix your form';
        setRejectedFlash(`Rep not counted — ${issue}`);
        if (rejectedTimerRef.current) clearTimeout(rejectedTimerRef.current);
        rejectedTimerRef.current = setTimeout(() => setRejectedFlash(null), 2200);
        speakCoach(TRAINER.badRep(verdict?.issue));
        return;
      }

      repTick();
      setLiveRepCount((prev) => {
        const next = prev + 1;

        // ──── Trainer milestone moments ────
        const halfway = Math.max(2, Math.floor(targetReps / 2));
        if (next === halfway && !trainerHalfwayFiredRef.current && targetReps >= 4) {
          trainerHalfwayFiredRef.current = true;
          speakCoach(TRAINER.halfway(next, targetReps));
        }
        if (next === targetReps - 1 && !trainerLastRepFiredRef.current && targetReps >= 3) {
          trainerLastRepFiredRef.current = true;
          speakCoach(TRAINER.lastRep());
        }

        if (next >= targetReps) {
          setTimeout(() => {
            const score = repData?.score ?? null;
            const goodForm = repData?.isPartial ? Math.max(0, next - 1) : next;
            logSet({
              auto: true,
              reps: next,
              repsGoodForm: goodForm,
              formScore: score,
              isPartial: repData?.isPartial ?? false,
            });
            // Set-complete praise from the trainer.
            speakCoach(TRAINER.setComplete(score));
          }, 0);
        }
        return next;
      });
    },
    [targetReps, logSet, speakCoach]
  );

  // LLM coach result arrived. Just store it; rep-counting reads the ref.
  const handleCoachResult = useCallback((result) => {
    coachVerdictRef.current = result;
    setCoachVerdict(result);
    // Speak the cue out loud (the hook handles dedup + interruption).
    if (result?.suggestion) speakCoach(result.suggestion);
  }, [speakCoach]);

  // Framing was lost (user stepped out of frame / moved too close). Reset
  // the visible rep count so we don't carry forward a possibly-bogus value.
  const handleFramingLost = useCallback(() => {
    setLiveRepCount(0);
    setLastRep(null);
    setRejectedFlash(null);
    setCoachVerdict(null);
    coachVerdictRef.current = null;
  }, []);

  // ──── Render: complete screen ────

  if (summary) {
    return (
      <div className="min-h-screen bg-background p-6 flex flex-col relative">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="absolute w-1.5 h-1.5 rounded-sm opacity-70" style={{
            background: ['#C8FF3D', '#7BD88F', '#E8C454', '#7AA9FF'][i % 4],
            top: 30 + (i * 23) % 280, left: 20 + (i * 47) % 340,
            transform: `rotate(${i * 47}deg)`,
          }} />
        ))}
        <div className="flex-1 flex flex-col items-center justify-center">
          <WorkoutComplete stats={{
            name: activeWorkout?.name,
            exercises: summary.exercises_count,
            duration: formatTimer(summary.duration_seconds || elapsedSeconds),
            volume: Math.round(summary.total_volume_kg).toLocaleString(),
            formScore: summary.form_score_avg != null ? summary.form_score_avg.toFixed(1) : '—',
            calories: summary.calories,
          }} />
        </div>
        <div className="flex gap-2.5 mt-8">
          <Button variant="secondary" size="lg" className="flex-1" onClick={() => { resetWorkout(); navigate('/progress'); }}>
            View summary
          </Button>
          <Button variant="primary" size="lg" className="flex-1" onClick={() => { resetWorkout(); navigate('/dashboard'); }}>
            Done
          </Button>
        </div>
      </div>
    );
  }

  if (!activeWorkout) return null;

  // ──── Render: resting ────

  if (isResting) {
    return (
      <div className="min-h-screen bg-background flex flex-col p-6">
        <div className="flex justify-between items-center mb-5">
          <div className="kicker !text-accent">RESTING</div>
          <button onClick={skipRest} className="text-[13px] text-muted">Skip rest</button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <RestTimer remaining={restTimeRemaining} total={currentExercise?.restSeconds || 90} onSkip={skipRest} />
          <div className="card p-4 mt-7 w-full max-w-sm">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs text-muted">PREVIOUS SET</div>
                <div className="text-base font-semibold mt-1">{currentExercise?.reps} reps · {currentExercise?.weight} kg</div>
              </div>
              <div className="text-right">
                <div className={`font-mono tabular-nums text-[22px] font-semibold ${
                  lastRep ? (lastRep.score >= 8 ? 'text-good' : lastRep.score >= 5 ? 'text-warn' : 'text-bad') : 'text-accent'
                }`}>
                  {lastRep?.score != null ? lastRep.score.toFixed(1) : '—'}
                </div>
                <div className="text-[10px] text-dim">FORM SCORE</div>
              </div>
            </div>
          </div>
          <div className="mt-[18px] w-full max-w-sm">
            <div className="kicker mb-2.5">Next set</div>
            <div className="flex gap-2">
              {['−2.5 kg', 'Same', '+2.5 kg'].map((label, i) => (
                <button key={label} className={`flex-1 h-[50px] rounded-xl font-mono text-[13px] font-semibold border ${i === 1 ? 'bg-accent text-accent-ink border-accent' : 'bg-surface text-text border-hairline'}`}>{label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ──── Render: exercise ────

  const handleManualLog = () => {
    logSet({ reps: currentExercise?.reps, isPartial: false });
  };

  // The text shown in the bottom cue bubble. Stay silent when the LLM
  // has nothing new to say — that's the whole point of letting it return
  // null instead of nagging.
  const cueText = (() => {
    if (rejectedFlash) return rejectedFlash;
    if (coachVerdict?.suggestion) return coachVerdict.suggestion;
    return null;
  })();

  const cueTone = (() => {
    if (rejectedFlash) return 'bad';
    if (coachVerdict?.form_quality === 'bad') return 'bad';
    if (coachVerdict?.form_quality === 'needs_work') return 'warn';
    if (coachVerdict?.view_quality === 'bad' || coachVerdict?.view_quality === 'limited') return 'warn';
    return 'good';
  })();

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Floating rep counter + cue — pinned to viewport so they stay
          visible when the user scrolls the page below the camera. */}
      {cameraActive && (
        <>
          <div className="fixed top-[60px] left-0 right-0 flex justify-center pointer-events-none z-30 px-3">
            <RepCounter
              count={liveRepCount}
              target={targetReps}
              lastRep={lastRep}
              formScore={lastRep?.score ?? null}
            />
          </div>
          {cueText && (
            <div className="fixed bottom-[100px] left-4 right-4 flex justify-center pointer-events-none z-30">
              <div className={`bg-background/95 backdrop-blur-xl border-2 rounded-[20px] px-6 py-5 max-w-[640px] w-full shadow-2xl flex items-start gap-4 animate-[pulse_2s_ease-in-out_infinite] ${
                cueTone === 'bad' ? 'border-bad shadow-bad/30'
                : cueTone === 'warn' ? 'border-warn shadow-warn/30'
                : 'border-good shadow-good/30'
              }`}>
                <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  cueTone === 'bad' ? 'bg-bad/15'
                  : cueTone === 'warn' ? 'bg-warn/15'
                  : 'bg-good/15'
                }`}>
                  <Sparkles size={24} className={
                    cueTone === 'bad' ? 'text-bad'
                    : cueTone === 'warn' ? 'text-warn'
                    : 'text-good'
                  } />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-[10px] font-bold tracking-[0.18em] uppercase mb-1 ${
                    cueTone === 'bad' ? 'text-bad'
                    : cueTone === 'warn' ? 'text-warn'
                    : 'text-good'
                  }`}>
                    {cueTone === 'bad' ? 'Form Issue'
                    : cueTone === 'warn' ? 'Needs Work'
                    : 'AI Coach'}
                  </div>
                  <div className="text-[20px] leading-tight font-semibold text-text">
                    {cueText}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Top HUD */}
      <div className="absolute top-3.5 left-4 right-4 z-20 flex justify-between items-center gap-2">
        <div className="bg-background/70 backdrop-blur-xl border border-hairline px-3 py-1.5 rounded-pill text-[13px] font-mono font-semibold">
          <span className="text-accent">●</span> {formatTimer(elapsedSeconds)}
        </div>
        <div className="flex gap-2">
          {cameraActive && (
            <>
              <button
                onClick={toggleVoice}
                className={`bg-background/70 backdrop-blur-xl border w-9 h-9 rounded-full flex items-center justify-center ${voiceEnabled ? 'border-accent/60 text-accent' : 'border-hairline text-muted'}`}
                title={voiceEnabled ? 'Mute voice coach' : 'Enable voice coach'}
              >
                {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              </button>
              <button
                onClick={() => setShowDebug((v) => !v)}
                className={`bg-background/70 backdrop-blur-xl border border-hairline w-9 h-9 rounded-full flex items-center justify-center ${showDebug ? 'text-accent' : ''}`}
                title="Toggle form metrics"
              >
                <Info size={14} />
              </button>
            </>
          )}
          <button
            onClick={togglePause}
            className="bg-background/70 backdrop-blur-xl border border-hairline px-3.5 py-1.5 rounded-pill text-[13px] flex items-center gap-2"
          >
            <Pause size={14} /> {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>
      </div>

      {/* Video / camera area */}
      <div className="relative h-[52%] min-h-[300px]">
        {cameraActive ? (
          <CameraView
            active={cameraActive}
            analyzer={analyzer}
            onRepComplete={handleRepComplete}
            onCue={() => {}}                 /* disabled — LLM owns cues now */
            onFramingLost={handleFramingLost}
            onCoachResult={handleCoachResult}
            exerciseName={currentExercise?.name || null}
            setNumber={setNumber}
            coachEnabled
            showDebug={showDebug}
          />
        ) : (
          <VideoPlayer className="h-full rounded-none" />
        )}

        {!analyzer && cameraActive && !cueText && (
          <div className="absolute bottom-3 left-3 right-3 flex justify-center pointer-events-none z-10">
            <div className="bg-background/80 backdrop-blur-md border border-hairline rounded-pill px-3 py-1.5 text-[11px] text-muted">
              AI coach is watching — manual log for unsupported exercises
            </div>
          </div>
        )}
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 py-3.5">
        {exercises.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full ${i < currentExerciseIndex ? 'w-1.5 bg-accent' : i === currentExerciseIndex ? 'w-6 bg-accent' : 'w-1.5 bg-elevated'}`} />
        ))}
      </div>

      {/* Exercise meta */}
      <div className="px-6 flex-1">
        <div className="kicker !text-accent">Exercise {currentExerciseIndex + 1} of {exercises.length}</div>
        <h2 className="text-[28px] font-semibold tracking-tight mt-1.5 leading-tight">{currentExercise?.name}</h2>
        <div className="flex gap-1.5 mt-2.5">
          {currentExercise?.muscle && <Chip active>{currentExercise.muscle}</Chip>}
          {currentExercise?.secondaryMuscles?.map((m) => <Chip key={m}>{m}</Chip>)}
        </div>

        <div className="mt-[18px] p-4 bg-surface border border-hairline rounded-[14px] flex justify-between items-center">
          <div>
            <div className="text-[11px] text-muted tracking-wider">SET {setNumber} OF {setsForCurrent}</div>
            <div className="font-mono tabular-nums text-[26px] font-semibold mt-1">{currentExercise?.reps} reps · {currentExercise?.weight} kg</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-muted tracking-wider">LAST TIME</div>
            <div className="font-mono text-[13px] text-dim mt-1">{setsForCurrent}×{currentExercise?.reps} @ {(currentExercise?.weight || 0) - 2.5} kg</div>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="p-6 flex gap-2.5">
        <Button variant="secondary" size="lg" className="flex-1" onClick={() => setCameraActive((v) => !v)} disabled={isEnding}>
          {cameraActive ? <><CameraOff size={16} /> Hide camera</> : <><Camera size={16} /> Start camera</>}
        </Button>
        <Button variant="primary" size="lg" className="flex-[1.4]" onClick={handleManualLog} disabled={isEnding}>
          Log set
        </Button>
      </div>
    </div>
  );
}
