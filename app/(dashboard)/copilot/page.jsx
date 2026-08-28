'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, MessageSquare } from 'lucide-react';

export default function CopilotPage() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am PaySynapse Copilot. How can I help you investigate your financial data today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'ai', content: data.response, mocked: data.mocked }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: `Error: ${data.error}` }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Network error communicating with Copilot.' }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'Show me today\'s exceptions',
    'What is the current match rate?',
    'Summarize financial risk exposure',
  ];

  return (
    <div className="flex-1 p-6 pt-5 min-h-screen flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">AI Copilot</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
            Natural language interface for your reconciliation engine.
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm flex flex-col overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(s); }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-[var(--muted)] text-[#528FF0] border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors duration-150"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                <div className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center ${
                  msg.role === 'user' 
                    ? 'bg-[#528FF0] text-white ml-2.5' 
                    : 'bg-[var(--muted)] text-[var(--muted-foreground)] mr-2.5'
                }`}>
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-3.5 py-2.5 rounded-lg text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-[#528FF0] text-white rounded-tr-sm' 
                      : 'bg-[var(--muted)] text-[var(--foreground)] rounded-tl-sm border border-[var(--border)]'
                  }`}>
                    {msg.content}
                  </div>
                  {msg.mocked && (
                    <span className="text-[10px] text-[var(--muted-foreground)] mt-1 uppercase tracking-wider font-semibold bg-[var(--muted)] px-1.5 py-0.5 rounded-md">Mock Mode</span>
                  )}
                </div>

              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex flex-row max-w-[80%]">
                <div className="flex-shrink-0 w-7 h-7 rounded-md bg-[var(--muted)] text-[var(--muted-foreground)] mr-2.5 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="px-4 py-3 rounded-lg text-sm bg-[var(--muted)] rounded-tl-sm border border-[var(--border)] flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#528FF0] animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#528FF0] animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#528FF0] animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={endOfMessagesRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-[var(--muted)] border-t border-[var(--border)]">
          <form onSubmit={handleSend} className="relative flex items-center">
            <div className="relative flex-1">
              <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                placeholder="Ask Copilot about your transactions, exceptions, or financial health..."
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg pl-10 pr-12 py-2.5 text-sm focus:outline-none focus:border-[#528FF0] transition-colors duration-150"
              />
            </div>
            <button 
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#528FF0] hover:bg-[#4080E0] text-white p-2 rounded-md disabled:opacity-30 transition-colors duration-150"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-[var(--muted-foreground)]">Copilot provides operational insights, not definitive financial truth. Verify numbers in the ledger.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
