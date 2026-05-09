import { useState, useRef, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import ChatBubble from '../components/chat/ChatBubble';
import ChatInput from '../components/chat/ChatInput';
import SuggestedPrompts from '../components/chat/SuggestedPrompts';
import { mockChatMessages } from '../utils/mockData';

export default function ChatPage() {
  const [messages, setMessages] = useState(mockChatMessages);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text) => {
    const userMsg = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setShowSuggestions(false);

    // Simulate AI response
    setTimeout(() => {
      const aiMsg = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: "That's a great question! Based on your recent training data, I'd recommend focusing on progressive overload while maintaining proper form. Let me analyze your workout history and get back to you with specific suggestions.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-84px)] lg:h-screen lg:max-w-[800px]">
      {/* Header */}
      <div className="px-5 pt-2 pb-3 border-b border-hairline-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-good flex items-center justify-center">
            <Sparkles size={16} className="text-accent-ink" />
          </div>
          <div>
            <h1 className="text-[17px] font-semibold">AI Coach</h1>
            <p className="text-xs text-muted">Powered by your training data</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
      </div>

      {/* Suggestions */}
      {showSuggestions && (
        <div className="px-5 pb-2">
          <SuggestedPrompts onSelect={handleSend} />
        </div>
      )}

      {/* Input */}
      <ChatInput onSend={handleSend} />
    </div>
  );
}
