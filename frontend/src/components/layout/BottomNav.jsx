import { NavLink, useNavigate } from 'react-router-dom';
import { Home, CalendarDays, PlayCircle, TrendingUp, User } from 'lucide-react';

const tabs = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/plan', label: 'Plan', icon: CalendarDays },
  { to: null, label: '', icon: PlayCircle, primary: true },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[84px] bg-background/85 backdrop-blur-xl border-t border-hairline-2 flex items-start justify-around px-3 pt-2.5 z-50 lg:hidden">
      {tabs.map((tab) => {
        if (tab.primary) {
          return (
            <button
              key="workout"
              onClick={() => navigate('/quick-workout')}
              className="relative -top-[18px]"
            >
              <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center shadow-[0_8px_24px_rgba(200,255,61,0.35),0_0_0_6px_var(--bg)]">
                <tab.icon size={26} className="text-accent-ink" strokeWidth={2} />
              </div>
            </button>
          );
        }
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 pt-1 ${isActive ? 'text-text' : 'text-dim'}`
            }
          >
            {({ isActive }) => (
              <>
                <tab.icon size={22} strokeWidth={isActive ? 2 : 1.6} />
                <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{tab.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
