import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, PlayCircle, Camera, ChevronRight, Volume2 } from 'lucide-react';
import Button from '../components/common/Button';
import RestTimer from '../components/workout/RestTimer';
import WorkoutComplete from '../components/workout/WorkoutComplete';
import VideoPlayer from '../components/workout/VideoPlayer';
import Chip from '../components/common/Chip';
import usePlanStore from '../store/planStore';
import { formatTimer } from '../utils/formatters';

export default function ActiveWorkoutPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { currentPlan } = usePlanStore();

  const day = currentPlan.days.find((d) => d.id === sessionId) || currentPlan.days.find((d) => d.status === 'today') || currentPlan.days[1];
  const exercises = day?.exercises || [];

  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [phase, setPhase] = useState('exercise'); // exercise | resting | complete
  const [elapsed, setElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [restTime, setRestTime] = useState(0);

  const currentExercise = exercises[currentExIdx];

  useEffect(() => {
    if (isPaused || phase === 'complete') return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [isPaused, phase]);

  useEffect(() => {
    if (phase !== 'resting' || restTime <= 0) return;
    const t = setInterval(() => {
      setRestTime((r) => {
        if (r <= 1) { setPhase('exercise'); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, restTime]);

  const completeSet = () => {
    if (currentSet < (currentExercise?.sets || 4)) {
      setCurrentSet(currentSet + 1);
      setPhase('resting');
      setRestTime(currentExercise?.restSeconds || 90);
    } else if (currentExIdx < exercises.length - 1) {
      setCurrentExIdx(currentExIdx + 1);
      setCurrentSet(1);
      setPhase('resting');
      setRestTime(60);
    } else {
      setPhase('complete');
    }
  };

  if (phase === 'complete') {
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
          <WorkoutComplete stats={{ name: day?.label, exercises: exercises.length, duration: formatTimer(elapsed), volume: '4,820', formScore: '8.3', calories: '412' }} />
        </div>
        <div className="flex gap-2.5 mt-8">
          <Button variant="secondary" size="lg" className="flex-1" onClick={() => navigate('/progress')}>View summary</Button>
          <Button variant="primary" size="lg" className="flex-1" onClick={() => navigate('/dashboard')}>Done</Button>
        </div>
      </div>
    );
  }

  if (phase === 'resting') {
    return (
      <div className="min-h-screen bg-background flex flex-col p-6">
        <div className="flex justify-between items-center mb-5">
          <div className="kicker !text-accent">RESTING</div>
          <button onClick={() => { setPhase('exercise'); setRestTime(0); }} className="text-[13px] text-muted">Skip rest</button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <RestTimer remaining={restTime} total={currentExercise?.restSeconds || 90} onSkip={() => { setPhase('exercise'); setRestTime(0); }} />
          <div className="card p-4 mt-7 w-full max-w-sm">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs text-muted">SET {currentSet - 1} COMPLETE</div>
                <div className="text-base font-semibold mt-1">{currentExercise?.reps} reps · {currentExercise?.weight} kg</div>
              </div>
              <div className="text-right">
                <div className="font-mono tabular-nums text-[22px] font-semibold text-accent">8.5</div>
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

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Top HUD */}
      <div className="absolute top-3.5 left-4 right-4 z-10 flex justify-between items-center">
        <div className="bg-background/70 backdrop-blur-xl border border-hairline px-3 py-1.5 rounded-pill text-[13px] font-mono font-semibold">
          <span className="text-accent">●</span> {formatTimer(elapsed)}
        </div>
        <button onClick={() => setIsPaused(!isPaused)} className="bg-background/70 backdrop-blur-xl border border-hairline px-3.5 py-1.5 rounded-pill text-[13px] flex items-center gap-2">
          <Pause size={14} /> {isPaused ? 'Resume' : 'Pause'}
        </button>
      </div>

      {/* Video area */}
      <VideoPlayer className="h-[52%] min-h-[300px] rounded-none" />

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 py-3.5">
        {exercises.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full ${i < currentExIdx ? 'w-1.5 bg-accent' : i === currentExIdx ? 'w-6 bg-accent' : 'w-1.5 bg-elevated'}`} />
        ))}
      </div>

      {/* Exercise meta */}
      <div className="px-6 flex-1">
        <div className="kicker !text-accent">Exercise {currentExIdx + 1} of {exercises.length}</div>
        <h2 className="text-[28px] font-semibold tracking-tight mt-1.5 leading-tight">{currentExercise?.name}</h2>
        <div className="flex gap-1.5 mt-2.5">
          <Chip active>{currentExercise?.muscle}</Chip>
          {currentExercise?.secondaryMuscles?.map((m) => <Chip key={m}>{m}</Chip>)}
        </div>

        <div className="mt-[18px] p-4 bg-surface border border-hairline rounded-[14px] flex justify-between items-center">
          <div>
            <div className="text-[11px] text-muted tracking-wider">SET {currentSet} OF {currentExercise?.sets}</div>
            <div className="font-mono tabular-nums text-[26px] font-semibold mt-1">{currentExercise?.reps} reps · {currentExercise?.weight} kg</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-muted tracking-wider">LAST TIME</div>
            <div className="font-mono text-[13px] text-dim mt-1">{currentExercise?.sets}×{currentExercise?.reps} @ {(currentExercise?.weight || 0) - 2.5} kg</div>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="p-6 flex gap-2.5">
        <Button variant="secondary" size="lg" className="flex-1" onClick={completeSet}>Log manually</Button>
        <Button variant="primary" size="lg" className="flex-[1.4]" onClick={completeSet}><Camera size={16} /> Start with camera</Button>
      </div>
    </div>
  );
}
