import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Plus, PlayCircle, Dumbbell, Check, Sparkles, CalendarOff } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import useAuthStore from '../store/authStore';
import usePlanStore from '../store/planStore';
import useMediaQuery from '../hooks/useMediaQuery';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { currentPlan, fetchPlan } = usePlanStore();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  useEffect(() => {
    if (!currentPlan) fetchPlan();
  }, []);

  const todayDayOfWeek = new Date().getDay() || 7; // 1=Mon...7=Sun
  const todayPlan = currentPlan?.days?.find((d) => d.dayName === ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][todayDayOfWeek - 1]);
  const isRestDay = !todayPlan || todayPlan.exerciseCount === 0;

  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  const totalExercises = currentPlan?.days?.reduce((sum, d) => sum + (d.exerciseCount || 0), 0) || 0;
  const workoutDays = currentPlan?.days?.filter((d) => d.exerciseCount > 0) || [];
  const completedDays = currentPlan?.days?.filter((d) => d.status === 'done') || [];

  return (
    <div className={`${isDesktop ? 'p-8 max-w-[1100px] mx-auto' : 'px-5 pt-2 pb-6'}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="kicker">{dayNames[today.getDay()]} · {monthNames[today.getMonth()]} {today.getDate()}</div>
          <h1 className={`font-semibold tracking-tight mt-1.5 ${isDesktop ? 'text-[32px]' : 'text-[26px]'}`}>{greeting}, {user?.name?.split(' ')[0] || 'there'}</h1>
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
        {!isRestDay ? (
          <div className="bg-gradient-to-br from-accent to-[#A8DC2F] text-accent-ink rounded-[20px] p-6 relative overflow-hidden">
            <div className="absolute -right-[30px] -top-[30px] w-[180px] h-[180px] rounded-full bg-white/[0.18]" />
            <div className="relative">
              <div className="text-xs font-semibold tracking-widest uppercase opacity-70">Today</div>
              <div className={`font-semibold tracking-tight mt-1.5 ${isDesktop ? 'text-[38px]' : 'text-[30px]'}`}>{todayPlan?.label || 'Workout'}</div>
              <div className="flex gap-4 mt-3 text-[13px] font-mono opacity-85">
                <span>{todayPlan?.exerciseCount || 0} exercises</span><span>·</span><span>{todayPlan?.duration || '—'}</span>
              </div>
              <div className="flex gap-1.5 mt-3.5 flex-wrap">
                {(todayPlan?.muscles || '').split(' · ').filter(Boolean).map((t) => (
                  <span key={t} className="px-2.5 py-1 rounded-pill bg-accent-ink/15 text-xs font-medium">{t}</span>
                ))}
              </div>
              <button onClick={() => navigate('/workout/today')} className={`mt-5 ${isDesktop ? 'h-12 px-[22px]' : 'w-full h-[50px]'} rounded-xl bg-accent-ink text-accent font-semibold text-[15px] flex items-center justify-center gap-2`}>
                <PlayCircle size={18} fill="currentColor" /> Start workout
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-surface border border-hairline rounded-[20px] p-6 flex flex-col items-center justify-center gap-3 min-h-[220px]">
            <CalendarOff size={40} className="text-muted" />
            <div className="text-lg font-semibold">Rest Day</div>
            <div className="text-sm text-muted text-center">Recovery & mobility — take it easy today</div>
            <Link to="/plan">
              <Button variant="secondary" size="md">View plan</Button>
            </Link>
          </div>
        )}

        {/* Right column */}
        <div className={isDesktop ? 'flex flex-col gap-4' : 'space-y-4'}>
          {/* Week strip */}
          <Card className="p-[18px]">
            <div className="flex justify-between mb-3.5">
              <span className="kicker">This week</span>
              <Link to="/plan" className="text-xs text-accent font-semibold">View plan →</Link>
            </div>
            <div className="flex justify-between">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, i) => {
                const planDay = currentPlan?.days?.find((d) => d.dayName === dayName);
                const isToday = dayName === ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][todayDayOfWeek - 1];
                const hasWorkout = planDay && planDay.exerciseCount > 0;
                const isDone = planDay?.status === 'done';

                return (
                  <div key={dayName} className="flex flex-col items-center gap-1.5">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${
                      isDone ? 'bg-accent text-accent-ink' :
                      isToday && hasWorkout ? 'border-2 border-accent text-accent bg-transparent' :
                      isToday && !hasWorkout ? 'border-2 border-accent text-accent bg-transparent' :
                      hasWorkout ? 'bg-accent/20 text-accent border border-accent/40' :
                      'border border-dashed border-hairline text-dim bg-transparent'
                    }`}>
                      {isDone ? <Check size={14} strokeWidth={3} /> : dayName.charAt(0)}
                    </div>
                    <span className={`text-[9px] font-mono uppercase ${isToday ? 'text-accent' : 'text-dim'}`}>{dayName}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Mini stats from plan */}
          <div className="grid grid-cols-2 gap-2">
            <MiniStat label="EXERCISES" value={totalExercises} unit="total" />
            <MiniStat label="COMPLETED" value={completedDays.length} unit={`/ ${workoutDays.length} days`} />
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
          <div className="text-sm leading-relaxed">
            {currentPlan
              ? `Your ${currentPlan.programName} plan has ${workoutDays.length} workout days this week. ${isRestDay ? 'Enjoy your rest day!' : 'Time to crush it!'}`
              : 'Generate a plan to get personalized AI coaching insights.'
            }
          </div>
          <Link to="/chat" className="inline-block mt-3.5 text-xs text-accent font-semibold">Chat with coach →</Link>
        </Card>

        {/* Upcoming workouts from plan */}
        <Card className="p-5">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold">Upcoming workouts</span>
            <Link to="/plan" className="text-xs text-muted">View plan</Link>
          </div>
          <div className="space-y-0">
            {currentPlan?.days?.filter((d) => d.exerciseCount > 0).slice(0, isDesktop ? 4 : 3).map((day, i) => (
              <div key={day.id} className={`flex items-center gap-3 py-3 ${i > 0 ? 'border-t border-hairline-2' : ''}`}>
                <div className="w-10 h-10 rounded-[10px] bg-elevated flex items-center justify-center">
                  <Dumbbell size={18} className="text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{day.label}</div>
                  <div className="text-xs text-muted font-mono mt-0.5">{day.muscles}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono tabular-nums text-sm font-semibold">{day.dayName}</div>
                  <div className="text-[10px] text-dim">{day.exerciseCount} ex · {day.duration}</div>
                </div>
              </div>
            ))}
            {(!currentPlan || workoutDays.length === 0) && (
              <div className="text-center py-6 text-sm text-muted">
                No plan yet — <Link to="/plan" className="text-accent font-semibold">generate one</Link>
              </div>
            )}
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
