import { useState } from 'react';
import { Send } from 'lucide-react';

export default function ChatInput({ onSend }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <div className="px-5 py-3.5 bg-background/90 backdrop-blur-xl border-t border-hairline-2">
      <div className="flex items-center gap-2 h-12 bg-surface border border-hairline rounded-3xl pl-4 pr-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask RepFlow…"
          className="flex-1 bg-transparent text-sm text-text placeholder:text-dim outline-none"
        />
        <button
          onClick={handleSend}
          className="w-9 h-9 rounded-full bg-accent flex items-center justify-center shrink-0"
        >
          <Send size={16} className="text-accent-ink" strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}
