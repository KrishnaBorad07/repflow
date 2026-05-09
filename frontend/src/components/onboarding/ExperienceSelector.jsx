import { Check } from 'lucide-react';
import { EXPERIENCE_LEVELS } from '../../utils/constants';

export default function ExperienceSelector({ selected, onSelect }) {
  return (
    <div className="flex flex-col gap-2.5">
      {EXPERIENCE_LEVELS.map((level) => {
        const isActive = selected === level.id;
        return (
          <button
            key={level.id}
            onClick={() => onSelect(level.id)}
            className={`flex items-center gap-3.5 p-[18px] rounded-[14px] border text-left transition-colors ${
              isActive ? 'bg-accent/[0.08] border-accent/40' : 'bg-surface border-hairline'
            }`}
          >
            <div className={`w-11 h-11 rounded-full bg-elevated flex items-center justify-center font-mono font-semibold ${isActive ? 'text-accent' : 'text-muted'}`}>
              {level.level}
            </div>
            <div className="flex-1">
              <div className="text-base font-semibold">{level.label}</div>
              <div className="text-[13px] text-muted mt-0.5">{level.description}</div>
            </div>
            {isActive && (
              <div className="w-[22px] h-[22px] rounded-full bg-accent flex items-center justify-center">
                <Check size={14} className="text-accent-ink" strokeWidth={3} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
