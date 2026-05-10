/**
 * RepFlow Loader — 02 · Plate Spin
 * A realistic weight plate spinning with a progress arc.
 * Use for: generating plan, calculating 1RM, fetching session — default in-app spinner.
 *
 * @param {number} size - Overall size (default 120)
 * @param {string} className - Additional CSS classes
 * @param {string} label - Optional loading text below
 */
export default function PlateSpinLoader({ size = 120, className = '', label }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        role="img"
        aria-label="Loading"
      >
        <style>{`
          .rf-plate { animation: rf-plate-spin 1.6s cubic-bezier(.65,.05,.35,1) infinite; transform-origin: 50px 50px; }
          @keyframes rf-plate-spin { 0% { transform: rotate(0); } 100% { transform: rotate(360deg); } }
        `}</style>
        <defs>
          <radialGradient id="rfPlateBody" cx="0.5" cy="0.5" r="0.55">
            <stop offset="0%" stopColor="#1A1D24" />
            <stop offset="70%" stopColor="#0F1115" />
            <stop offset="100%" stopColor="#0A0B0D" />
          </radialGradient>
        </defs>
        <g className="rf-plate">
          {/* Outer rim */}
          <circle cx="50" cy="50" r="44" fill="var(--bg, #0A0B0D)" stroke="var(--accent, #C8FF3D)" strokeWidth="3" />
          {/* Knurled edge marks */}
          <g stroke="var(--accent, #C8FF3D)" strokeWidth="0.8" opacity="0.55">
            <line x1="50" y1="6" x2="50" y2="11" />
            <line x1="65" y1="9" x2="63.5" y2="13.7" />
            <line x1="78" y1="17" x2="75" y2="21" />
            <line x1="88" y1="29" x2="84" y2="32" />
            <line x1="93" y1="44" x2="88" y2="45.5" />
            <line x1="93" y1="56" x2="88" y2="54.5" />
            <line x1="88" y1="71" x2="84" y2="68" />
            <line x1="78" y1="83" x2="75" y2="79" />
            <line x1="65" y1="91" x2="63.5" y2="86.3" />
            <line x1="50" y1="94" x2="50" y2="89" />
            <line x1="35" y1="91" x2="36.5" y2="86.3" />
            <line x1="22" y1="83" x2="25" y2="79" />
            <line x1="12" y1="71" x2="16" y2="68" />
            <line x1="7" y1="56" x2="12" y2="54.5" />
            <line x1="7" y1="44" x2="12" y2="45.5" />
            <line x1="12" y1="29" x2="16" y2="32" />
            <line x1="22" y1="17" x2="25" y2="21" />
            <line x1="35" y1="9" x2="36.5" y2="13.7" />
          </g>
          {/* Inner plate face */}
          <circle cx="50" cy="50" r="38" fill="url(#rfPlateBody)" stroke="var(--hairline, #262932)" strokeWidth="0.8" />
          <circle cx="50" cy="50" r="34" fill="none" stroke="var(--hairline-2, #1F222A)" strokeWidth="0.6" />
          {/* Progress arc on plate */}
          <circle cx="50" cy="50" r="34" stroke="var(--accent, #C8FF3D)" strokeWidth="2.5" fill="none" strokeDasharray="60 220" strokeLinecap="round" opacity="0.9" />
          {/* 3 grip cutouts */}
          <g fill="var(--bg, #0A0B0D)" stroke="var(--hairline, #262932)" strokeWidth="0.6">
            <ellipse cx="50" cy="22" rx="3" ry="6" />
            <ellipse cx="74.25" cy="64" rx="3" ry="6" transform="rotate(120 74.25 64)" />
            <ellipse cx="25.75" cy="64" rx="3" ry="6" transform="rotate(-120 25.75 64)" />
          </g>
          {/* Weight label */}
          <circle cx="50" cy="50" r="14" fill="var(--accent, #C8FF3D)" />
          <circle cx="50" cy="50" r="14" fill="none" stroke="var(--bg, #0A0B0D)" strokeWidth="0.8" opacity="0.4" />
          <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fontFamily="'JetBrains Mono', monospace" fontWeight="600" fontSize="9" fill="var(--bg, #0A0B0D)" letterSpacing="0.5">45</text>
          <text x="50" y="58" textAnchor="middle" dominantBaseline="central" fontFamily="'JetBrains Mono', monospace" fontWeight="500" fontSize="3.5" fill="var(--bg, #0A0B0D)" letterSpacing="1" opacity="0.7">LB</text>
          {/* Center bar hole */}
          <circle cx="50" cy="50" r="3" fill="var(--bg, #0A0B0D)" />
          <circle cx="50" cy="50" r="3" fill="none" stroke="var(--accent, #C8FF3D)" strokeWidth="0.6" opacity="0.5" />
        </g>
      </svg>
      {label && <span className="text-xs text-muted font-medium">{label}</span>}
    </div>
  );
}
