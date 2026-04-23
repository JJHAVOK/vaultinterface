'use client';
import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, Copy, Check, RotateCcw, ChevronRight } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  loading?: boolean;
  toolCards?: string[];
}

const STORAGE_KEY = 'vault_assistant_history';

const STARTERS = [
  'Analyze my portfolio risk',
  'What is my largest sector exposure?',
  'Suggest rebalancing based on my allocation',
  'Which holdings have the highest unrealized gains?',
  'How does my portfolio compare to the S&P 500?',
];

const FOLLOW_UPS: Record<string, string[]> = {
  default: ['Show me my risk metrics', 'How can I reduce volatility?', 'What are my tax implications?'],
  risk: ['What is my Sharpe ratio?', 'How does my beta compare?', 'Show drawdown history'],
  sector: ['Rebalance my tech exposure', 'Add defensive sector exposure', 'Compare to benchmark allocation'],
  performance: ['Break down by time period', 'Show benchmark comparison', 'What drove the gains?'],
};

const TOOL_MESSAGES: Record<string, string[]> = {
  risk: ['🔍 Analyzing portfolio risk metrics...', '📊 Computing Sharpe & Sortino ratios...', '⚡ Checking correlation matrix...'],
  sector: ['🗂 Loading sector allocation data...', '📈 Comparing to benchmark weights...'],
  default: ['🔍 Querying portfolio data...', '💹 Fetching live prices...', '🧮 Running calculations...'],
};

function ToolCard({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 8, border: '1px solid var(--border)', fontSize: 12, color: 'var(--text-secondary)', animation: 'fadeIn 0.3s ease', marginBottom: 4 }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-cyan)', animation: 'pulse-dot 1.5s infinite', flexShrink: 0 }} />
      {text}
    </div>
  );
}

function renderMarkdown(content: string): React.ReactNode {
  return content.split('\n').map((line, i) => {
    if (line.startsWith('### ')) return <div key={i} style={{ fontWeight: 700, fontSize: 14, marginTop: 12, marginBottom: 4, color: 'var(--accent-cyan)' }}>{line.slice(4)}</div>;
    if (line.startsWith('## ')) return <div key={i} style={{ fontWeight: 700, fontSize: 15, marginTop: 14, marginBottom: 6 }}>{line.slice(3)}</div>;
    if (line.startsWith('**') && line.endsWith('**')) return <div key={i} style={{ fontWeight: 700, marginTop: 10, marginBottom: 4 }}>{line.slice(2, -2)}</div>;
    if (line.startsWith('- ')) {
      const text = line.slice(2).replace(/\*\*(.*?)\*\*/g, '$1');
      return <div key={i} style={{ paddingLeft: 16, marginBottom: 3, display: 'flex', gap: 6 }}><span style={{ color: 'var(--accent-cyan)', flexShrink: 0 }}>•</span><span>{text}</span></div>;
    }
    if (line.startsWith('_') && line.endsWith('_')) return <div key={i} style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: 10, fontSize: 12 }}>{line.slice(1, -1)}</div>;
    if (line.trim() === '') return <div key={i} style={{ height: 6 }} />;
    const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return <div key={i} dangerouslySetInnerHTML={{ __html: formatted }} style={{ marginBottom: 3, lineHeight: 1.6 }} />;
  });
}

