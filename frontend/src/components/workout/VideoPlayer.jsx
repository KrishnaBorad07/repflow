export default function VideoPlayer({ className = '' }) {
  return (
    <div className={`bg-[repeating-linear-gradient(135deg,#15171C_0_8px,#1A1D24_8px_16px)] border border-hairline flex items-center justify-center text-[11px] text-dim font-mono uppercase ${className}`}>
      <span>EXERCISE DEMO LOOP</span>
    </div>
  );
}
