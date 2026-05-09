import Input from '../common/Input';

export default function BodyMetricsForm({ metrics, onChange }) {
  const update = (field) => (e) => onChange({ ...metrics, [field]: e.target.value });

  return (
    <div className="flex flex-col gap-3.5">
      <Input label="Age" type="number" value={metrics.age || ''} onChange={update('age')} placeholder="25" />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Height (cm)" type="number" value={metrics.height || ''} onChange={update('height')} placeholder="178" />
        <Input label="Weight (kg)" type="number" value={metrics.weight || ''} onChange={update('weight')} placeholder="75" />
      </div>
      <Input label="Body fat % (optional)" type="number" value={metrics.bodyFat || ''} onChange={update('bodyFat')} placeholder="15" />
    </div>
  );
}
