import { Check, ChevronRight } from 'lucide-react';
import Card from '../common/Card';

export default function DayCard({ day, onClick }) {
  const isToday = day.status === 'today';
  const isDone = day.status === 'done';
  const isRest = day.status === 'rest';

  return (
    <Card
      className={`p-3.5 flex items-center gap-3 ${isRest ? 'opacity-65' : ''} ${isToday ? '!border-accent/45 !bg-accent/5' : ''}`}
      onClick={onClick}
    >
      <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center ${
        isDone ? 'bg-accent text-accent-ink' : isToday ? 'bg-accent/15 text-accent' : 'bg-elevated text-muted'
      }`}>
        <span className="text-[10px] font-semibold tracking-wider">{day.dayName?.toUpperCase()}</span>
        <span className="text-base font-semibold leading-none mt-0.5">{day.date?.split(' ')[1]}</span>
      </div>
      <div className="flex-1">
        <div className="text-[15px] font-semibold">{day.label}</div>
        <div className="text-xs text-muted mt-0.5">{day.muscles}</div>
        {day.exerciseCount > 0 && (
          <div className="text-[11px] text-dim font-mono mt-1">{day.exerciseCount} ex · {day.duration}</div>
        )}
      </div>
      {isDone && (
        <div className="w-[22px] h-[22px] rounded-full bg-accent flex items-center justify-center">
          <Check size={14} className="text-accent-ink" strokeWidth={3} />
        </div>
      )}
      {isToday && <ChevronRight size={20} className="text-accent" />}
      {day.status === 'plan' && <ChevronRight size={18} className="text-dim" />}
    </Card>
  );
}
