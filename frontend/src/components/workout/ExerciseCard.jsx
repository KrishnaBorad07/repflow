import { ExternalLink } from 'lucide-react';
import Card from '../common/Card';

export default function ExerciseCard({ exercise, index, onClick, image, linked }) {
  return (
    <Card className="p-3 flex gap-3 cursor-pointer hover:border-hairline-2 group" onClick={onClick}>
      {/* Thumbnail — real image or fallback */}
      <div className="w-16 h-16 rounded-[10px] border border-hairline overflow-hidden shrink-0 bg-surface">
        {image ? (
          <img src={image} alt={exercise.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-[repeating-linear-gradient(135deg,#15171C_0_8px,#1A1D24_8px_16px)] flex items-center justify-center text-[9px] text-dim font-mono uppercase">
            IMG
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[11px] text-dim">0{index + 1}</span>
            <span className="text-sm font-semibold">{exercise.name}</span>
            {linked && <ExternalLink size={12} className="text-muted opacity-0 group-hover:opacity-100 transition-opacity" />}
          </div>
          <div className="text-[11px] text-muted mt-0.5">{exercise.muscle}{exercise.secondaryMuscles?.[0] ? ` · ${exercise.secondaryMuscles[0]}` : ''}</div>
        </div>
        <div className="flex gap-3 font-mono text-xs text-muted">
          <span><span className="text-text font-semibold">{exercise.sets} × {exercise.reps}</span></span>
          <span>·</span>
          <span>{exercise.weight} kg</span>
          <span>·</span>
          <span>{exercise.restSeconds}s rest</span>
        </div>
      </div>
    </Card>
  );
}
