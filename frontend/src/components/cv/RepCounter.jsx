/**
 * Live rep counter overlay shown during camera-mode workouts (Spec 3.3).
 *
 * Sits at the top of the camera viewport. Shows current rep / target,
 * the last rep's quality (good / partial), and the running form score
 * if the analyzer has scored at least one rep.
 */
export default function RepCounter({ count = 0, target = 10, lastRep = null, formScore = null }) {
  const goodFraction = target > 0 ? Math.min(count / target, 1) : 0;

  return (
    <div className="bg-background/85 backdrop-blur-md border border-hairline rounded-pill px-4 py-1.5 flex items-center gap-3 shadow-lg">
      <div className="flex items-baseline gap-1 font-mono">
        <span className="text-[26px] font-bold text-accent tabular-nums leading-none">{count}</span>
        <span className="text-[14px] text-muted">/ {target}</span>
      </div>

      {/* Progress bar */}
      <div className="w-[60px] h-1 rounded-full bg-elevated overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-200"
          style={{ width: `${goodFraction * 100}%` }}
        />
      </div>

      {lastRep && (
        <div
          className={`text-[10px] font-semibold tracking-wider uppercase ${
            lastRep.score >= 8 ? 'text-good' : lastRep.score >= 5 ? 'text-warn' : 'text-bad'
          }`}
        >
          {lastRep.isPartial ? 'Partial' : 'Good'}
        </div>
      )}

      {formScore != null && (
        <div className="text-[11px] font-mono text-muted">
          <span className="text-text font-semibold">{formScore.toFixed(1)}</span>/10
        </div>
      )}
    </div>
  );
}
