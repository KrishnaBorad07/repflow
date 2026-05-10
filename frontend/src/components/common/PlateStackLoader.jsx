/**
 * RepFlow Loader — 07 · Plate Stack (EQ Bars)
 * Equalizer-style bars that pulse up and down like stacked plates.
 * Use for: volume/1RM/analytics computation, progress tab loading.
 *
 * @param {number} size - Overall size (default 100)
 * @param {string} className - Additional CSS classes
 * @param {string} label - Optional loading text below
 */
export default function PlateStackLoader({ size = 100, className = '', label }) {
  const scale = size / 100;

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <svg
        width={140 * scale}
        height={100 * scale}
        viewBox="0 0 140 100"
        fill="none"
        role="img"
        aria-label="Loading"
      >
        <style>{`
          .rf-eq { animation: rf-eq 1s ease-in-out infinite; transform-origin: center bottom; }
          .rf-eq-1 { animation-delay: 0s; }
          .rf-eq-2 { animation-delay: 0.15s; }
          .rf-eq-3 { animation-delay: 0.3s; }
          .rf-eq-4 { animation-delay: 0.45s; }
          .rf-eq-5 { animation-delay: 0.6s; }
          @keyframes rf-eq {
            0%, 100% { transform: scaleY(0.3); }
            50%      { transform: scaleY(1); }
          }
        `}</style>
        <g transform="translate(20 80)">
          <rect className="rf-eq rf-eq-1" x="0" y="-50" width="14" height="50" rx="2" fill="var(--accent, #C8FF3D)" />
          <rect className="rf-eq rf-eq-2" x="22" y="-70" width="14" height="70" rx="2" fill="var(--accent, #C8FF3D)" />
          <rect className="rf-eq rf-eq-3" x="44" y="-40" width="14" height="40" rx="2" fill="var(--accent, #C8FF3D)" />
          <rect className="rf-eq rf-eq-4" x="66" y="-65" width="14" height="65" rx="2" fill="var(--accent, #C8FF3D)" />
          <rect className="rf-eq rf-eq-5" x="88" y="-30" width="14" height="30" rx="2" fill="var(--accent, #C8FF3D)" />
        </g>
        <line x1="14" y1="84" x2="116" y2="84" stroke="var(--hairline, #262932)" strokeWidth="1.5" />
      </svg>
      {label && <span className="text-xs text-muted font-medium">{label}</span>}
    </div>
  );
}
