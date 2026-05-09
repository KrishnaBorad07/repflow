import { Link, useNavigate } from 'react-router-dom';
import { Bell, Plus, PlayCircle, Dumbbell, Check, Sparkles, ChevronRight } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import useAuthStore from '../store/authStore';
import { mockWeekDots, mockWorkoutHistory } from '../utils/mockData';
import useMediaQuery from '../hooks/useMediaQuery';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className={`${isDesktop ? 'p-8 max-w-[1100px] mx-auto' : 'px-5 pt-2 pb-6'}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="kicker">{dayNames[today.getDay()]} · {monthNames[today.getMonth()]} {today.getDate()}</div>
          <h1 className={`font-semibold tracking-tight mt-1.5 ${isDesktop ? 'text-[32px]' : 'text-[26px]'}`}>{greeting}, {user?.name?.split(' ')[0] || 'Jash'}</h1>
        </div>
        <div className="flex gap-2.5">
          {isDesktop && <Button variant="secondary" size="md"><Bell size={16} /></Button>}
          {isDesktop && <Link to="/quick-workout"><Button variant="primary" size="md"><Plus size={16} /> Quick workout</Button></Link>}
          {!isDesktop && (
            <Link to="/settings" className="relative w-10 h-10 rounded-full bg-surface border border-hairline flex items-center justify-center">
              <Bell size={18} />
              <div className="absolute top-2 right-2 w-[7px] h-[7px] rounded-full bg-accent" />
            </Link>
          )}
        </div>
      </div>

      <div className={isDesktop ? 'grid grid-cols-[1.4fr_1fr] gap-4' : 'space-y-5'}>
        {/* Today's workout card */}
        <div className="bg-gradient-to-br from-accent to-[#A8DC2F] text-accent-ink rounded-[20px] p-6 relative overflow-hidden">
          <div className="absolute -right-[30px] -top-[30px] w-[180px] h-[180px] rounded-full bg-white/[0.18]" />
          <div className="relative">
            <div className="text-xs font-semibold tracking-widest uppercase opacity-70">Today</div>
            <div className={`font-semibold tracking-tight mt-1.5 ${isDesktop ? 'text-[38px]' : 'text-[30px]'}`}>Push Day</div>
            <div className="flex gap-4 mt-3 text-[13px] font-mono opacity-85">
              <span>6 exercises</span><span>·</span><span>~45 min</span>{isDesktop && <><span>·</span><span>14 sets</span></>}
            </div>
            <div className="flex gap-1.5 mt-3.5">
              {['Chest', 'Shoulders', 'Triceps'].map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-pill bg-accent-ink/15 text-xs font-medium">{t}</span>
              ))}
            </div>
            <button onClick={() => navigate('/workout/today')} className={`mt-5 ${isDesktop ? 'h-12 px-[22px]' : 'w-full h-[50px]'} rounded-xl bg-accent-ink text-accent font-semibold text-[15px] flex items-center justify-center gap-2`}>
              <PlayCircle size={18} fill="currentColor" /> Start workout
            </button>
          </div>
        </div>

        {/* Right column */}
        <div className={isDesktop ? 'flex flex-col gap-4' : 'space-y-4'}>
          {/* Week strip */}
          <Card className="p-[18px]">
            <div className="flex justify-between mb-3.5">
              <span className="kicker">This week</span>
              <span className="text-xs text-accent font-semibold">🔥 {user?.streak || 12}-day streak</span>
            </div>
            <div className="flex justify-between">
              {mockWeekDots.map((x, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${
                    x.status === 'done' ? 'bg-accent text-accent-ink' :
                    x.status === 'today' ? 'border-2 border-accent text-accent bg-transparent' :
                    x.status === 'rest' ? 'border border-dashed border-hairline text-dim bg-transparent' :
                    'bg-elevated text-dim border border-hairline'
                  }`}>
                    {x.status === 'done' ? <Check size={14} strokeWidth={3} /> : x.day}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Mini stats */}
          <div className="grid grid-cols-2 gap-2">
            <MiniStat label="VOLUME" value="12,450" unit="kg" />
            <MiniStat label="FORM AVG" value="8.2" unit="/10" />
          </div>
        </div>
      </div>

      {/* Second row */}
      <div className={`mt-4 ${isDesktop ? 'grid grid-cols-[1.4fr_1fr] gap-4' : 'space-y-4'}`}>
        {/* AI insight */}
        <Card className="p-5 relative overflow-hidden">
          <div className="absolute -top-5 -right-5 w-[120px] h-[120px] rounded-full bg-[radial-gradient(circle,rgba(200,255,61,0.15),transparent_70%)]" />
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-accent" />
            <span className="kicker !text-accent">AI Coach</span>
          </div>
          <div className="text-sm leading-relaxed">Bench press has plateaued for 2 weeks. Try adding pause reps this week to break through.</div>
          <Link to="/chat" className="inline-block mt-3.5 text-xs text-accent font-semibold">Chat with coach →</Link>
        </Card>

        {/* Recent activity */}
        <Card className="p-5">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold">Recent activity</span>
            <Link to="/progress" className="text-xs text-muted">View all</Link>
          </div>
          <div className="space-y-0">
            {mockWorkoutHistory.slice(0, isDesktop ? 4 : 3).map((w, i) => (
              <div key={w.id} className={`flex items-center gap-3 py-3 ${i > 0 ? 'border-t border-hairline-2' : ''}`}>
                <div className="w-10 h-10 rounded-[10px] bg-elevated flex items-center justify-center">
                  <Dumbbell size={18} className="text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{w.name}</div>
                  <div className="text-xs text-muted font-mono mt-0.5">{new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {w.duration} min</div>
                </div>
                <div className="text-right">
                  <div className="font-mono tabular-nums text-sm font-semibold text-accent">{w.formScore}</div>
                  <div className="text-[10px] text-dim">FORM</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function MiniStat({ label, value, unit }) {
  return (
    <Card className="p-3.5">
      <div className="text-[10px] text-muted tracking-wider">{label}</div>
      <div className="flex items-baseline gap-1 mt-2">
        <span className="font-mono tabular-nums text-[22px] font-semibold">{value}</span>
        <span className="text-[11px] text-dim">{unit}</span>
      </div>
    </Card>
  );
}
