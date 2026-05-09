import { ChevronRight } from 'lucide-react';

export default function ChatBubble({ message }) {
  const isAI = message.role === 'assistant';

  return (
    <div className={`max-w-[85%] ${isAI ? 'self-start' : 'self-end'}`}>
      <div className={`px-3.5 py-3 rounded-2xl text-sm leading-relaxed ${
        isAI
          ? 'bg-surface border border-hairline text-text rounded-bl-sm'
          : 'bg-accent text-accent-ink rounded-br-sm'
      }`}>
        {message.content}
        {message.suggestion && (
          <div className="mt-2.5 p-2.5 rounded-[10px] bg-accent/[0.06] border border-accent/25">
            <div className="text-[11px] text-accent font-semibold tracking-wider">{message.suggestion.title}</div>
            <div className="text-[13px] mt-1.5">{message.suggestion.body}</div>
            <button className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-accent text-accent-ink rounded-lg text-xs font-semibold">
              {message.suggestion.actionLabel} <ChevronRight size={12} strokeWidth={3} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
