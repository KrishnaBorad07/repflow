/**
 * RepFlow Loader — 01 · Bar Lift
 * A barbell with plates that lifts up/down with a subtle bar flex.
 * Use for: app splash screen, full-page route transitions.
 *
 * @param {number} size - Overall size scale (default 80)
 * @param {string} className - Additional CSS classes
 * @param {string} label - Optional loading text below the animation
 */
export default function Loader({ size = 80, className = '', label }) {
  const scale = size / 80;

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <svg
        width={180 * scale}
        height={120 * scale}
        viewBox="0 0 180 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Loading"
      >
        <style>{`
          .rf-barlift { animation: rf-barlift 1.6s ease-in-out infinite; transform-origin: center; }
          @keyframes rf-barlift {
            0%, 100% { transform: translateY(0); }
            50%      { transform: translateY(-14px); }
          }
          .rf-barbend { animation: rf-barbend 1.6s ease-in-out infinite; }
          @keyframes rf-barbend {
            0%, 100% { transform: scaleX(1); }
            50%      { transform: scaleX(0.96); }
          }
        `}</style>

        {/* LOADING text */}
        <text
          x="90"
          y="22"
          textAnchor="middle"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="10"
          fill="var(--dim, #5A5E69)"
          letterSpacing="2"
        >
          LOADING
        </text>

        {/* Barbell — lifts up and down */}
        <g className="rf-barlift">
          {/* Left large plate */}
          <rect x="32" y="80" width="14" height="30" rx="2" fill="var(--accent, #C8FF3D)" />
          {/* Right large plate */}
          <rect x="134" y="80" width="14" height="30" rx="2" fill="var(--accent, #C8FF3D)" />
          {/* Left small plate */}
          <rect x="22" y="84" width="6" height="22" rx="1.5" fill="var(--accent, #C8FF3D)" opacity="0.7" />
          {/* Right small plate */}
          <rect x="152" y="84" width="6" height="22" rx="1.5" fill="var(--accent, #C8FF3D)" opacity="0.7" />
          {/* Bar (with bend) */}
          <g className="rf-barbend">
            <rect x="40" y="92" width="100" height="6" rx="3" fill="var(--accent, #C8FF3D)" />
          </g>
        </g>
      </svg>

      {label && (
        <span className="text-xs text-muted font-medium">{label}</span>
      )}
    </div>
  );
}
