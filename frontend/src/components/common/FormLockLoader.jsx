/**
 * RepFlow Loader — 09 · Form Lock (Skeleton Joints)
 * A stick figure with joints that light up in sequence as bones draw in.
 * Use for: CV camera warmup, model loading, calibration.
 *
 * @param {number} size - Overall size (default 100)
 * @param {string} className - Additional CSS classes
 * @param {string} label - Optional loading text below
 */
export default function FormLockLoader({ size = 100, className = '', label }) {
  const scale = size / 100;

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <svg
        width={80 * scale}
        height={100 * scale}
        viewBox="0 0 80 100"
        fill="none"
        role="img"
        aria-label="Loading"
      >
        <style>{`
          .rf-joint { animation: rf-lock 2s ease-in-out infinite; }
          .rf-joint-1 { animation-delay: 0s; }
          .rf-joint-2 { animation-delay: 0.1s; }
          .rf-joint-3 { animation-delay: 0.2s; }
          .rf-joint-4 { animation-delay: 0.3s; }
          .rf-joint-5 { animation-delay: 0.4s; }
          .rf-joint-6 { animation-delay: 0.5s; }
          @keyframes rf-lock {
            0%, 40%, 100% { fill: var(--dim, #5A5E69); r: 2; }
            50%, 90%      { fill: var(--accent, #C8FF3D); r: 3.5; }
          }
          .rf-bone {
            stroke-dasharray: 60;
            stroke-dashoffset: 60;
            animation: rf-bonefill 2s ease-in-out infinite;
          }
          .rf-bone-1 { animation-delay: 0.05s; }
          .rf-bone-2 { animation-delay: 0.15s; }
          .rf-bone-3 { animation-delay: 0.25s; }
          .rf-bone-4 { animation-delay: 0.35s; }
          .rf-bone-5 { animation-delay: 0.45s; }
          @keyframes rf-bonefill {
            0%, 40%, 100% { stroke-dashoffset: 60; }
            50%, 90%      { stroke-dashoffset: 0; }
          }
        `}</style>
        {/* Bones */}
        <line className="rf-bone rf-bone-1" x1="40" y1="22" x2="40" y2="50" stroke="var(--accent, #C8FF3D)" strokeWidth="2" strokeLinecap="round" />
        <line className="rf-bone rf-bone-2" x1="40" y1="34" x2="22" y2="46" stroke="var(--accent, #C8FF3D)" strokeWidth="2" strokeLinecap="round" />
        <line className="rf-bone rf-bone-3" x1="40" y1="34" x2="58" y2="46" stroke="var(--accent, #C8FF3D)" strokeWidth="2" strokeLinecap="round" />
        <line className="rf-bone rf-bone-4" x1="40" y1="50" x2="30" y2="78" stroke="var(--accent, #C8FF3D)" strokeWidth="2" strokeLinecap="round" />
        <line className="rf-bone rf-bone-5" x1="40" y1="50" x2="50" y2="78" stroke="var(--accent, #C8FF3D)" strokeWidth="2" strokeLinecap="round" />
        {/* Joints */}
        <circle className="rf-joint rf-joint-1" cx="40" cy="18" r="2" fill="var(--dim, #5A5E69)" />
        <circle className="rf-joint rf-joint-2" cx="40" cy="34" r="2" fill="var(--dim, #5A5E69)" />
        <circle className="rf-joint rf-joint-3" cx="22" cy="46" r="2" fill="var(--dim, #5A5E69)" />
        <circle className="rf-joint rf-joint-4" cx="58" cy="46" r="2" fill="var(--dim, #5A5E69)" />
        <circle className="rf-joint rf-joint-5" cx="30" cy="78" r="2" fill="var(--dim, #5A5E69)" />
        <circle className="rf-joint rf-joint-6" cx="50" cy="78" r="2" fill="var(--dim, #5A5E69)" />
      </svg>
      {label && <span className="text-xs text-muted font-medium">{label}</span>}
    </div>
  );
}
