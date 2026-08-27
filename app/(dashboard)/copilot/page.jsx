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
    <div className="flex-1 p-8 pt-6 min-h-screen flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in-up">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            <Sparkles className="w-8 h-8 text-indigo-500 mr-3" />
            AI Copilot
          </h2>
          <p className="text-muted-foreground mt-1">
            Natural language interface for your reconciliation engine.
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 rounded-2xl border border-border/50 bg-white dark:bg-slate-950/60 backdrop-blur-sm shadow-sm flex flex-col overflow-hidden animate-fade-in-up stagger-2 relative">
        {/* Subtle gradient border glow */}
        <div className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, transparent 50%, rgba(168,85,247,0.1) 100%)' }} />
        
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 relative">
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 mt-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(s); }}
                  className="text-xs px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/30 hover:bg-indigo-100 dark:hover:bg-indigo-950/30 transition-all duration-200 hover:shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`} style={{ animationDuration: '0.25s' }}>
              <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white ml-3' 
                    : 'bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-600 mr-3 dark:from-purple-900/50 dark:to-indigo-900/50 dark:text-purple-400'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-md shadow-lg shadow-indigo-500/10' 
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 rounded-tl-md border border-border/50'
                  }`}>
                    {msg.content}
                  </div>
                  {msg.mocked && (
                    <span className="text-[10px] text-slate-400 mt-1.5 uppercase tracking-wider font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">Mock Mode</span>
                  )}
                </div>

              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex flex-row max-w-[80%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-600 mr-3 dark:from-purple-900/50 dark:to-indigo-900/50 dark:text-purple-400 flex items-center justify-center shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="px-5 py-4 rounded-2xl text-sm bg-slate-50 dark:bg-slate-800/60 rounded-tl-md border border-border/50 flex items-center space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={endOfMessagesRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-50/80 dark:bg-slate-900/30 border-t border-border/50 backdrop-blur-sm">
          <form onSubmit={handleSend} className="relative flex items-center">
            <div className="relative flex-1">
              <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                placeholder="Ask Copilot about your transactions, exceptions, or financial health..."
                className="w-full bg-white dark:bg-slate-900 border border-border/50 rounded-2xl pl-11 pr-14 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 dark:focus:border-indigo-700 shadow-sm transition-all duration-200"
              />
            </div>
            <button 
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-2.5 rounded-xl disabled:opacity-30 transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-indigo-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-center mt-2.5">
            <span className="text-[10px] text-slate-400">Copilot provides operational insights, not definitive financial truth. Verify numbers in the ledger.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
