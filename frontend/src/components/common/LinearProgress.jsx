/**
 * RepFlow — Linear Progress Bar (Indeterminate)
 * An indeterminate progress bar with the accent color sliding across.
 * Use for: top-of-page progress during AI plan generation, video upload, model warmup.
 *
 * @param {string} className - Additional CSS classes
 */
export default function LinearProgress({ className = '' }) {
  return (
    <div
      className={`relative h-1 w-full rounded-full overflow-hidden ${className}`}
      style={{ background: 'var(--hairline, #262932)' }}
      role="progressbar"
      aria-label="Loading"
    >
      <style>{`
        .rf-linear-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 35%;
          border-radius: 9999px;
          background: var(--accent, #C8FF3D);
          animation: rf-linmove 1.6s ease-in-out infinite;
        }
        @keyframes rf-linmove {
          0%   { left: -40%; width: 35%; }
          50%  { left: 35%;  width: 50%; }
          100% { left: 105%; width: 35%; }
        }
      `}</style>
      <div className="rf-linear-fill" />
    </div>
  );
}
