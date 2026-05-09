import { useState } from 'react';
import { X } from 'lucide-react';

const commonInjuries = ['Lower back', 'Knee', 'Shoulder', 'Wrist', 'Neck', 'Hip', 'Ankle', 'Elbow'];

export default function InjurySelector({ selected = [], onChange }) {
  const [custom, setCustom] = useState('');

  const toggle = (injury) => {
    onChange(selected.includes(injury) ? selected.filter((i) => i !== injury) : [...selected, injury]);
  };

  const addCustom = () => {
    if (custom.trim() && !selected.includes(custom.trim())) {
      onChange([...selected, custom.trim()]);
      setCustom('');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {commonInjuries.map((injury) => (
          <button
            key={injury}
            onClick={() => toggle(injury)}
            className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
              selected.includes(injury) ? 'bg-accent/[0.08] text-accent border-accent/40' : 'bg-surface text-muted border-hairline'
            }`}
          >
            {injury}
          </button>
        ))}
      </div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {selected.map((item) => (
            <span key={item} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-accent/10 text-accent text-xs font-medium">
              {item}
              <button onClick={() => toggle(item)}><X size={12} /></button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCustom()}
          placeholder="Add other..."
          className="flex-1 h-11 bg-surface border border-hairline rounded-xl px-3 text-sm text-text placeholder:text-dim outline-none focus:border-accent/50"
        />
      </div>
    </div>
  );
}
