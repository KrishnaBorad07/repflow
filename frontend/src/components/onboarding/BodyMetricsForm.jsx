import { Minus, Plus } from 'lucide-react';

function MetricInput({ label, value, onChange, min, max, step = 1, unit, placeholder }) {
  const numVal = parseFloat(value) || 0;

  const increment = () => {
    const next = Math.min(numVal + step, max);
    onChange(String(next));
  };

  const decrement = () => {
    const next = Math.max(numVal - step, min);
    onChange(String(next));
  };

  const handleChange = (e) => {
    const raw = e.target.value;
    // Allow empty string (user clearing field) or valid numbers
    if (raw === '' || raw === '-') {
      onChange(raw);
      return;
    }
    const num = parseFloat(raw);
    if (!isNaN(num)) {
      onChange(raw);
    }
  };

  const handleBlur = () => {
    // Clamp value on blur
    if (value === '' || value === '-') return;
    const num = parseFloat(value);
    if (isNaN(num)) return;
    const clamped = Math.max(min, Math.min(max, num));
    onChange(String(clamped));
  };

  return (
    <div>
      <label className="block text-xs text-muted mb-2 tracking-normal">{label}</label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={decrement}
          className="w-11 h-[50px] rounded-xl bg-surface border border-hairline flex items-center justify-center text-muted hover:text-text hover:border-accent/30 transition-colors shrink-0"
        >
          <Minus size={16} />
        </button>
        <div className="relative flex-1">
          <input
            type="text"
            inputMode="decimal"
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="w-full h-[50px] bg-surface border border-hairline rounded-xl px-3.5 text-center text-[17px] font-semibold font-mono text-text placeholder:text-dim outline-none transition-colors focus:border-accent/50 tabular-nums"
          />
          {unit && value && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-dim">{unit}</span>
          )}
        </div>
        <button
          type="button"
          onClick={increment}
          className="w-11 h-[50px] rounded-xl bg-surface border border-hairline flex items-center justify-center text-muted hover:text-text hover:border-accent/30 transition-colors shrink-0"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

export default function BodyMetricsForm({ metrics, onChange, errors = {} }) {
  const update = (field) => (val) => onChange({ ...metrics, [field]: val });

  return (
    <div className="flex flex-col gap-5">
      <MetricInput
        label="Age"
        value={metrics.age}
        onChange={update('age')}
        min={13}
        max={100}
        step={1}
        unit="yrs"
        placeholder="21"
      />
      <div className="grid grid-cols-2 gap-3">
        <MetricInput
          label="Height"
          value={metrics.height}
          onChange={update('height')}
          min={100}
          max={250}
          step={1}
          unit="cm"
          placeholder="175"
        />
        <MetricInput
          label="Weight"
          value={metrics.weight}
          onChange={update('weight')}
          min={30}
          max={250}
          step={0.5}
          unit="kg"
          placeholder="72"
        />
      </div>
      <MetricInput
        label="Body fat % (optional)"
        value={metrics.bodyFat}
        onChange={update('bodyFat')}
        min={3}
        max={60}
        step={0.5}
        unit="%"
        placeholder="15"
      />
      {errors.metrics && <p className="text-bad text-xs">{errors.metrics}</p>}
    </div>
  );
}
