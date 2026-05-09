import { NavLink } from 'react-router-dom';
import { Home, CalendarDays, PlayCircle, Search, TrendingUp, Sparkles, Settings } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const navItems = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/plan', label: 'Plan', icon: CalendarDays },
  { to: '/quick-workout', label: 'Workout', icon: PlayCircle },
  { to: '/library', label: 'Library', icon: Search },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/chat', label: 'AI Coach', icon: Sparkles },
];

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);

  return (
    <aside className="w-60 border-r border-hairline-2 flex flex-col p-4 h-screen sticky top-0">
      <NavLink to="/dashboard" className="flex items-center gap-2.5 px-2.5 pb-5 pt-2">
        <RepFlowLogo size={24} />
        <span className="text-base font-semibold">RepFlow</span>
      </NavLink>

      <nav className="flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-colors ${
                isActive ? 'bg-accent/10 text-accent' : 'text-muted hover:text-text hover:bg-elevated'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-3 border-t border-hairline-2">
        <NavLink to="/profile" className="flex items-center gap-2.5 p-3 rounded-[10px] hover:bg-elevated transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-good flex items-center justify-center text-accent-ink text-xs font-bold">
            {user?.initials || 'JP'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold truncate">{user?.name || 'Jash Patel'}</div>
            <div className="text-[11px] text-dim">{user?.plan || 'Pro'} · Week {user?.week || 3}</div>
          </div>
        </NavLink>
      </div>
    </aside>
  );
}

function RepFlowLogo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4 6 L12 3 L20 6 L20 12 C20 17 16 21 12 22 C8 21 4 17 4 12 Z" fill="#C8FF3D" />
      <path d="M9 11l2.5 3 4-5" stroke="#0A0B0D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
