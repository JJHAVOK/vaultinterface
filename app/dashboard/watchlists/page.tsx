'use client';
import { useState } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { WATCHLISTS, WATCHLIST_ITEMS } from '@/lib/mock-data';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { Plus, Bookmark, X, Share2, GripVertical } from 'lucide-react';
import { useWatchlistStore } from '@/lib/store';
import type { Watchlist } from '@/lib/types';

export default function WatchlistsPage() {
  const { activeWatchlistId, setActiveWatchlist } = useWatchlistStore();
  const [lists, setLists] = useState<Watchlist[]>(WATCHLISTS);
  const [newName, setNewName] = useState('');
  const [newTicker, setNewTicker] = useState('');
  const [dragOver, setDragOver] = useState<string | null>(null);

  const active = lists.find(l => l.id === activeWatchlistId) || lists[0];

  const addList = () => {
    if (!newName.trim()) { toast.error('Name required', 'Enter a name for the watchlist'); return; }
    const id = `wl${Date.now()}`;
    setLists(prev => [...prev, { id, name: newName.trim(), tickers: [], createdAt: new Date().toISOString() }]);
    setActiveWatchlist(id);
    setNewName('');
    toast.success('Watchlist created', `"${newName}" is ready`);
  };

  const addTicker = () => {
    const t = newTicker.trim().toUpperCase();
    if (!t) { toast.error('Ticker required', 'Enter a ticker symbol'); return; }
    if (active?.tickers.includes(t)) { toast.warning('Already added', `${t} is already in this watchlist`); return; }
    setLists(prev => prev.map(l => l.id === activeWatchlistId ? { ...l, tickers: [...l.tickers, t] } : l));
    setNewTicker('');
    toast.success('Ticker added', `${t} added to ${active?.name}`);
  };

  const removeTicker = (ticker: string) => {
    setLists(prev => prev.map(l => l.id === activeWatchlistId ? { ...l, tickers: l.tickers.filter(t => t !== ticker) } : l));
    toast.info('Removed', `${ticker} removed from ${active?.name}`);
  };

  const shareWatchlist = () => {
    const url = `https://vault.jaimecj.com/shared/${activeWatchlistId}`;
    navigator.clipboard?.writeText(url);
    toast.success('Link copied', 'Shareable link copied to clipboard');
  };

  const deleteList = (id: string) => {
    if (lists.length <= 1) { toast.error('Cannot delete', 'You need at least one watchlist'); return; }
    setLists(prev => prev.filter(l => l.id !== id));
    if (activeWatchlistId === id) setActiveWatchlist(lists[0].id);
    toast.warning('Watchlist deleted', 'Watchlist has been removed');
  };

  return (
    <div style={{ display: 'flex', gap: 16, animation: 'fadeIn 0.4s ease', height: 'calc(100vh - 140px)' }}>
      {/* Sidebar */}
      <div className="vault-card" style={{ width: 230, padding: 16, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>My Watchlists</div>
        {lists.map(l => (
          <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button onClick={() => setActiveWatchlist(l.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', flex: 1, textAlign: 'left', transition: 'all 150ms',
                background: activeWatchlistId === l.id ? 'var(--accent-cyan-dim)' : 'transparent',
                color: activeWatchlistId === l.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              }}>
              <Bookmark size={12} />
              <span style={{ fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.name}</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{l.tickers.length}</span>
            </button>
            <button onClick={() => deleteList(l.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', display: 'flex', flexShrink: 0 }}>
              <X size={10} />
            </button>
          </div>
        ))}

        <div style={{ marginTop: 8 }}>
          <input value={newName} onChange={e => setNewName(e.target.value)} className="vault-input" placeholder="New watchlist..." style={{ marginBottom: 6 }} onKeyDown={e => e.key === 'Enter' && addList()} />
          <button onClick={addList} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}><Plus size={12} /> Create</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <div>
            <div className="page-title">{active?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{active?.tickers.length} tickers</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" onClick={shareWatchlist}><Share2 size={12} /> Share</button>
            <div style={{ display: 'flex', gap: 6 }}>
              <input value={newTicker} onChange={e => setNewTicker(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTicker()}
                className="vault-input" placeholder="Add ticker..." style={{ width: 120 }} />
              <button onClick={addTicker} className="btn btn-primary"><Plus size={12} /></button>
            </div>
          </div>
        </div>

        <div className="vault-card" style={{ overflow: 'hidden', flex: 1 }}>
          <div style={{ overflowY: 'auto', height: '100%' }}>
            <table className="vault-table">
              <thead>
                <tr>
                  <th style={{ width: 24 }}></th>
                  <th>Ticker</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'right' }}>Change</th>
                  <th style={{ textAlign: 'right' }}>7D Trend</th>
                  <th style={{ textAlign: 'right' }}>Mkt Cap</th>
                  <th style={{ textAlign: 'right' }}>Volume</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {WATCHLIST_ITEMS.map(w => (
                  <tr key={w.ticker}
                    style={{ background: dragOver === w.ticker ? 'var(--accent-cyan-dim)' : undefined, cursor: 'default' }}
                    draggable
                    onDragOver={e => { e.preventDefault(); setDragOver(w.ticker); }}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={() => { setDragOver(null); toast.info('Reordered', `${w.ticker} position updated`); }}>
                    <td style={{ color: 'var(--text-muted)', cursor: 'grab' }}><GripVertical size={12} /></td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{w.ticker}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{w.name}</div>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatCurrency(w.price)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`badge ${w.changePct >= 0 ? 'badge-positive' : 'badge-negative'}`}>{formatPercent(w.changePct)}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <ResponsiveContainer width={70} height={28}>
                        <LineChart data={w.sparkline.map((v, i) => ({ v, i }))}>
                          <Line type="monotone" dataKey="v" stroke={w.changePct >= 0 ? 'var(--positive)' : 'var(--negative)'} strokeWidth={1.5} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{w.marketCap}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{w.volume}</td>
                    <td>
                      <button onClick={() => removeTicker(w.ticker)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}>
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
    </div>
  );
}