export default function AssistantPage() {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [{ id: '0', role: 'assistant', content: "Hello! I'm your AI financial advisor. I have full context of your portfolio — $208,813 across 10 positions with a +43.87% all-time return.\n\nI can analyze your risk, suggest rebalancing strategies, explain your tax exposure, and answer any market questions. What would you like to explore?" }];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState(STARTERS);

  // Persist conversation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.filter(m => !m.loading))); } catch {}
    }
  }, [messages]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const getToolCards = (text: string): string[] => {
    const lower = text.toLowerCase();
    if (lower.includes('risk') || lower.includes('sharpe') || lower.includes('volatility')) return TOOL_MESSAGES.risk;
    if (lower.includes('sector') || lower.includes('allocation')) return TOOL_MESSAGES.sector;
    return TOOL_MESSAGES.default;
  };

  const getSuggestions = (response: string): string[] => {
    const lower = response.toLowerCase();
    if (lower.includes('risk') || lower.includes('sharpe')) return FOLLOW_UPS.risk;
    if (lower.includes('sector') || lower.includes('allocation')) return FOLLOW_UPS.sector;
    if (lower.includes('performance') || lower.includes('return')) return FOLLOW_UPS.performance;
    return FOLLOW_UPS.default;
  };

  const sendMessage = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput('');
    setSuggestions([]);

    const toolCards = getToolCards(content);
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content };
    const loadingMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: '', loading: true, toolCards };
    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setLoading(true);

    const conversationHistory = messages
      .filter(m => !m.loading && m.id !== '0')
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `You are a professional financial AI assistant for Vault, an institutional portfolio management platform. 

Portfolio context:
- Total value: $208,813 (+43.87% all-time return)
- Today: +$1,847 (+0.89%)
- Top holdings: AAPL ($42,847, +38.5%), NVDA ($31,204, +130.25%), MSFT ($28,941, +67.3%), GOOGL ($22,180, +41.2%), AMZN ($18,744, +52.1%)
- Underperformer: TSLA (-22.83%)
- Sector concentration: Technology 48.4%, Financials 18.2%, Consumer 15.1%, Healthcare 10.8%, Energy 7.5%
- Risk metrics: Sharpe 1.84, Beta 1.12, Alpha +4.2%, Max Drawdown -18.4%, Volatility 22.1%

Be concise, professional, and data-driven. Use markdown formatting with **bold** for key numbers. Use bullet points for lists. Start responses directly without preamble.`,
          messages: [...conversationHistory, { role: 'user', content }],
        }),
      });
      const data = await response.json();
      const aiContent = data.content?.[0]?.text || "I'm having trouble connecting right now. Please try again.";
      setMessages(prev => prev.map(m => m.loading ? { ...m, content: aiContent, loading: false, toolCards: undefined } : m));
      setSuggestions(getSuggestions(aiContent));
    } catch {
      setMessages(prev => prev.map(m => m.loading ? { ...m, content: "Connection issue. Your portfolio: **$208,813** (+43.87%). Top position: **NVDA** (+130.25%). Sharpe ratio: **1.84**. Would you like me to analyze a specific aspect?", loading: false, toolCards: undefined } : m));
      setSuggestions(FOLLOW_UPS.default);
    }
    setLoading(false);
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard?.writeText(content);
    setCopiedId(id);
    toast.success('Copied', 'Response copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearHistory = () => {
    const initial = [{ id: '0', role: 'assistant' as const, content: "Conversation cleared. How can I help you with your portfolio today?" }];
    setMessages(initial);
    setSuggestions(STARTERS);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(initial)); } catch {}
    toast.info('Cleared', 'Conversation history cleared');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 116px)', animation: 'fadeIn 0.4s ease' }}>
      {/* Header */}
      <div className="page-header" style={{ flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--accent-cyan), #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={16} color="#fff" />
          </div>
          <div>
            <div className="page-title">AI Assistant</div>
            <div style={{ fontSize: 11, color: 'var(--positive)' }}>● Portfolio context loaded · {messages.filter(m => !m.loading).length} messages</div>
          </div>
        </div>
        <button onClick={clearHistory} className="btn btn-ghost" style={{ fontSize: 11 }}>
          <RotateCcw size={11} /> Clear history
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 16 }}>
        {messages.map(m => (
          <div key={m.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: m.role === 'user' ? 'linear-gradient(135deg, var(--accent-cyan), #7c3aed)' : 'var(--bg-elevated)' }}>
              {m.role === 'user' ? <User size={14} color="#fff" /> : <Bot size={14} style={{ color: 'var(--accent-cyan)' }} />}
            </div>
            <div style={{ maxWidth: '75%' }}>
              {/* Tool cards for loading message */}
              {m.loading && m.toolCards && (
                <div style={{ marginBottom: 8 }}>
                  {m.toolCards.map((card, i) => <ToolCard key={i} text={card} />)}
                </div>
              )}
              <div style={{
                padding: '12px 16px', borderRadius: m.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                background: m.role === 'user' ? 'var(--accent-cyan-dim)' : 'var(--bg-secondary)',
                border: '1px solid var(--border)', fontSize: 13, lineHeight: 1.6, position: 'relative',
              }}>
                {m.loading ? (
                  <div style={{ display: 'flex', gap: 4, padding: '2px 0' }}>
                    {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-cyan)', animation: `pulse-dot 1.2s ease ${i * 0.2}s infinite` }} />)}
                  </div>
                ) : (
                  renderMarkdown(m.content)
                )}
              </div>
              {/* Copy button for assistant messages */}
              {m.role === 'assistant' && !m.loading && (
                <button onClick={() => copyMessage(m.id, m.content)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '4px 0', marginTop: 2 }}>
                  {copiedId === m.id ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Suggested follow-ups */}
        {suggestions.length > 0 && !loading && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingLeft: 42 }}>
            {suggestions.map(s => (
              <button key={s} onClick={() => sendMessage(s)}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, transition: 'all 150ms' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-cyan)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent-cyan)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}>
                <ChevronRight size={10} /> {s}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          className="vault-input"
          placeholder="Ask about your portfolio, markets, risk, or get AI-driven insights..."
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