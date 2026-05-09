const prompts = [
  'Why is my squat stalling?',
  'Suggest a deload week',
  'How can I improve my bench?',
  'What should I eat post-workout?',
];

export default function SuggestedPrompts({ onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {prompts.map((prompt) => (
        <button
          key={prompt}
          onClick={() => onSelect(prompt)}
          className="px-3 py-2 rounded-xl bg-surface border border-hairline text-xs text-muted hover:text-text hover:border-accent/30 transition-colors"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
