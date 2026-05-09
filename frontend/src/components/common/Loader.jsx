/**
 * RepFlow Loader — Animated dumbbell rep cycle (#18)
 * A dumbbell lifts up and down with pulsing rep-counter dots.
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
          .rf-bar {
            transform-origin: 90px 100px;
            animation: rf-lift 2s ease-in-out infinite;
          }
          .rf-dot1 {
            animation: rf-blink 2s ease-in-out infinite;
          }
          .rf-dot2 {
            animation: rf-blink 2s ease-in-out 0.7s infinite;
          }
          @keyframes rf-lift {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-22px); }
          }
          @keyframes rf-blink {
            0%, 30%, 70%, 100% { opacity: 0.25; }
            50%                 { opacity: 1; }
          }
        `}</style>

        {/* Dumbbell — lifts up and down */}
        <g className="rf-bar">
          {/* Bar */}
          <rect x="40" y="92" width="100" height="6" rx="3" fill="#C8FF3D" />
          {/* Left plate */}
          <rect x="32" y="80" width="14" height="30" rx="2" fill="#C8FF3D" />
          {/* Right plate */}
          <rect x="134" y="80" width="14" height="30" rx="2" fill="#C8FF3D" />
        </g>

        {/* Rep counter dots */}
        <circle className="rf-dot1" cx="60" cy="40" r="5" fill="#C8FF3D" />
        <circle cx="90" cy="32" r="6" fill="#C8FF3D" />
        <circle className="rf-dot2" cx="120" cy="40" r="5" fill="#C8FF3D" />

        {/* Rep label */}
        <text
          x="90"
          y="20"
          textAnchor="middle"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="10"
          fill="#5A5E69"
          letterSpacing="2"
        >
          LOADING
        </text>
      </svg>

      {label && (
        <span className="text-xs text-muted font-medium">{label}</span>
      )}
    </div>
  );
}
