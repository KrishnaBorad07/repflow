const colorMap = {
  green: 'bg-good/15 text-good',
  yellow: 'bg-warn/15 text-warn',
  red: 'bg-bad/15 text-bad',
  blue: 'bg-info/15 text-info',
  accent: 'bg-accent-soft text-accent',
  gray: 'bg-elevated text-muted',
};

export default function Badge({ children, color = 'gray', className = '' }) {
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${colorMap[color]} ${className}`}>
      {children}
    </span>
  );
}
