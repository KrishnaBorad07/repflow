/**
 * RepFlow Loader — 14 · Squat
 * A stick figure performing squats.
 * Use for: onboarding "building your plan", slower narrative loading states.
 *
 * @param {number} size - Overall size (default 100)
 * @param {string} className - Additional CSS classes
 * @param {string} label - Optional loading text below
 */
export default function SquatLoader({ size = 100, className = '', label }) {
  const scale = size / 100;

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <svg
        width={80 * scale}
        height={90 * scale}
        viewBox="0 0 80 90"
        fill="none"
        role="img"
        aria-label="Loading"
      >
        <style>{`
          .rf-squat { animation: rf-squat 1.8s ease-in-out infinite; }
          @keyframes rf-squat {
            0%, 100% { transform: translateY(0) scaleY(1); }
            50%      { transform: translateY(8px) scaleY(0.85); }
          }
        `}</style>
        {/* Ground line */}
        <line x1="0" y1="78" x2="80" y2="78" stroke="var(--hairline, #262932)" strokeWidth="1" />
        {/* Stick figure */}
        <g className="rf-squat">
          {/* Head */}
          <circle cx="40" cy="20" r="6" fill="var(--accent, #C8FF3D)" />
          {/* Torso */}
          <line x1="40" y1="26" x2="40" y2="48" stroke="var(--accent, #C8FF3D)" strokeWidth="3" strokeLinecap="round" />
          {/* Arms */}
          <line x1="40" y1="32" x2="26" y2="44" stroke="var(--accent, #C8FF3D)" strokeWidth="3" strokeLinecap="round" />
          <line x1="40" y1="32" x2="54" y2="44" stroke="var(--accent, #C8FF3D)" strokeWidth="3" strokeLinecap="round" />
          {/* Thighs */}
          <line x1="40" y1="48" x2="30" y2="68" stroke="var(--accent, #C8FF3D)" strokeWidth="3" strokeLinecap="round" />
          <line x1="40" y1="48" x2="50" y2="68" stroke="var(--accent, #C8FF3D)" strokeWidth="3" strokeLinecap="round" />
          {/* Shins */}
          <line x1="30" y1="68" x2="30" y2="78" stroke="var(--accent, #C8FF3D)" strokeWidth="3" strokeLinecap="round" />
          <line x1="50" y1="68" x2="50" y2="78" stroke="var(--accent, #C8FF3D)" strokeWidth="3" strokeLinecap="round" />
        </g>
      </svg>
      {label && <span className="text-xs text-muted font-medium">{label}</span>}
    </div>
  );
}
