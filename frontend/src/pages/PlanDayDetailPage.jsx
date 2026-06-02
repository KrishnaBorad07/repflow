import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart, ChevronDown, ChevronUp, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/common/Button';
import ExerciseCard from '../components/workout/ExerciseCard';
import Chip from '../components/common/Chip';
import usePlanStore from '../store/planStore';
import useWorkoutStore from '../store/workoutStore';
import { findExerciseByName } from '../services/exerciseService';

const WARMUP_ROUTINES = {
  Legs: [
    '2 min light jog or high knees in place',
    '10 bodyweight squats (slow, full range)',
    '10 leg swings each side (front-to-back)',
    '10 hip circles each direction',
    '10 walking lunges',
  ],
  Back: [
    '2 min jump rope or arm circles',
    '10 cat-cow stretches',
    '10 band pull-aparts or arm circles',
    '10 scapular push-ups',
    '5 slow dead hangs (5s each)',
  ],
  Chest: [
    '2 min light cardio (jumping jacks)',
    '10 arm circles each direction (small → large)',
    '10 push-ups (slow tempo)',
    '10 band pull-aparts',
    '30s doorway chest stretch each side',
  ],
  Shoulders: [
    '2 min light cardio',
    '10 arm circles each direction',
    '10 band dislocates or pass-throughs',
    '10 lateral raises with very light weight',
    '10 wall slides',
  ],
  Arms: [
    '2 min light cardio',
    '10 wrist circles each direction',
    '10 light bicep curls (empty hands or 2kg)',
    '10 tricep extensions (bodyweight or light)',
    '10 arm circles each direction',
  ],
  Core: [
    '2 min light cardio',
    '10 cat-cow stretches',
    '10 pelvic tilts',
    '20s dead bug hold',
    '10 torso twists each side',
  ],
  'Full Body': [
    '2 min light jog or jumping jacks',
    '10 bodyweight squats',
    '10 arm circles each direction',
    '10 hip circles each direction',
    '5 inchworms',
  ],
};

function getWarmupForDay(muscles) {
  if (!muscles) return WARMUP_ROUTINES['Full Body'];
  const muscleList = muscles.split(/[·,]/).map((m) => m.trim());
  const primary = muscleList[0];
  for (const key of Object.keys(WARMUP_ROUTINES)) {
    if (primary.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(primary.toLowerCase())) {
      return WARMUP_ROUTINES[key];
    }
  }
  return WARMUP_ROUTINES['Full Body'];
}

export default function PlanDayDetailPage() {
  const { dayId } = useParams();
  const navigate = useNavigate();
  const { currentPlan } = usePlanStore();
  const { beginWorkout, isStarting } = useWorkoutStore();
  const day = currentPlan.days.find((d) => d.id === dayId);
  const [warmupOpen, setWarmupOpen] = useState(false);

  const libraryMap = useMemo(() => {
    if (!day?.exercises) return {};
    const map = {};
    for (const ex of day.exercises) {
      const match = findExerciseByName(ex.name);
      if (match) map[ex.id || ex.name] = match;
    }
    return map;
  }, [day?.exercises]);

  if (!day) return <div className="p-8 text-muted">Day not found.</div>;

  const isRestDay = day.status === 'rest' || !day.exercises?.length;

  const handleStart = async () => {
    if (isRestDay) return;
    try {
      const sessionId = await beginWorkout({
        plan_day_id: day.id,
        name: day.label,
        exercises: day.exercises,
      });
      navigate(`/workout/${sessionId}`);
    } catch (err) {
      console.error('Failed to start workout:', err);
    }
  };

  const handleExerciseClick = (ex) => {
    const libraryEx = libraryMap[ex.id || ex.name];
    if (libraryEx) {
      navigate(`/library/${libraryEx.id}`);
    }
  };

  return (
    <div className="min-h-screen pb-24 lg:max-w-[800px] lg:mx-auto">
      <div className="px-5 pt-2 pb-6 border-b border-hairline-2">
        <div className="flex items-center justify-between mb-3.5">
          <button onClick={() => navigate('/plan')} className="w-9 h-9 rounded-full bg-surface border border-hairline flex items-center justify-center">
            <ChevronLeft size={18} />
          </button>
          <span className="text-[13px] text-muted">{day.dayName}, {day.date}</span>
          <div className="w-9 h-9" />
        </div>
        <h1 className="text-[28px] font-semibold tracking-tight">{day.label}</h1>
        <div className="flex gap-1.5 mt-2.5">
          {day.muscles.split(' · ').map((m) => <Chip key={m}>{m}</Chip>)}
        </div>
        <div className="flex gap-[18px] mt-4 font-mono text-[13px] text-muted">
          <span>{day.exerciseCount} exercises</span>
          <span>·</span>
          <span>~{day.duration}</span>
          <span>·</span>
          <span>{day.exercises.reduce((sum, e) => sum + (e.sets || 0), 0)} sets</span>
        </div>
      </div>

      <div>
        <button
          onClick={() => setWarmupOpen(!warmupOpen)}
          className="w-full px-5 py-3 border-b border-hairline-2 flex items-center justify-between text-muted hover:text-text transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Heart size={16} />
            <span className="text-sm font-medium">Warm-up · 5 min</span>
          </div>
          {warmupOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        <AnimatePresence>
          {warmupOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-b border-hairline-2"
            >
              <ul className="px-5 py-3 flex flex-col gap-2">
                {getWarmupForDay(day.muscles).map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-muted">
                    <span className="font-mono text-xs text-dim mt-0.5 shrink-0">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-5 py-3.5 flex flex-col gap-2.5">
        {day.exercises.map((ex, i) => {
          const libraryEx = libraryMap[ex.id || ex.name];
          return (
            <ExerciseCard
              key={ex.id || i}
              exercise={ex}
              index={i}
              image={libraryEx?.images?.[0]}
              onClick={() => handleExerciseClick(ex)}
              linked={!!libraryEx}
            />
          );
        })}
      </div>

      {!isRestDay && (
        <div className="fixed bottom-5 left-5 right-5 lg:static lg:px-5 lg:mt-4">
          <Button variant="primary" size="lg" fullWidth onClick={handleStart} disabled={isStarting}>
            <PlayCircle size={18} fill="currentColor" /> {isStarting ? 'Starting…' : 'Start workout'}
          </Button>
        </div>
      )}
    </div>
  );
}
