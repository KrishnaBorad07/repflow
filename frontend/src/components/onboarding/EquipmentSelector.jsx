import { Check } from 'lucide-react';
import { EQUIPMENT_OPTIONS } from '../../utils/constants';

export default function EquipmentSelector({ selected, onSelect }) {
  return (
    <div className="flex flex-col gap-2.5">
      {EQUIPMENT_OPTIONS.map((opt) => {
        const isActive = selected === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={`flex items-center gap-3.5 p-4 rounded-[14px] border text-left transition-colors ${
              isActive ? 'bg-accent/[0.08] border-accent/40' : 'bg-surface border-hairline'
            }`}
          >
            <div className="flex-1">
              <div className="text-base font-semibold">{opt.label}</div>
              <div className="text-[13px] text-muted mt-0.5">{opt.description}</div>
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
