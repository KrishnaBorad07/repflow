import Card from '../common/Card';

export default function StatCard({ label, value, unit, delta, up }) {
  return (
    <Card className="p-3.5">
      <div className="text-[11px] text-muted">{label}</div>
      <div className="flex items-baseline gap-1 mt-1.5">
        <span className="font-mono tabular-nums text-[22px] font-semibold">{value}</span>
        <span className="text-[11px] text-dim">{unit}</span>
      </div>
      {delta && (
        <div className={`mt-2 text-[11px] font-mono ${up ? 'text-good' : 'text-bad'}`}>
          {up ? '↑' : '↓'} {delta}
        </div>
      )}
    </Card>
  );
}
