/**
 * RepFlow Loader — 15 · Wave (Audio Waveform)
 * Symmetrical audio waveform bars that pulse.
 * Use for: AI chat thinking state, voice coach listening/speaking.
 *
 * @param {number} size - Overall width (default 140)
 * @param {string} className - Additional CSS classes
 * @param {string} label - Optional loading text below
 */
export default function WaveLoader({ size = 140, className = '', label }) {
  const scale = size / 140;

  // Bar configs: x position, half-height
  const bars = [
    { x: 10, h: 12 },
    { x: 26, h: 18 },
    { x: 42, h: 9 },
    { x: 58, h: 22 },
    { x: 74, h: 15 },
    { x: 90, h: 26 },
    { x: 106, h: 15 },
    { x: 122, h: 22 },
    { x: 138, h: 9 },
    { x: 154, h: 18 },
    { x: 170, h: 12 },
  ];

  const delays = [0, 0.08, 0.16, 0.24, 0.32, 0.4, 0.32, 0.24, 0.16, 0.08, 0];

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <svg
        width={180 * scale}
        height={60 * scale}
        viewBox="0 0 180 60"
        fill="none"
        role="img"
        aria-label="Loading"
      >
        <style>{`
          .rf-wave { animation: rf-wave 1s ease-in-out infinite; transform-origin: center; }
          @keyframes rf-wave {
            0%, 100% { transform: scaleY(0.3); }
            50%      { transform: scaleY(1); }
          }
        `}</style>
        <g transform="translate(0 30)">
          {bars.map((bar, i) => (
            <rect
              key={i}
              className="rf-wave"
              x={bar.x}
              y={-bar.h}
              width="6"
              height={bar.h * 2}
              rx="3"
              fill="var(--accent, #C8FF3D)"
              style={{ animationDelay: `${delays[i]}s` }}
            />
          ))}
        </g>
      </svg>
      {label && <span className="text-xs text-muted font-medium">{label}</span>}
    </div>
  );
}
