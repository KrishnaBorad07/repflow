import ProgressRing from '../common/ProgressRing';

export default function RestTimer({ remaining, total, onSkip }) {
  return (
    <div className="flex flex-col items-center">
      <ProgressRing value={total - remaining} max={total} size={240}>
        <div className="font-mono tabular-nums text-[64px] font-semibold tracking-tighter leading-none">{remaining}</div>
        <div className="text-xs text-muted tracking-wider mt-1.5">SECONDS</div>
      </ProgressRing>
      <button onClick={onSkip} className="mt-6 text-[13px] text-muted hover:text-text transition-colors">
        Skip rest
      </button>
    </div>
  );
}
