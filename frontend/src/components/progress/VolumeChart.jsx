import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { mockProgressData } from '../../utils/mockData';
import Card from '../common/Card';

export default function VolumeChart() {
  return (
    <Card className="p-4">
      <div className="text-[13px] font-semibold mb-4">Weekly volume</div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={mockProgressData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#262932" />
          <XAxis dataKey="week" stroke="#5A5E69" fontSize={11} />
          <YAxis stroke="#5A5E69" fontSize={11} />
          <Tooltip
            contentStyle={{ background: '#13151A', border: '1px solid #262932', borderRadius: 10, fontSize: 12 }}
            labelStyle={{ color: '#8B8F9A' }}
          />
          <Bar dataKey="volume" fill="#C8FF3D" radius={[4, 4, 0, 0]} name="Volume (kg)" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
