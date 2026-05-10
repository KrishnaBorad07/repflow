/**
 * RepFlow Loader — 12 · Stopwatch
 * A stopwatch with a sweeping second hand.
 * Use for: rest timer initialization, EMOM/AMRAP/Tabata mode loading.
 *
 * @param {number} size - Overall size (default 80)
 * @param {string} className - Additional CSS classes
 * @param {string} label - Optional loading text below
 */
export default function StopwatchLoader({ size = 80, className = '', label }) {
  const scale = size / 80;

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <svg
        width={64 * scale}
        height={72 * scale}
        viewBox="0 0 64 72"
        fill="none"
        role="img"
        aria-label="Loading"
      >
        <style>{`
          .rf-sweep { animation: rf-sweep 2s linear infinite; transform-origin: 32px 40px; }
          @keyframes rf-sweep { 0% { transform: rotate(0); } 100% { transform: rotate(360deg); } }
          .rf-tick { animation: rf-tickflash 2s steps(12) infinite; }
          @keyframes rf-tickflash { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        `}</style>
        {/* Crown / button */}
        <rect x="28" y="2" width="8" height="6" rx="1" fill="var(--accent, #C8FF3D)" />
        <line x1="32" y1="2" x2="32" y2="-1" stroke="var(--accent, #C8FF3D)" strokeWidth="2" />
        {/* Watch body */}
        <circle cx="32" cy="40" r="26" stroke="var(--hairline, #262932)" strokeWidth="2" fill="var(--bg, #0A0B0D)" />
        {/* Tick marks */}
        <g className="rf-tick">
          <line x1="32" y1="16" x2="32" y2="20" stroke="var(--dim, #5A5E69)" strokeWidth="1.5" />
          <line x1="32" y1="60" x2="32" y2="64" stroke="var(--dim, #5A5E69)" strokeWidth="1.5" />
          <line x1="8" y1="40" x2="12" y2="40" stroke="var(--dim, #5A5E69)" strokeWidth="1.5" />
          <line x1="52" y1="40" x2="56" y2="40" stroke="var(--dim, #5A5E69)" strokeWidth="1.5" />
        </g>
        {/* Sweeping hand */}
        <line className="rf-sweep" x1="32" y1="40" x2="32" y2="20" stroke="var(--accent, #C8FF3D)" strokeWidth="2" strokeLinecap="round" />
        {/* Center dot */}
        <circle cx="32" cy="40" r="3" fill="var(--accent, #C8FF3D)" />
      </svg>
      {label && <span className="text-xs text-muted font-medium">{label}</span>}
    </div>
  );
}
