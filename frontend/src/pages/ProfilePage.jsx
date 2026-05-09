import { useNavigate } from 'react-router-dom';
import { Settings, ChevronRight, Dumbbell, Clock, Flame, TrendingUp } from 'lucide-react';
import ProfileHeader from '../components/profile/ProfileHeader';
import AchievementGallery from '../components/profile/AchievementGallery';
import Card from '../components/common/Card';
import useAuthStore from '../store/authStore';
import { mockAchievements } from '../utils/mockData';

const statItems = (user) => [
  { icon: Dumbbell, label: 'Total workouts', value: user.totalWorkouts },
  { icon: Clock, label: 'Total hours', value: user.totalHours },
  { icon: Flame, label: 'Current streak', value: `${user.streak} days` },
  { icon: TrendingUp, label: 'Volume lifted', value: `${(user.totalVolumeKg / 1000).toFixed(0)}t` },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div className="px-5 pt-2 pb-6 lg:p-8 lg:max-w-[800px]">
      <div className="flex items-center justify-between mb-3.5">
        <h1 className="text-[26px] font-semibold tracking-tight">Profile</h1>
        <button onClick={() => navigate('/settings')} className="w-9 h-9 rounded-full bg-surface border border-hairline flex items-center justify-center">
          <Settings size={18} />
        </button>
      </div>

      <ProfileHeader user={user} />

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2.5 mt-3.5">
        {statItems(user).map(({ icon: Icon, label, value }) => (
          <Card key={label} className="p-3.5">
            <div className="flex items-center gap-2 text-muted mb-1.5">
              <Icon size={14} />
              <span className="text-xs">{label}</span>
            </div>
            <div className="text-lg font-semibold font-mono">{value}</div>
          </Card>
        ))}
      </div>

      {/* Achievements */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Achievements</h2>
          <span className="text-xs text-muted">{mockAchievements.filter((a) => a.earned).length} of {mockAchievements.length}</span>
        </div>
        <AchievementGallery achievements={mockAchievements} />
      </div>

      {/* Quick links */}
      <div className="mt-5 space-y-1.5">
        {[
          { label: 'Workout history', path: '/progress' },
          { label: 'Training preferences', path: '/settings' },
          { label: 'Subscription & billing', path: '/settings' },
        ].map((item) => (
          <Card key={item.label} className="p-3.5 flex items-center justify-between cursor-pointer" onClick={() => navigate(item.path)}>
            <span className="text-sm font-medium">{item.label}</span>
            <ChevronRight size={16} className="text-dim" />
          </Card>
        ))}
      </div>
    </div>
  );
}
