import { Check } from 'lucide-react';

export default function SetLoggerRow({ setNumber, targetReps, weight, completed, formScore, onComplete }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${completed ? 'bg-accent/5 border-accent/30' : 'bg-surface border-hairline'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${completed ? 'bg-accent text-accent-ink' : 'bg-elevated text-muted'}`}>
        {completed ? <Check size={14} strokeWidth={3} /> : setNumber}
      </div>
      <div className="flex-1">
        <span className="font-mono text-sm font-semibold">{targetReps} reps · {weight} kg</span>
      </div>
      {formScore && (
        <div className="text-right">
          <div className="font-mono text-sm font-semibold text-accent">{formScore}</div>
          <div className="text-[10px] text-dim">FORM</div>
        </div>
      )}
      {!completed && (
        <button onClick={onComplete} className="h-9 px-4 rounded-lg bg-accent text-accent-ink text-xs font-semibold">
          Log
        </button>
      )}
    </div>
  );
}
