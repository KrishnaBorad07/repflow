import { ChevronRight } from 'lucide-react';
import Card from '../common/Card';

export default function ProfileHeader({ user, onClick }) {
  return (
    <Card className="p-4 flex items-center gap-3.5 cursor-pointer" onClick={onClick}>
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-good flex items-center justify-center text-accent-ink font-bold text-[22px] font-mono">
        {user.initials}
      </div>
      <div className="flex-1">
        <div className="text-[17px] font-semibold">{user.name}</div>
        <div className="text-xs text-muted mt-0.5">Member since {user.memberSince}</div>
      </div>
      <ChevronRight size={18} className="text-dim" />
    </Card>
  );
}
