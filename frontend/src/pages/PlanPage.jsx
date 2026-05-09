import { useNavigate } from 'react-router-dom';
import { RefreshCw, Plus } from 'lucide-react';
import Button from '../components/common/Button';
import DayCard from '../components/plan/DayCard';
import WeeklyView from '../components/plan/WeeklyView';
import usePlanStore from '../store/planStore';

export default function PlanPage() {
  const navigate = useNavigate();
  const { currentPlan, selectedWeek, nextWeek, prevWeek } = usePlanStore();
  const completedDays = currentPlan.days.filter((d) => d.status === 'done').length;
  const workoutDays = currentPlan.days.filter((d) => d.status !== 'rest').length;

  return (
    <div className="px-5 pt-3 pb-6 lg:p-8 lg:max-w-[800px]">
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
        <Button variant="secondary" size="md" className="flex-1"><RefreshCw size={16} /> Regenerate</Button>
        <Button variant="secondary" size="md" className="flex-1" onClick={() => navigate('/quick-workout')}><Plus size={16} /> Quick workout</Button>
      </div>
    </div>
  );
}
