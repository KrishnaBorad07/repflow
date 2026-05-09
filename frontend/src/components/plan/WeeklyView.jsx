import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function WeeklyView({ weekNumber, totalWeeks, completedDays, totalDays, onPrev, onNext }) {
  const progress = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={onPrev} className="w-9 h-9 rounded-full bg-surface border border-hairline flex items-center justify-center">
          <ChevronLeft size={16} />
        </button>
        <button onClick={onNext} className="w-9 h-9 rounded-full bg-surface border border-hairline flex items-center justify-center">
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="mb-4">
        <div className="flex justify-between text-[11px] text-muted font-mono mb-1.5">
          <span>{completedDays} of {totalDays} done</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1 bg-elevated rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
