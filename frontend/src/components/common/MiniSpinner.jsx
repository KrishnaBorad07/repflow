/**
 * RepFlow — Inline / Micro Spinners
 * Small spinners for buttons, chips, and inline use.
 *
 * Variants:
 * - "ring"  — progress ring (default), 16px
 * - "plate" — plate-style arc spinner, 20px
 * - "dots"  — 3 pulsing dots, 24px wide
 * - "bar"   — mini barbell lift, 24px
 *
 * @param {"ring"|"plate"|"dots"|"bar"} variant
 * @param {number} size - Override default size
 * @param {string} color - Override accent color (for dark-on-light buttons)
 * @param {string} className
 */
export default function MiniSpinner({ variant = 'ring', size, color, className = '' }) {
  const accent = color || 'var(--accent, #C8FF3D)';
  const track = color ? `${color}33` : 'var(--hairline, #262932)';

  if (variant === 'ring') {
    const s = size || 16;
    return (
      <svg width={s} height={s} viewBox="0 0 64 64" fill="none" className={className} role="img" aria-label="Loading">
        <style>{`
          .rf-mini-ring { stroke-dasharray: 188; stroke-dashoffset: 188; animation: rf-mini-ringfill 2s cubic-bezier(.65,.05,.35,1) infinite; transform: rotate(-90deg); transform-origin: 32px 32px; }
          @keyframes rf-mini-ringfill { 0% { stroke-dashoffset: 188; } 65% { stroke-dashoffset: 20; } 100% { stroke-dashoffset: -188; } }
        `}</style>
        <circle cx="32" cy="32" r="28" stroke={track} strokeWidth="6" fill="none" />
        <circle className="rf-mini-ring" cx="32" cy="32" r="28" stroke={accent} strokeWidth="6" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  if (variant === 'plate') {
    const s = size || 20;
    return (
      <svg width={s} height={s} viewBox="0 0 64 64" fill="none" className={className} role="img" aria-label="Loading">
        <style>{`
          .rf-mini-plate { animation: rf-mini-platespin 1.6s cubic-bezier(.65,.05,.35,1) infinite; transform-origin: 32px 32px; }
          @keyframes rf-mini-platespin { 0% { transform: rotate(0); } 100% { transform: rotate(360deg); } }
        `}</style>
        <g className="rf-mini-plate">
          <circle cx="32" cy="32" r="28" stroke={track} strokeWidth="5" fill="none" />
          <circle cx="32" cy="32" r="28" stroke={accent} strokeWidth="5" fill="none" strokeDasharray="40 200" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  if (variant === 'dots') {
    const s = size || 24;
    return (
      <svg width={s} height={s * 0.5} viewBox="0 0 64 32" fill="none" className={className} role="img" aria-label="Loading">
        <style>{`
          .rf-mini-dot { animation: rf-mini-dotpulse 1.4s ease-in-out infinite; transform-origin: center; }
          .rf-mini-dot-1 { animation-delay: 0s; }
          .rf-mini-dot-2 { animation-delay: 0.2s; }
          .rf-mini-dot-3 { animation-delay: 0.4s; }
          @keyframes rf-mini-dotpulse {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
            40%            { transform: scale(1.2); opacity: 1; }
          }
        `}</style>
        <circle className="rf-mini-dot rf-mini-dot-1" cx="10" cy="16" r="5" fill={accent} />
        <circle className="rf-mini-dot rf-mini-dot-2" cx="32" cy="16" r="5" fill={accent} />
        <circle className="rf-mini-dot rf-mini-dot-3" cx="54" cy="16" r="5" fill={accent} />
      </svg>
    );
  }

  if (variant === 'bar') {
    const s = size || 24;
    return (
      <svg width={s} height={s} viewBox="0 0 64 64" fill="none" className={className} role="img" aria-label="Loading">
        <style>{`
          .rf-mini-bar { animation: rf-mini-barlift 1.6s ease-in-out infinite; transform-origin: center; }
          @keyframes rf-mini-barlift { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        `}</style>
        <g className="rf-mini-bar">
          <rect x="14" y="44" width="6" height="14" rx="1.5" fill={accent} />
          <rect x="44" y="44" width="6" height="14" rx="1.5" fill={accent} />
          <rect x="20" y="48" width="24" height="3" rx="1.5" fill={accent} />
        </g>
      </svg>
    );
  }

  return null;
}

/**
 * LiveChip — A pulsing "LIVE" indicator chip.
 * Use for: real-time workout tracking, live CV feedback.
 */
export function LiveChip({ text = 'LIVE', className = '' }) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-xs ${className}`}
      style={{ background: 'var(--accent-soft, rgba(200,255,61,0.1))', color: 'var(--accent, #C8FF3D)' }}
    >
      <svg width="10" height="10" viewBox="0 0 10 10">
        <style>{`
          .rf-live-pulse { animation: rf-live-pulse 1.6s ease-in-out infinite; }
          @keyframes rf-live-pulse {
            0%, 30%, 70%, 100% { transform: scale(1); opacity: 0.6; }
            40%, 60%           { transform: scale(1.6); opacity: 1; }
          }
        `}</style>
        <circle className="rf-live-pulse" cx="5" cy="5" r="4" fill="var(--accent, #C8FF3D)" />
      </svg>
      {text}
    </div>
  );
}
