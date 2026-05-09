import { Trophy } from 'lucide-react';
import Card from '../common/Card';

export default function WorkoutComplete({ stats }) {
  return (
    <div className="text-center">
      <div className="w-[88px] h-[88px] rounded-full bg-accent inline-flex items-center justify-center shadow-[0_0_60px_rgba(200,255,61,0.5)]">
        <Trophy size={42} className="text-accent-ink" strokeWidth={2} />
      </div>
      <h2 className="text-[32px] font-semibold tracking-tight mt-6">Workout complete</h2>
      <p className="text-muted mt-2">{stats?.name || 'Push Day'} · {stats?.exercises || 6} exercises</p>

      <div className="grid grid-cols-2 gap-2 mt-8">
        <StatCard label="Duration" value={stats?.duration || '46:22'} unit="min" />
        <StatCard label="Volume" value={stats?.volume || '4,820'} unit="kg" />
        <StatCard label="Avg form" value={stats?.formScore || '8.3'} unit="/ 10" />
        <StatCard label="Calories" value={stats?.calories || '412'} unit="kcal" />
      </div>
    </div>
  );
}

function StatCard({ label, value, unit }) {
  return (
    <Card className="p-3.5">
      <div className="text-[11px] text-muted">{label}</div>
      <div className="flex items-baseline gap-1 mt-1.5">
        <span className="font-mono tabular-nums text-2xl font-semibold tracking-tight">{value}</span>
        <span className="text-[11px] text-dim">{unit}</span>
      </div>
    </Card>
  );
}
