'use client';
import { useState } from 'react';
import { WATCHLISTS, WATCHLIST_ITEMS } from '@/lib/mock-data';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Plus, Bookmark, X } from 'lucide-react';
import { useWatchlistStore } from '@/lib/store';

export default function WatchlistsPage() {
  const { activeWatchlistId, setActiveWatchlist } = useWatchlistStore();
  const [lists, setLists] = useState(WATCHLISTS);
  const [newName, setNewName] = useState('');

  const active = lists.find(l => l.id === activeWatchlistId) || lists[0];

  const addList = () => {
    if (!newName.trim()) return;
    setLists(prev => [...prev, { id: `wl${Date.now()}`, name: newName, tickers: [], createdAt: new Date().toISOString() }]);
    setNewName('');
  };

  return (
    <div style={{ display: 'flex', gap: 16, animation: 'fadeIn 0.4s ease', height: 'calc(100vh - 120px)' }}>
      {/* Sidebar */}
      <div className="vault-card" style={{ width: 220, padding: 16, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>My Watchlists</div>
        {lists.map(l => (
          <button key={l.id} onClick={() => setActiveWatchlist(l.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all 150ms',
              background: activeWatchlistId === l.id ? 'var(--accent-cyan-dim)' : 'transparent',
              color: activeWatchlistId === l.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            }}>
            <Bookmark size={12} />
            <span style={{ fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.name}</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{l.tickers.length}</span>
          </button>
        ))}
        <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
          <input value={newName} onChange={e => setNewName(e.target.value)} className="vault-input" placeholder="New list..." style={{ flex: 1 }} onKeyDown={e => e.key === 'Enter' && addList()} />
          <button onClick={addList} className="btn btn-primary" style={{ padding: '6px 8px' }}><Plus size={12} /></button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <div>
            <div className="page-title">{active?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{active?.tickers.length} tickers</div>
          </div>
          <button className="btn btn-ghost"><Plus size={12} /> Add Ticker</button>
        </div>

        <div className="vault-card" style={{ overflow: 'hidden' }}>
          <table className="vault-table">
            <thead>
              <tr>
                <th>Ticker</th>
                <th style={{ textAlign: 'right' }}>Price</th>
                <th style={{ textAlign: 'right' }}>Change</th>
                <th style={{ textAlign: 'right' }}>% Change</th>
                <th style={{ textAlign: 'right' }}>Market Cap</th>
                <th style={{ textAlign: 'right' }}>Volume</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {WATCHLIST_ITEMS.map(w => (
                <tr key={w.ticker}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{w.ticker}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{w.name}</div>
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatCurrency(w.price)}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: w.change >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
                    {w.change >= 0 ? '+' : ''}{formatCurrency(Math.abs(w.change))}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={`badge ${w.changePct >= 0 ? 'badge-positive' : 'badge-negative'}`}>{formatPercent(w.changePct)}</span>
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{w.marketCap}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{w.volume}</td>
                  <td>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, display: 'flex' }}>
                      <X size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}