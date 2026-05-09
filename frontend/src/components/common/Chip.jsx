export default function Chip({ children, active = false, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-pill text-xs font-medium border transition-colors shrink-0 ${
        active
          ? 'bg-accent-soft text-accent border-accent/25'
          : 'bg-elevated text-muted border-hairline hover:border-dim'
      } ${className}`}
    >
      {children}
    </button>
  );
}
