import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart, ChevronDown, PlayCircle } from 'lucide-react';
import Button from '../components/common/Button';
import ExerciseCard from '../components/workout/ExerciseCard';
import Chip from '../components/common/Chip';
import usePlanStore from '../store/planStore';

export default function PlanDayDetailPage() {
  const { dayId } = useParams();
  const navigate = useNavigate();
  const { currentPlan } = usePlanStore();
  const day = currentPlan.days.find((d) => d.id === dayId);

  if (!day) return <div className="p-8 text-muted">Day not found.</div>;

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

      <div className="px-5 py-3 border-b border-hairline-2 flex items-center justify-between text-muted">
        <div className="flex items-center gap-2.5">
          <Heart size={16} />
          <span className="text-sm font-medium">Warm-up · 5 min</span>
        </div>
        <ChevronDown size={16} />
      </div>

      <div className="px-5 py-3.5 flex flex-col gap-2.5">
        {day.exercises.map((ex, i) => (
          <ExerciseCard key={ex.id || i} exercise={ex} index={i} />
        ))}
      </div>

      <div className="fixed bottom-5 left-5 right-5 lg:static lg:px-5 lg:mt-4">
        <Button variant="primary" size="lg" fullWidth onClick={() => navigate(`/workout/${day.id}`)}>
          <PlayCircle size={18} fill="currentColor" /> Start workout
        </Button>
      </div>
    </div>
  );
}
