import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { mockProgressData } from '../../utils/mockData';
import Card from '../common/Card';

export default function StrengthChart() {
  return (
    <Card className="p-4">
      <div className="text-[13px] font-semibold mb-4">Strength progression</div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={mockProgressData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#262932" />
          <XAxis dataKey="week" stroke="#5A5E69" fontSize={11} />
          <YAxis stroke="#5A5E69" fontSize={11} />
          <Tooltip
            contentStyle={{ background: '#13151A', border: '1px solid #262932', borderRadius: 10, fontSize: 12 }}
            labelStyle={{ color: '#8B8F9A' }}
          />
          <Line type="monotone" dataKey="benchPress" stroke="#C8FF3D" strokeWidth={2} dot={{ fill: '#C8FF3D', r: 3 }} name="Bench" />
          <Line type="monotone" dataKey="squat" stroke="#7BD88F" strokeWidth={2} dot={{ fill: '#7BD88F', r: 3 }} name="Squat" />
          <Line type="monotone" dataKey="deadlift" stroke="#7AA9FF" strokeWidth={2} dot={{ fill: '#7AA9FF', r: 3 }} name="Deadlift" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
