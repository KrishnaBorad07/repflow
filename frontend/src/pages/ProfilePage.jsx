import { useNavigate } from 'react-router-dom';
import { Settings, ChevronRight, Dumbbell, Clock, Flame, TrendingUp } from 'lucide-react';
import ProfileHeader from '../components/profile/ProfileHeader';
import AchievementGallery from '../components/profile/AchievementGallery';
import Card from '../components/common/Card';
import useAuthStore from '../store/authStore';
import { mockAchievements } from '../utils/mockData';
import { FITNESS_GOALS, EXPERIENCE_LEVELS, EQUIPMENT_OPTIONS } from '../utils/constants';

/** Map backend IDs to readable labels */
const getLabel = (options, id) => options.find((o) => o.id === id)?.label || id || '—';

const statItems = (user) => [
  { icon: Dumbbell, label: 'Total workouts', value: user.totalWorkouts ?? 0 },
  { icon: Clock, label: 'Total hours', value: user.totalHours ?? 0 },
  { icon: Flame, label: 'Current streak', value: `${user.streak ?? 0} days` },
  { icon: TrendingUp, label: 'Volume lifted', value: `${((user.totalVolumeKg ?? 0) / 1000).toFixed(0)}t` },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="px-5 pt-2 pb-6 lg:p-8 lg:max-w-[800px] lg:mx-auto">
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

      {/* Training info from onboarding */}
      {user.onboarding_completed && (
        <div className="mt-5">
          <h2 className="text-sm font-semibold mb-3">Training profile</h2>
          <Card className="divide-y divide-hairline">
            <InfoRow label="Goal" value={getLabel(FITNESS_GOALS, user.goal)} />
            <InfoRow label="Experience" value={getLabel(EXPERIENCE_LEVELS, user.experience_level)} />
            <InfoRow label="Equipment" value={getLabel(EQUIPMENT_OPTIONS, user.workout_environment)} />
            <InfoRow label="Schedule" value={`${user.available_days ?? '—'} days / week · ${user.session_duration_min ?? '—'} min`} />
            <InfoRow label="Age / Height / Weight" value={`${user.age ?? '—'} yrs · ${user.height_cm ?? '—'} cm · ${user.weight_kg ?? '—'} kg`} />
          </Card>
        </div>
      )}

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

function InfoRow({ label, value }) {
  return (
    <div className="px-4 py-3 flex items-center justify-between">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
