'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/lib/store';
import { Search, LayoutDashboard, TrendingUp, BarChart3, ArrowLeftRight, Globe, BookmarkIcon, Bell, FileText, Bot, User, Settings, X } from 'lucide-react';

const PAGES = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Portfolio', href: '/dashboard/portfolio', icon: TrendingUp },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Transactions', href: '/dashboard/transactions', icon: ArrowLeftRight },
  { label: 'Markets', href: '/dashboard/markets', icon: Globe },
  { label: 'Screener', href: '/dashboard/screener', icon: Search },
  { label: 'Watchlists', href: '/dashboard/watchlists', icon: BookmarkIcon },
  { label: 'Alerts', href: '/dashboard/alerts', icon: Bell },
  { label: 'Reports', href: '/dashboard/reports', icon: FileText },
  { label: 'Assistant', href: '/dashboard/assistant', icon: Bot },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const TICKERS = ['AAPL', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'JPM', 'V', 'META', 'AMD', 'PLTR', 'COIN'];

export default function CommandPalette() {
  const { commandPaletteOpen, closeCommandPalette } = useUIStore();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        commandPaletteOpen ? closeCommandPalette() : useUIStore.getState().openCommandPalette();
      }
      if (e.key === 'Escape') closeCommandPalette();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [commandPaletteOpen, closeCommandPalette]);

  const filteredPages = PAGES.filter(p => p.label.toLowerCase().includes(query.toLowerCase()));
  const filteredTickers = query.length >= 1 ? TICKERS.filter(t => t.toLowerCase().includes(query.toLowerCase())) : [];
  const allResults = [...filteredPages, ...filteredTickers.map(t => ({ label: `View ${t}`, href: `/dashboard/screener?q=${t}`, icon: Search }))];

  const handleSelect = (item: typeof allResults[0]) => {
    router.push(item.href);
    closeCommandPalette();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, allResults.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === 'Enter' && allResults[selected]) handleSelect(allResults[selected]);
  };

  if (!commandPaletteOpen) return null;

  return (
    <>
      <div className="overlay-backdrop" style={{ zIndex: 50 }} onClick={closeCommandPalette} />
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 560, background: 'var(--bg-secondary)',
        border: '1px solid var(--border-bright)',
        borderRadius: 12, zIndex: 51,
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        overflow: 'hidden',
      }}>
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, tickers, actions..."
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 14 }}
          />
          <button onClick={closeCommandPalette} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 2 }}>
            <X size={14} />
          </button>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 360, overflowY: 'auto', padding: '8px' }}>
          {filteredPages.length > 0 && (
            <>
              <div style={{ padding: '4px 8px', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Pages</div>
              {filteredPages.map((item, i) => {
                const Icon = item.icon;
                const isSelected = i === selected;
                return (
                  <div
                    key={item.href}
                    onClick={() => handleSelect(item)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                      borderRadius: 6, cursor: 'pointer',
                      background: isSelected ? 'var(--accent-cyan-dim)' : 'transparent',
                      color: isSelected ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                      transition: 'all 150ms',
                    }}
                    onMouseEnter={() => setSelected(i)}
                  >
                    <Icon size={14} />
                    <span style={{ fontSize: 13 }}>{item.label}</span>
                  </div>
                );
              })}
            </>
          )}
          {filteredTickers.length > 0 && (
            <>
              <div style={{ padding: '8px 8px 4px', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Tickers</div>
              {filteredTickers.map((ticker, i) => {
                const idx = filteredPages.length + i;
                const isSelected = idx === selected;
                return (
                  <div
                    key={ticker}
                    onClick={() => handleSelect({ label: `View ${ticker}`, href: `/dashboard/screener?q=${ticker}`, icon: Search })}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                      borderRadius: 6, cursor: 'pointer',
                      background: isSelected ? 'var(--accent-cyan-dim)' : 'transparent',
                      color: isSelected ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                      transition: 'all 150ms',
                    }}
                    onMouseEnter={() => setSelected(idx)}
                  >
                    <Search size={14} />
                    <span style={{ fontSize: 13 }}>{ticker}</span>
                  </div>
                );
              })}
            </>
          )}
          {allResults.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No results for &ldquo;{query}&rdquo;</div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 16, padding: '8px 16px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)' }}>
          <span><kbd style={{ background: 'var(--bg-elevated)', padding: '1px 4px', borderRadius: 3, border: '1px solid var(--border)' }}>↑↓</kbd> navigate</span>
          <span><kbd style={{ background: 'var(--bg-elevated)', padding: '1px 4px', borderRadius: 3, border: '1px solid var(--border)' }}>↵</kbd> select</span>
          <span><kbd style={{ background: 'var(--bg-elevated)', padding: '1px 4px', borderRadius: 3, border: '1px solid var(--border)' }}>Esc</kbd> close</span>
        </div>
      </div>
    </>
  );
}
