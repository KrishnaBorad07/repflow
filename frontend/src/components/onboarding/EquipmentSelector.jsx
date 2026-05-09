import { Check } from 'lucide-react';
import { EQUIPMENT_OPTIONS, EQUIPMENT_INVENTORY_OPTIONS } from '../../utils/constants';

const INVENTORY_LABELS = {
  barbell: 'Barbell',
  dumbbells: 'Dumbbells',
  kettlebell: 'Kettlebell',
  pull_up_bar: 'Pull-up bar',
  resistance_bands: 'Bands',
  cables: 'Cables',
  machines: 'Machines',
  bench: 'Bench',
  squat_rack: 'Squat rack',
  trx: 'TRX',
  foam_roller: 'Foam roller',
  yoga_mat: 'Yoga mat',
};

export default function EquipmentSelector({ selected, onSelect, inventory = [], onInventoryChange }) {
  const showInventory = selected === 'home_basic' || selected === 'full_gym';

  const toggleItem = (item) => {
    if (inventory.includes(item)) {
      onInventoryChange(inventory.filter((i) => i !== item));
    } else {
      onInventoryChange([...inventory, item]);
    }
  };

  return (
    <div>
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

      {showInventory && (
        <div className="mt-5">
          <div className="text-xs text-muted mb-2.5 tracking-wider">WHAT DO YOU HAVE?</div>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_INVENTORY_OPTIONS.map((item) => {
              const isActive = inventory.includes(item);
              return (
                <button
                  key={item}
                  onClick={() => toggleItem(item)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    isActive ? 'bg-accent/[0.08] text-accent border-accent/40' : 'bg-surface text-muted border-hairline'
                  }`}
                >
                  {INVENTORY_LABELS[item] || item}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
