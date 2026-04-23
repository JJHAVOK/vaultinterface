'use client';
// SCREENER PAGE
import { useState, useMemo } from 'react';
import { SCREENER_STOCKS } from '@/lib/mock-data';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function ScreenerPage() {
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('all');
  const [minMcap, setMinMcap] = useState(0);

  const SECTORS = ['all', ...Array.from(new Set(SCREENER_STOCKS.map(s => s.sector)))];

  const filtered = useMemo(() => SCREENER_STOCKS.filter(s => {
    const matchSearch = s.ticker.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase());
    const matchSector = sector === 'all' || s.sector === sector;
    const matchMcap = s.marketCap >= minMcap * 1_000_000_000;
    return matchSearch && matchSector && matchMcap;
  }).slice(0, 100), [search, sector, minMcap]);

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div className="page-header">
        <div>
          <div className="page-title">Stock Screener</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{filtered.length} results</div>
        </div>
        <button className="btn btn-ghost"><SlidersHorizontal size={12} /> Save Screen</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} className="vault-input" placeholder="Search ticker..." style={{ paddingLeft: 30 }} />
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
                <th>Ticker</th>
                <th>Sector</th>
                <th style={{ textAlign: 'right' }}>Price</th>
                <th style={{ textAlign: 'right' }}>Change</th>
                <th style={{ textAlign: 'right' }}>Market Cap</th>
                <th style={{ textAlign: 'right' }}>P/E</th>
                <th style={{ textAlign: 'right' }}>Dividend</th>
                <th style={{ textAlign: 'right' }}>Rev Growth</th>
                <th style={{ textAlign: 'right' }}>Volume</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.ticker}>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{s.ticker}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                  </td>
                  <td><span className="badge badge-neutral" style={{ fontSize: 10 }}>{s.sector.split(' ')[0]}</span></td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatCurrency(s.price)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={`badge ${s.changePct >= 0 ? 'badge-positive' : 'badge-negative'}`}>{formatPercent(s.changePct)}</span>
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{formatNumber(s.marketCap, true)}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{s.pe.toFixed(1)}x</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{s.dividend > 0 ? `${s.dividend}%` : '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={`badge ${s.revenueGrowth >= 0 ? 'badge-positive' : 'badge-negative'}`}>{s.revenueGrowth.toFixed(1)}%</span>
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{formatNumber(s.volume, true)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}