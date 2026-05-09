import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Moon, Sun, Bell, Shield, CreditCard, LogOut, ChevronRight } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';

const settingsSections = [
  {
    title: 'Preferences',
    items: [
      { icon: Bell, label: 'Notifications', detail: 'Push & email' },
      { icon: Shield, label: 'Privacy', detail: 'Data & permissions' },
    ],
  },
  {
    title: 'Account',
    items: [
      { icon: CreditCard, label: 'Subscription', detail: 'Pro plan' },
    ],
  },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="px-5 pt-2 pb-6 lg:p-8 lg:max-w-[600px]">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-surface border border-hairline flex items-center justify-center">
          <ChevronLeft size={18} />
        </button>
        <h1 className="text-[22px] font-semibold tracking-tight">Settings</h1>
      </div>

      {/* Theme toggle */}
      <Card className="p-4 flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-3">
          {isDark ? <Moon size={18} /> : <Sun size={18} />}
          <span className="text-sm font-medium">Dark mode</span>
        </div>
        <button
          onClick={toggleTheme}
          className={`relative w-[46px] h-[26px] rounded-full transition-colors ${isDark ? 'bg-accent' : 'bg-elevated'}`}
        >
          <div className={`absolute top-[3px] w-5 h-5 rounded-full bg-white shadow transition-transform ${isDark ? 'left-[23px]' : 'left-[3px]'}`} />
        </button>
      </Card>

      {/* Setting sections */}
      {settingsSections.map((section) => (
        <div key={section.title} className="mb-3.5">
          <h3 className="text-xs text-muted font-semibold tracking-wider mb-2 px-1">{section.title.toUpperCase()}</h3>
          <Card className="divide-y divide-hairline">
            {section.items.map(({ icon: Icon, label, detail }) => (
              <button key={label} className="w-full p-4 flex items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <Icon size={18} className="text-muted" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <div className="flex items-center gap-2 text-dim">
                  <span className="text-xs">{detail}</span>
                  <ChevronRight size={14} />
                </div>
              </button>
            ))}
          </Card>
        </div>
      ))}

      {/* Logout */}
      <div className="mt-6">
        <Button variant="danger" size="lg" fullWidth onClick={handleLogout}>
          <LogOut size={16} /> Log out
        </Button>
      </div>

      <p className="text-center text-xs text-dim mt-6">RepFlow v1.0.0</p>
    </div>
  );
}
