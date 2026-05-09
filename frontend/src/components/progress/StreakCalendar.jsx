import Card from '../common/Card';
import { mockHeatmapData } from '../../utils/mockData';

export default function StreakCalendar({ streak = 12 }) {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-3.5">
        <span className="text-[13px] font-semibold">Consistency · May</span>
        <span className="text-xs text-accent font-semibold">🔥 {streak} days</span>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {mockHeatmapData.map((intensity, i) => (
          <div
            key={i}
            className="aspect-square rounded"
            style={{
              background: intensity === 0 ? 'var(--elevated)' : `rgba(200,255,61,${intensity})`,
            }}
          />
        ))}
      </div>
    </Card>
  );
}
