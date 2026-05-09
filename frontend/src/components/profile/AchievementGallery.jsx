import AchievementBadge from './AchievementBadge';

export default function AchievementGallery({ achievements }) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {achievements.map((achievement) => (
        <AchievementBadge key={achievement.id} achievement={achievement} />
      ))}
    </div>
  );
}
