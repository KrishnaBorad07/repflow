import { mockMuscleBalance } from '../../utils/mockData';
import Card from '../common/Card';

export default function MuscleGroupRadar() {
  const { labels, data } = mockMuscleBalance;
  const cx = 110, cy = 90, r = 70;

  const getPoint = (index, scale = 1) => {
    const angle = (index / labels.length) * Math.PI * 2 - Math.PI / 2;
    return [cx + Math.cos(angle) * r * scale, cy + Math.sin(angle) * r * scale];
  };

  const dataPoints = data.map((val, i) => getPoint(i, val));
  const outerPoints = labels.map((_, i) => getPoint(i, 1));

  return (
    <Card className="p-4">
      <div className="text-[13px] font-semibold mb-3">Muscle balance</div>
      <svg width="100%" height="180" viewBox="0 0 220 180">
        {[0.33, 0.66, 1].map((s, i) => (
          <polygon
            key={i}
            points={labels.map((_, j) => getPoint(j, s).join(',')).join(' ')}
            fill="none" stroke="#262932" strokeWidth="1"
          />
        ))}
        <polygon
          points={dataPoints.map((p) => p.join(',')).join(' ')}
          fill="rgba(200,255,61,0.18)" stroke="#C8FF3D" strokeWidth="1.5"
        />
        {outerPoints.map((p, i) => (
          <text
            key={i} x={p[0]} y={p[1]}
            dy={p[1] < cy - 20 ? -6 : p[1] > cy + 20 ? 14 : 4}
            textAnchor={p[0] > cx + 10 ? 'start' : p[0] < cx - 10 ? 'end' : 'middle'}
            fontSize="10" fill="#8B8F9A"
          >
            {labels[i]}
          </text>
        ))}
      </svg>
      <div className="mt-2 p-2.5 rounded-[10px] bg-warn/[0.08] border border-warn/25 text-xs text-warn">
        Back volume is 40% lower than chest — consider more pulls.
      </div>
    </Card>
  );
}
