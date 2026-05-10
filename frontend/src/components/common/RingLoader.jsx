/**
 * RepFlow Loader — 05 · Progress Ring
 * A circular progress ring that fills and resets.
 * Use for: pull-to-refresh, data sync, inline loading.
 *
 * @param {number} size - Overall size (default 64)
 * @param {string} className - Additional CSS classes
 * @param {string} label - Optional loading text below
 */
export default function RingLoader({ size = 64, className = '', label }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        role="img"
        aria-label="Loading"
      >
        <style>{`
          .rf-ring-track {
            stroke-dasharray: 188;
            stroke-dashoffset: 188;
            animation: rf-ringfill 2s cubic-bezier(.65,.05,.35,1) infinite;
            transform: rotate(-90deg);
            transform-origin: 32px 32px;
          }
          @keyframes rf-ringfill {
            0%   { stroke-dashoffset: 188; }
            65%  { stroke-dashoffset: 20; }
            100% { stroke-dashoffset: -188; }
          }
        `}</style>
        <circle cx="32" cy="32" r="30" stroke="var(--hairline, #262932)" strokeWidth="3" fill="none" />
        <circle className="rf-ring-track" cx="32" cy="32" r="30" stroke="var(--accent, #C8FF3D)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="32" cy="32" r="3" fill="var(--accent, #C8FF3D)" />
      </svg>
      {label && <span className="text-xs text-muted font-medium">{label}</span>}
    </div>
  );
}
