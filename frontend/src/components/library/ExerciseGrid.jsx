import Badge from '../common/Badge';

export default function ExerciseGrid({ exercises, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {exercises.map((ex) => (
        <button
          key={ex.id}
          onClick={() => onSelect(ex)}
          className="card p-2.5 text-left hover:border-hairline-2 transition-colors"
        >
          <div className="w-full h-[100px] rounded-[10px] bg-[repeating-linear-gradient(135deg,#15171C_0_8px,#1A1D24_8px_16px)] border border-hairline flex items-center justify-center text-[9px] text-dim font-mono uppercase mb-2.5">
            VIDEO
          </div>
          <div className="text-[13px] font-semibold leading-tight">{ex.name}</div>
          <div className="flex justify-between items-center mt-1.5">
            <span className="text-[11px] text-muted">{ex.muscle}</span>
            <Badge color={ex.difficulty === 'Beginner' ? 'green' : 'yellow'}>
              {ex.difficulty === 'Beginner' ? 'BEG' : ex.difficulty === 'Intermediate' ? 'INT' : 'ADV'}
            </Badge>
          </div>
        </button>
      ))}
    </div>
  );
}
