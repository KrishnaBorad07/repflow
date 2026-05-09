import { Search } from 'lucide-react';
import Chip from '../common/Chip';
import { MUSCLE_GROUPS } from '../../utils/constants';

export default function ExerciseFilter({ search, onSearchChange, activeMuscle, onMuscleChange }) {
  const filters = ['All', ...MUSCLE_GROUPS];

  return (
    <div>
      <div className="flex items-center gap-2.5 h-[46px] bg-surface border border-hairline rounded-xl px-3.5 mb-3.5">
        <Search size={18} className="text-dim" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search 2,100+ exercises…"
          className="flex-1 bg-transparent text-sm text-text placeholder:text-dim outline-none"
        />
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {filters.map((f) => (
          <Chip key={f} active={activeMuscle === f || (f === 'All' && !activeMuscle)} onClick={() => onMuscleChange(f === 'All' ? null : f)}>
            {f}
          </Chip>
        ))}
      </div>
    </div>
  );
}
