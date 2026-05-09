import { Check } from 'lucide-react';
import { FITNESS_GOALS } from '../../utils/constants';

export default function GoalSelector({ selected, onSelect }) {
  return (
    <div className="flex flex-col gap-2.5">
      {FITNESS_GOALS.map((goal) => {
        const isActive = selected === goal.id;
        return (
          <button
            key={goal.id}
            onClick={() => onSelect(goal.id)}
            className={`flex items-center gap-3.5 p-4 rounded-[14px] border text-left transition-colors ${
              isActive ? 'bg-accent/[0.08] border-accent/40' : 'bg-surface border-hairline'
            }`}
          >
            <div className="w-11 h-11 rounded-xl bg-elevated flex items-center justify-center text-[22px]">
              {goal.emoji}
            </div>
            <div className="flex-1">
              <div className="text-base font-semibold">{goal.label}</div>
              <div className="text-[13px] text-muted mt-0.5">{goal.description}</div>
            </div>
            {isActive ? (
              <div className="w-[22px] h-[22px] rounded-full bg-accent flex items-center justify-center">
                <Check size={14} className="text-accent-ink" strokeWidth={3} />
              </div>
            ) : (
              <div className="w-[22px] h-[22px] rounded-full border-[1.5px] border-hairline" />
            )}
          </button>
        );
      })}
    </div>
  );
}
