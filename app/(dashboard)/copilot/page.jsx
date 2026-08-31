'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, MessageSquare, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function CopilotPage() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am **PaySynapse Copilot**. How can I help you investigate your financial data and reconciliation exceptions today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (customMessage = null) => {
    const userMessage = (typeof customMessage === 'string' ? customMessage : input).trim();
    if (!userMessage || loading) return;

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
      
      if (res.ok && data.response) {
        setMessages(prev => [...prev, { role: 'ai', content: data.response, model: data.model }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'ai', 
          content: `⚠️ **Service Notice:** Google Gemini experienced high temporary traffic. Showing local ledger analysis instead.\n\n${data.response || 'Please retry your query.'}` 
        }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Network error communicating with Copilot. Please check your connection and retry.' }]);
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
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">AI Copilot</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-[#528FF0] dark:bg-blue-900/20 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#528FF0]" /> Google Gemini + Live Ledger Sync
            </span>
          </div>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
            Natural language interface for your reconciliation engine.
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm flex flex-col overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.length === 1 && (
            <div className="bg-[var(--muted)] p-4 rounded-xl border border-[var(--border)] mb-4">
              <span className="text-xs font-semibold text-[var(--foreground)] block mb-2">Suggested Inquiries:</span>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[var(--surface)] text-[#528FF0] border border-[var(--border)] hover:border-[#528FF0] hover:bg-[var(--surface-hover)] transition-all duration-150 shadow-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-[#528FF0] text-white ml-3' 
                    : 'bg-slate-900 text-blue-400 border border-slate-700 mr-3'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-[#528FF0] text-white rounded-tr-xs' 
                      : 'bg-[var(--muted)] text-[var(--foreground)] rounded-tl-xs border border-[var(--border)]'
                  }`}>
                    {msg.role === 'user' ? (
                      <div>{msg.content}</div>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none space-y-2 prose-p:leading-relaxed prose-headings:font-bold prose-headings:text-sm prose-ul:my-1 prose-li:my-0.5">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                  {msg.model && (
                    <span className="text-[9px] text-[var(--muted-foreground)] mt-1 uppercase tracking-wider font-mono">
                      Engine: {msg.model}
                    </span>
                  )}
                </div>

              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex flex-row max-w-[80%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-900 text-blue-400 border border-slate-700 mr-3 flex items-center justify-center">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="px-4 py-3 rounded-2xl text-sm bg-[var(--muted)] rounded-tl-xs border border-[var(--border)] flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-[#528FF0] animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-[#528FF0] animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-[#528FF0] animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={endOfMessagesRef} />
        </div>

        {/* Input Area */}
        <div className="p-3.5 bg-[var(--muted)] border-t border-[var(--border)]">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative flex items-center">
            <div className="relative flex-1">
              <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                placeholder="Ask Copilot about exceptions, match rate, or financial risk..."
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl pl-10 pr-12 py-3 text-sm focus:outline-none focus:border-[#528FF0] transition-colors duration-150 shadow-inner"
              />
            </div>
            <button 
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#528FF0] hover:bg-[#4080E0] text-white p-2.5 rounded-lg disabled:opacity-30 transition-colors duration-150 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-[var(--muted-foreground)]">Copilot answers using real-time ledger metrics and Google Gemini. Always verify critical accounting entries.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
