import { Search } from 'lucide-react';
import Chip from '../common/Chip';
import { MUSCLE_GROUPS, EQUIPMENT_TYPES } from '../../utils/constants';

export default function ExerciseFilter({ search, onSearchChange, activeMuscle, onMuscleChange, activeEquipment, onEquipmentChange }) {
  const muscleFilters = ['All', ...MUSCLE_GROUPS];
  const equipmentFilters = ['All', ...EQUIPMENT_TYPES];

  return (
    <div>
      <div className="flex items-center gap-2.5 h-[46px] bg-surface border border-hairline rounded-xl px-3.5 mb-3.5">
        <Search size={18} className="text-dim" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search 870+ exercises…"
          className="flex-1 bg-transparent text-sm text-text placeholder:text-dim outline-none"
        />
      </div>
      {/* Muscle group filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {muscleFilters.map((f) => (
          <Chip key={f} active={activeMuscle === f || (f === 'All' && !activeMuscle)} onClick={() => onMuscleChange(f === 'All' ? null : f)}>
            {f}
          </Chip>
        ))}
      </div>
      {/* Equipment filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mt-2">
        {equipmentFilters.map((f) => (
          <Chip key={f} active={activeEquipment === f || (f === 'All' && !activeEquipment)} onClick={() => onEquipmentChange(f === 'All' ? null : f)}>
            {f}
          </Chip>
        ))}
      </div>
    </div>
  );
}
