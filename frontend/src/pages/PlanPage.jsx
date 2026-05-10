import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Plus, Sparkles } from 'lucide-react';
import Button from '../components/common/Button';
import DayCard from '../components/plan/DayCard';
import WeeklyView from '../components/plan/WeeklyView';
import Loader from '../components/common/Loader';
import usePlanStore from '../store/planStore';

export default function PlanPage() {
  const navigate = useNavigate();
  const { currentPlan, selectedWeek, nextWeek, prevWeek, isLoading, fetchPlan, regeneratePlan } = usePlanStore();

  useEffect(() => {
    fetchPlan();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader />
        <p className="text-muted text-sm">Generating your plan...</p>
      </div>
    );
  }

  if (!currentPlan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-5">
        <Sparkles size={48} className="text-accent" />
        <h2 className="text-xl font-semibold">No plan yet</h2>
        <p className="text-muted text-sm text-center">Generate your first AI-powered workout plan</p>
        <Button variant="primary" size="lg" onClick={() => regeneratePlan()}>
          <Sparkles size={16} /> Generate Plan
        </Button>
      </div>
    );
  }

  const completedDays = currentPlan.days.filter((d) => d.status === 'done').length;
  const workoutDays = currentPlan.days.filter((d) => d.status !== 'rest').length;

  return (
    <div className="px-5 pt-3 pb-6 lg:p-8 lg:max-w-[900px] lg:mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <div className="kicker">Week {selectedWeek} of {currentPlan.totalWeeks}</div>
          <h1 className="text-2xl font-semibold tracking-tight mt-1">{currentPlan.programName}</h1>
        </div>
        <WeeklyView weekNumber={selectedWeek} totalWeeks={currentPlan.totalWeeks} completedDays={completedDays} totalDays={workoutDays} onPrev={prevWeek} onNext={nextWeek} />
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-[11px] text-muted font-mono mb-1.5">
          <span>{completedDays} of {workoutDays} done</span>
          <span>{workoutDays > 0 ? Math.round((completedDays / workoutDays) * 100) : 0}%</span>
        </div>
        <div className="h-1 bg-elevated rounded-full overflow-hidden mb-4">
          <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${workoutDays > 0 ? (completedDays / workoutDays) * 100 : 0}%` }} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {currentPlan.days.map((day) => (
          <DayCard key={day.id} day={day} onClick={() => day.exerciseCount > 0 && navigate(`/plan/${day.id}`)} />
        ))}
      </div>

      <div className="flex gap-2.5 mt-[18px]">
        <Button variant="secondary" size="md" className="flex-1" onClick={() => regeneratePlan()} disabled={isLoading}>
          <RefreshCw size={16} /> Regenerate
        </Button>
        <Button variant="secondary" size="md" className="flex-1" onClick={() => navigate('/quick-workout')}>
          <Plus size={16} /> Quick workout
        </Button>
      </div>
    </div>
  );
}
