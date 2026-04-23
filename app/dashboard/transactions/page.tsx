'use client';
import { useState, useMemo } from 'react';
import { TRANSACTIONS } from '@/lib/mock-data';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Search, Download, Filter } from 'lucide-react';

const TYPE_COLORS: Record<string, string> = {
  buy: 'badge-cyan', sell: 'badge-positive', dividend: 'badge-warning', fee: 'badge-negative', transfer: 'badge-neutral'
};

export default function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(0);
  const PER_PAGE = 20;

  const filtered = useMemo(() => TRANSACTIONS.filter(t => {
    const matchSearch = t.ticker.toLowerCase().includes(search.toLowerCase()) || t.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || t.type === typeFilter;
    return matchSearch && matchType;
  }), [search, typeFilter]);

  const paged = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div className="page-header">
        <div>
          <div className="page-title">Transactions</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{filtered.length} transactions</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost"><Download size={12} /> Export CSV</button>
          <button className="btn btn-primary"><Filter size={12} /> Import Broker</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="vault-input" placeholder="Search ticker or name..." style={{ paddingLeft: 30 }} />
        </div>
        {['all', 'buy', 'sell', 'dividend', 'fee', 'transfer'].map(t => (
          <button key={t} onClick={() => { setTypeFilter(t); setPage(0); }}
            style={{ padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-mono)', transition: 'all 150ms',
              background: typeFilter === t ? 'var(--accent-cyan)' : 'var(--bg-elevated)',
              color: typeFilter === t ? '#000' : 'var(--text-secondary)',
            }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="vault-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="vault-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Ticker</th>
                <th>Type</th>
                <th style={{ textAlign: 'right' }}>Shares</th>
                <th style={{ textAlign: 'right' }}>Price</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'right' }}>Balance</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(tx => (
                <tr key={tx.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{formatDate(tx.date)}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tx.ticker}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{tx.name.slice(0, 20)}</div>
                  </td>
                  <td><span className={`badge ${TYPE_COLORS[tx.type]}`}>{tx.type}</span></td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{tx.shares ?? '—'}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{tx.price ? formatCurrency(tx.price) : '—'}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: tx.amount >= 0 ? 'var(--positive)' : 'var(--negative)', fontWeight: 600 }}>
                    {tx.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    {formatCurrency(tx.runningBalance)}
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tx.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Showing {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, filtered.length)} of {filtered.length}
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn btn-ghost" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>← Prev</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
              <button key={i} onClick={() => setPage(i)}
                style={{ padding: '4px 10px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-mono)',
                  background: page === i ? 'var(--accent-cyan)' : 'var(--bg-elevated)',
                  color: page === i ? '#000' : 'var(--text-secondary)',
                }}>{i + 1}</button>
            ))}
            <button className="btn btn-ghost" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}