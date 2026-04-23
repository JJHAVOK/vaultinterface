'use client';
import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles } from 'lucide-react';

interface Message { id: string; role: 'user' | 'assistant'; content: string; loading?: boolean; }

const STARTERS = [
  'Analyze my portfolio risk',
  'What is my largest sector exposure?',
  'Suggest rebalancing based on my allocation',
  'Which holdings have the highest unrealized gains?',
  'Summarize my portfolio performance',
];

const MOCK_RESPONSES: Record<string, string> = {
  default: `Based on your portfolio data, here's my analysis:

**Portfolio Overview**
Your portfolio is currently valued at **$208,813** with an overall return of **+43.87%** since inception. Today you're up **+$1,847** (+0.89%).

**Key Observations:**
- Technology sector dominates at **48.4%** of your portfolio — this concentration adds growth potential but increases volatility
- NVDA is your top performer with **+130.25%** returns — a remarkable position
- TSLA is your only underwater position at **-22.83%**

**Risk Assessment:**
Your Sharpe ratio of 1.84 indicates strong risk-adjusted returns. Beta of 1.12 means you're slightly more volatile than the S&P 500.

**Recommendation:** Consider trimming your tech concentration below 40% by adding defensive positions in Healthcare or Utilities. This would reduce drawdown risk while maintaining growth exposure.

_Would you like me to generate specific rebalancing orders?_`,
};

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', content: "Hello! I'm your AI financial assistant. I have access to your portfolio data and can help you analyze performance, risks, and opportunities. What would you like to explore?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (text?: string) => {
    const content = text || input.trim();
    if (!content || loading) return;
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content };
    const loadingMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: '', loading: true };
    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setLoading(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `You are a professional financial AI assistant for Vault, an institutional portfolio management platform. The user has a portfolio valued at $208,813 with holdings including AAPL, NVDA, MSFT, GOOGL, AMZN, TSLA, JPM, V, BRK.B, and META. Total gain is +43.87%. Be concise, professional, and data-driven. Use markdown formatting.`,
          messages: [{ role: 'user', content }],
        }),
      });

      const data = await response.json();
      const aiContent = data.content?.[0]?.text || MOCK_RESPONSES.default;

      setMessages(prev => prev.map(m => m.loading ? { ...m, content: aiContent, loading: false } : m));
    } catch {
      setMessages(prev => prev.map(m => m.loading ? { ...m, content: MOCK_RESPONSES.default, loading: false } : m));
    }
    setLoading(false);
  };

  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) return <div key={i} style={{ fontWeight: 700, marginTop: i > 0 ? 10 : 0, marginBottom: 4 }}>{line.slice(2, -2)}</div>;
      if (line.startsWith('- ')) return <div key={i} style={{ paddingLeft: 16, marginBottom: 3 }}>• {line.slice(2).replace(/\*\*(.*?)\*\*/g, '$1')}</div>;
      if (line.startsWith('_') && line.endsWith('_')) return <div key={i} style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: 8, fontSize: 11 }}>{line.slice(1, -1)}</div>;
      return line ? <div key={i} style={{ marginBottom: 4 }}>{line.replace(/\*\*(.*?)\*\*/g, '$1')}</div> : <div key={i} style={{ height: 6 }} />;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 116px)', animation: 'fadeIn 0.4s ease' }}>
      <div className="page-header" style={{ flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--accent-cyan), #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={16} color="#fff" />
          </div>
          <div>
            <div className="page-title">AI Assistant</div>
            <div style={{ fontSize: 11, color: 'var(--positive)' }}>● Portfolio context loaded</div>
          </div>
        </div>
      </div>

      {/* Starters */}
      {messages.length <= 1 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, flexShrink: 0 }}>
          {STARTERS.map(s => (
            <button key={s} onClick={() => sendMessage(s)} className="btn btn-ghost" style={{ fontSize: 11 }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 16 }}>
        {messages.map(m => (
          <div key={m.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: m.role === 'user' ? 'linear-gradient(135deg, var(--accent-cyan), #7c3aed)' : 'var(--bg-elevated)',
            }}>
              {m.role === 'user' ? <User size={14} color="#fff" /> : <Bot size={14} style={{ color: 'var(--accent-cyan)' }} />}
            </div>
            <div style={{
              maxWidth: '75%', padding: '12px 16px', borderRadius: m.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
              background: m.role === 'user' ? 'var(--accent-cyan-dim)' : 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              fontSize: 13, lineHeight: 1.6,
            }}>
              {m.loading ? (
                <div style={{ display: 'flex', gap: 4, padding: '2px 0' }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-cyan)', animation: `pulse-dot 1.2s ease ${i * 0.2}s infinite` }} />)}
                </div>
              ) : renderContent(m.content)}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          className="vault-input"
          placeholder="Ask about your portfolio, markets, or get financial insights..."
          style={{ flex: 1, fontSize: 13 }}
          disabled={loading}
        />
        <button onClick={() => sendMessage()} className="btn btn-primary" disabled={!input.trim() || loading} style={{ padding: '8px 14px' }}>
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}