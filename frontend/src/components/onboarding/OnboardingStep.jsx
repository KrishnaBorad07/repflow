import { ChevronLeft } from 'lucide-react';

export default function OnboardingStep({ step, total, onBack, onSkip, children }) {
  const progress = (step / total) * 100;

  return (
    <div className="flex flex-col p-6 pt-3">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className={`w-9 h-9 rounded-full bg-surface border border-hairline flex items-center justify-center transition-opacity ${step === 1 ? 'opacity-30 pointer-events-none' : ''}`}
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-xs text-muted font-mono">{step} / {total}</span>
        <button onClick={onSkip} className="text-[13px] text-muted hover:text-text transition-colors">Skip</button>
      </div>
      <div className="h-1 bg-elevated rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
