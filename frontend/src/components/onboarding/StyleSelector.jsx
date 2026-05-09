const styles = [
  { id: 'strength', label: 'Strength', description: 'Heavy compound lifts' },
  { id: 'hypertrophy', label: 'Hypertrophy', description: 'High volume, moderate weight' },
  { id: 'hiit', label: 'HIIT', description: 'High intensity intervals' },
  { id: 'calisthenics', label: 'Calisthenics', description: 'Bodyweight mastery' },
  { id: 'yoga', label: 'Yoga', description: 'Flexibility and mindfulness' },
  { id: 'crossfit', label: 'CrossFit-style', description: 'Varied functional movements' },
];

export default function StyleSelector({ selected = [], onChange }) {
  const toggle = (id) => {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {styles.map((style) => {
        const isActive = selected.includes(style.id);
        return (
          <button
            key={style.id}
            onClick={() => toggle(style.id)}
            className={`p-4 rounded-[14px] border text-left transition-colors ${
              isActive ? 'bg-accent/[0.08] border-accent/40' : 'bg-surface border-hairline'
            }`}
          >
            <div className={`text-sm font-semibold ${isActive ? 'text-accent' : 'text-text'}`}>{style.label}</div>
            <div className="text-xs text-muted mt-1">{style.description}</div>
          </button>
        );
      })}
    </div>
  );
}
