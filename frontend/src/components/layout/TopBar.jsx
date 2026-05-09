import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TopBar({ title, subtitle, showNotification = true }) {
  return (
    <div className="flex items-start justify-between px-5 pt-2 pb-4 lg:hidden">
      <div>
        {subtitle && <div className="kicker">{subtitle}</div>}
        {title && <h1 className="text-[26px] font-semibold tracking-tight mt-1.5">{title}</h1>}
      </div>
      {showNotification && (
        <Link to="/settings" className="relative w-10 h-10 rounded-full bg-surface border border-hairline flex items-center justify-center">
          <Bell size={18} />
          <div className="absolute top-2 right-2 w-[7px] h-[7px] rounded-full bg-accent" />
        </Link>
      )}
    </div>
  );
}
