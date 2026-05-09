export default function AchievementBadge({ achievement }) {
  const { name, icon, earned, progress } = achievement;

  return (
    <div className={`p-3 rounded-[14px] border text-center ${
      earned ? 'bg-surface border-hairline' : 'bg-background border-hairline-2 opacity-60'
    }`}>
      <div className={`text-[28px] ${earned ? '' : 'grayscale'}`}>{icon}</div>
      <div className="text-[11px] font-semibold mt-1.5">{name}</div>
      {!earned && progress !== undefined && (
        <div className="mt-2 h-[3px] bg-elevated rounded-full overflow-hidden">
          <div className="h-full bg-dim rounded-full" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}
