'use client';
import { useState, useMemo } from 'react';
import { SCREENER_STOCKS } from '@/lib/mock-data';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { Search, SlidersHorizontal, X, Download, BarChart2 } from 'lucide-react';
import type { ScreenerStock } from '@/lib/types';

const ALL_COLUMNS = ['price', 'change', 'marketCap', 'pe', 'eps', 'dividend', 'revenueGrowth', 'volume'];
const COLUMN_LABELS: Record<string, string> = { price: 'Price', change: 'Change %', marketCap: 'Market Cap', pe: 'P/E', eps: 'EPS', dividend: 'Dividend', revenueGrowth: 'Rev Growth', volume: 'Volume' };

function StockDetailModal({ stock, onClose, onAddWatchlist }: { stock: ScreenerStock; onClose: () => void; onAddWatchlist: (ticker: string) => void }) {
  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 460, background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)', borderRadius: 14, zIndex: 60, boxShadow: '0 24px 80px rgba(0,0,0,0.5)', animation: 'fadeIn 0.2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20 }}>{stock.ticker}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{stock.name} · {stock.sector}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={16} /></button>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 20 }}>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{formatCurrency(stock.price)}</div>
            <span className={`badge ${stock.changePct >= 0 ? 'badge-positive' : 'badge-negative'}`}>{formatPercent(stock.changePct)}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Market Cap', value: formatNumber(stock.marketCap, true) },
              { label: 'P/E Ratio', value: `${stock.pe.toFixed(1)}x` },
              { label: 'EPS', value: `$${stock.eps.toFixed(2)}` },
              { label: 'Dividend Yield', value: stock.dividend > 0 ? `${stock.dividend}%` : 'None' },
              { label: 'Revenue Growth', value: `${stock.revenueGrowth.toFixed(1)}%`, color: stock.revenueGrowth >= 0 ? 'var(--positive)' : 'var(--negative)' },
              { label: 'Volume', value: formatNumber(stock.volume, true) },
              { label: '52W High', value: formatCurrency(stock.week52High) },
              { label: '52W Low', value: formatCurrency(stock.week52Low) },
            ].map(item => (
              <div key={item.label} style={{ padding: '10px 12px', background: 'var(--bg-tertiary)', borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-mono)', color: (item as any).color || 'var(--text-primary)' }}>{item.value}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { toast.success('Position added', `${stock.ticker} added to your portfolio`); onClose(); }}>Buy Position</button>
            <button className="btn btn-ghost" onClick={() => { onAddWatchlist(stock.ticker); onClose(); }}>+ Watchlist</button>
            <button className="btn btn-ghost" onClick={() => { toast.info('Alert set', `Price alert created for ${stock.ticker}`); onClose(); }}>Set Alert</button>
          </div>
        </div>
      </div>
    </>
  );
}

function CompareModal({ stocks, onClose }: { stocks: ScreenerStock[]; onClose: () => void }) {
  const metrics = ['price', 'changePct', 'pe', 'eps', 'dividend', 'revenueGrowth'] as const;
  const labels: Record<string, string> = { price: 'Price', changePct: 'Change %', pe: 'P/E Ratio', eps: 'EPS', dividend: 'Dividend', revenueGrowth: 'Rev Growth' };

  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: Math.min(180 + stocks.length * 160, 860), background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)', borderRadius: 14, zIndex: 60, boxShadow: '0 24px 80px rgba(0,0,0,0.5)', animation: 'fadeIn 0.2s ease', maxWidth: '90vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>Compare Stocks</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={16} /></button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="vault-table">
            <thead>
              <tr>
                <th>Metric</th>
                {stocks.map(s => <th key={s.ticker} style={{ textAlign: 'center' }}>{s.ticker}</th>)}
              </tr>
            </thead>
            <tbody>
              {metrics.map(metric => {
                const values = stocks.map(s => Number(s[metric]));
                const best = metric === 'pe' ? Math.min(...values) : Math.max(...values);
                return (
                  <tr key={metric}>
                    <td style={{ color: 'var(--text-secondary)' }}>{labels[metric]}</td>
                    {stocks.map((s, i) => {
                      const v = Number(s[metric]);
                      const isBest = v === best;
                      return (
                        <td key={s.ticker} style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', color: isBest ? 'var(--positive)' : 'var(--text-primary)', fontWeight: isBest ? 700 : 400 }}>
                          {metric === 'price' ? formatCurrency(v) : `${v.toFixed(2)}`}
                          {isBest && <span style={{ fontSize: 9, marginLeft: 4 }}>★</span>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: 16, borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
          ★ Best value highlighted in green
        </div>
      </div>
    </>
  );
}

export default function ScreenerPage() {
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('all');
  const [minMcap, setMinMcap] = useState(0);
  const [selectedStocks, setSelectedStocks] = useState<Set<string>>(new Set());
  const [detailStock, setDetailStock] = useState<ScreenerStock | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [showColPicker, setShowColPicker] = useState(false);
  const [visibleCols, setVisibleCols] = useState(new Set(['price', 'change', 'marketCap', 'pe', 'revenueGrowth', 'volume']));
  const [savedScreens, setSavedScreens] = useState<string[]>([]);

  const SECTORS = ['all', ...Array.from(new Set(SCREENER_STOCKS.map(s => s.sector)))];

  const filtered = useMemo(() => SCREENER_STOCKS.filter(s => {
    const matchSearch = s.ticker.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase());
    const matchSector = sector === 'all' || s.sector === sector;
    const matchMcap = s.marketCap >= minMcap * 1_000_000_000;
    return matchSearch && matchSector && matchMcap;
  }).slice(0, 100), [search, sector, minMcap]);

  const compareStocks = SCREENER_STOCKS.filter(s => selectedStocks.has(s.ticker));

  const handleSaveScreen = () => {
    const name = `Screen ${savedScreens.length + 1} (${sector !== 'all' ? sector : 'All'})`;
    setSavedScreens(prev => [...prev, name]);
    toast.success('Screen saved', `"${name}" saved to your screens`);
  };

  const handleExport = () => {
    toast.success('Export complete', `${filtered.length} stocks exported to CSV`);
  };

  const handleAddWatchlist = (ticker: string) => {
    toast.success('Watchlist updated', `${ticker} added to Tech Giants`);
  };

  const toggleSelect = (ticker: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedStocks.has(ticker)) {
      setSelectedStocks(prev => { const n = new Set(prev); n.delete(ticker); return n; });
    } else if (selectedStocks.size < 4) {
      setSelectedStocks(prev => new Set([...prev, ticker]));
    } else {
      toast.warning('Compare limit', 'You can compare up to 4 stocks at once');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {detailStock && <StockDetailModal stock={detailStock} onClose={() => setDetailStock(null)} onAddWatchlist={handleAddWatchlist} />}
      {showCompare && compareStocks.length > 1 && <CompareModal stocks={compareStocks} onClose={() => setShowCompare(false)} />}

      <div className="page-header">
        <div>
          <div className="page-title">Stock Screener</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{filtered.length} results</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {savedScreens.length > 0 && (
            <select className="vault-input" style={{ width: 160 }} onChange={e => toast.info('Screen loaded', e.target.value)}>
              <option value="">Saved screens...</option>
              {savedScreens.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          {selectedStocks.size > 1 && (
            <button className="btn btn-cyan" style={{ background: 'var(--accent-cyan-dim)', color: 'var(--accent-cyan)', border: '1px solid rgba(0,212,255,0.3)', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-mono)' }} onClick={() => setShowCompare(true)}>
              <BarChart2 size={12} style={{ display: 'inline', marginRight: 6 }} />Compare {selectedStocks.size}
            </button>
          )}
          <button className="btn btn-ghost" onClick={() => setShowColPicker(!showColPicker)}><SlidersHorizontal size={12} /> Columns</button>
          <button className="btn btn-ghost" onClick={handleSaveScreen}>Save Screen</button>
          <button className="btn btn-ghost" onClick={handleExport}><Download size={12} /> Export</button>
        </div>
      </div>

      {showColPicker && (
        <div className="vault-card" style={{ padding: 16, marginBottom: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', alignSelf: 'center' }}>Show columns:</span>
          {ALL_COLUMNS.map(col => (
            <button key={col} onClick={() => setVisibleCols(prev => { const n = new Set(prev); n.has(col) ? n.delete(col) : n.add(col); return n; })}
              style={{ padding: '4px 10px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-mono)', background: visibleCols.has(col) ? 'var(--accent-cyan)' : 'var(--bg-elevated)', color: visibleCols.has(col) ? '#000' : 'var(--text-secondary)' }}>
              {COLUMN_LABELS[col]}
            </button>
          ))}
        </div>
      )}

      {selectedStocks.size > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{selectedStocks.size} selected for compare:</span>
          {[...selectedStocks].map(t => (
            <span key={t} className="badge badge-cyan" style={{ cursor: 'pointer' }} onClick={() => setSelectedStocks(prev => { const n = new Set(prev); n.delete(t); return n; })}>
              {t} ×
            </span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} className="vault-input" placeholder="Search ticker or company..." style={{ paddingLeft: 30 }} />
        </div>
        <select value={sector} onChange={e => setSector(e.target.value)} className="vault-input" style={{ width: 180 }}>
          {SECTORS.map(s => <option key={s} value={s}>{s === 'all' ? 'All Sectors' : s}</option>)}
        </select>
        <select value={minMcap} onChange={e => setMinMcap(Number(e.target.value))} className="vault-input" style={{ width: 160 }}>
          <option value={0}>Any Market Cap</option>
          <option value={1}>Large Cap ($1B+)</option>
          <option value={10}>Mega Cap ($10B+)</option>
          <option value={100}>Giant ($100B+)</option>
        </select>
      </div>

      <div className="vault-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="vault-table">
            <thead>
              <tr>
                <th style={{ width: 32 }}>#</th>
                <th>Ticker</th>
                <th>Sector</th>
                {visibleCols.has('price') && <th style={{ textAlign: 'right' }}>Price</th>}
                {visibleCols.has('change') && <th style={{ textAlign: 'right' }}>Change</th>}
                {visibleCols.has('marketCap') && <th style={{ textAlign: 'right' }}>Market Cap</th>}
                {visibleCols.has('pe') && <th style={{ textAlign: 'right' }}>P/E</th>}
                {visibleCols.has('eps') && <th style={{ textAlign: 'right' }}>EPS</th>}
                {visibleCols.has('dividend') && <th style={{ textAlign: 'right' }}>Div.</th>}
                {visibleCols.has('revenueGrowth') && <th style={{ textAlign: 'right' }}>Rev Growth</th>}
                {visibleCols.has('volume') && <th style={{ textAlign: 'right' }}>Volume</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const isSelected = selectedStocks.has(s.ticker);
                return (
                  <tr key={s.ticker} style={{ cursor: 'pointer', background: isSelected ? 'var(--accent-cyan-dim)' : undefined }}
                    onClick={() => setDetailStock(s)}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 11 }} onClick={e => toggleSelect(s.ticker, e)}>
                      <input type="checkbox" checked={isSelected} readOnly style={{ accentColor: 'var(--accent-cyan)' }} />
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{s.ticker}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                    </td>
                    <td><span className="badge badge-neutral" style={{ fontSize: 10 }}>{s.sector.split(' ')[0]}</span></td>
                    {visibleCols.has('price') && <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatCurrency(s.price)}</td>}
                    {visibleCols.has('change') && <td style={{ textAlign: 'right' }}><span className={`badge ${s.changePct >= 0 ? 'badge-positive' : 'badge-negative'}`}>{formatPercent(s.changePct)}</span></td>}
                    {visibleCols.has('marketCap') && <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{formatNumber(s.marketCap, true)}</td>}
                    {visibleCols.has('pe') && <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{s.pe.toFixed(1)}x</td>}
                    {visibleCols.has('eps') && <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>${s.eps.toFixed(2)}</td>}
                    {visibleCols.has('dividend') && <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{s.dividend > 0 ? `${s.dividend}%` : '—'}</td>}
                    {visibleCols.has('revenueGrowth') && <td style={{ textAlign: 'right' }}><span className={`badge ${s.revenueGrowth >= 0 ? 'badge-positive' : 'badge-negative'}`}>{s.revenueGrowth.toFixed(1)}%</span></td>}
                    {visibleCols.has('volume') && <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{formatNumber(s.volume, true)}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}