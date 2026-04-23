'use client';
import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TRANSACTIONS } from '@/lib/mock-data';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { Search, Download, Upload, X, ArrowRight } from 'lucide-react';
import type { Transaction } from '@/lib/types';

const TYPE_COLORS: Record<string, string> = {
  buy: 'badge-cyan', sell: 'badge-positive', dividend: 'badge-warning', fee: 'badge-negative', transfer: 'badge-neutral'
};

const BROKERS = [
  { name: 'Fidelity', color: '#006400', logo: 'F' },
  { name: 'Schwab', color: '#004F9F', logo: 'S' },
  { name: 'TD Ameritrade', color: '#00A651', logo: 'TD' },
  { name: 'Robinhood', color: '#00C805', logo: 'R' },
  { name: 'E*TRADE', color: '#522D6E', logo: 'E' },
  { name: 'Interactive Brokers', color: '#CC0000', logo: 'IB' },
];

function TransactionPanel({ tx, onClose }: { tx: Transaction; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: 380,
      background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-bright)',
      zIndex: 50, boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
      animation: 'slideInRight 0.25s ease',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>Transaction Detail</div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={16} /></button>
      </div>
      <div style={{ padding: 20, flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: 16, background: 'var(--bg-tertiary)', borderRadius: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: tx.type === 'buy' ? 'var(--accent-cyan-dim)' : tx.type === 'sell' ? 'var(--positive-dim)' : 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowRight size={20} style={{ color: tx.type === 'buy' ? 'var(--accent-cyan)' : tx.type === 'sell' ? 'var(--positive)' : 'var(--text-muted)', transform: tx.type === 'sell' ? 'rotate(180deg)' : undefined }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{tx.ticker}</div>
            <span className={`badge ${TYPE_COLORS[tx.type]}`}>{tx.type}</span>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 18, color: tx.amount >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
              {tx.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(tx.date)}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Company', value: tx.name },
            { label: 'Ticker', value: tx.ticker },
            { label: 'Transaction Type', value: tx.type.charAt(0).toUpperCase() + tx.type.slice(1) },
            { label: 'Date', value: formatDate(tx.date, 'long') },
            { label: 'Shares', value: tx.shares?.toString() ?? '—' },
            { label: 'Price per Share', value: tx.price ? formatCurrency(tx.price) : '—' },
            { label: 'Total Amount', value: formatCurrency(Math.abs(tx.amount)) },
            { label: 'Running Balance', value: formatCurrency(tx.runningBalance) },
            { label: 'Notes', value: tx.notes ?? 'None' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}</span>
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', maxWidth: 200, textAlign: 'right' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ImportModal({ onClose }: { onClose: () => void }) {
  const [dragging, setDragging] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<string | null>(null);

  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)', borderRadius: 14, zIndex: 60, boxShadow: '0 24px 80px rgba(0,0,0,0.5)', animation: 'fadeIn 0.2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>Import Transactions</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={16} /></button>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>Select your broker to connect or upload a CSV export</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
            {BROKERS.map(b => (
              <button key={b.name} onClick={() => setSelectedBroker(b.name)}
                style={{ padding: '12px 8px', borderRadius: 8, border: `1px solid ${selectedBroker === b.name ? 'var(--accent-cyan)' : 'var(--border)'}`, background: selectedBroker === b.name ? 'var(--accent-cyan-dim)' : 'var(--bg-tertiary)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transition: 'all 150ms' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: b.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>{b.logo}</div>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{b.name}</span>
              </button>
            ))}
          </div>

          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>— or upload CSV —</div>

          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); toast.success('File received', 'Parsing transactions...'); setTimeout(() => { toast.success('Import complete', '47 transactions imported'); onClose(); }, 1500); }}
            style={{ border: `2px dashed ${dragging ? 'var(--accent-cyan)' : 'var(--border)'}`, borderRadius: 10, padding: 28, textAlign: 'center', background: dragging ? 'var(--accent-cyan-dim)' : 'var(--bg-tertiary)', transition: 'all 200ms', cursor: 'pointer' }}>
            <Upload size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Drag & drop your CSV file here</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Supports Fidelity, Schwab, TD, and generic CSV formats</div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { if (selectedBroker) { toast.success('Connecting...', `Redirecting to ${selectedBroker} OAuth`); setTimeout(() => { toast.success('Connected', `${selectedBroker} account linked`); onClose(); }, 1500); } else toast.warning('Select broker', 'Please select a broker or upload a file'); }}>
              {selectedBroker ? `Connect ${selectedBroker}` : 'Connect Broker'}
            </button>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [showImport, setShowImport] = useState(false);
  const PER_PAGE = 20;

  const filtered = useMemo(() => TRANSACTIONS.filter(t => {
    const matchSearch = t.ticker.toLowerCase().includes(search.toLowerCase()) || t.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || t.type === typeFilter;
    return matchSearch && matchType;
  }), [search, typeFilter]);

  const pnlData = useMemo(() => filtered.slice(0, 30).map((t, i) => ({ i, balance: t.runningBalance })).reverse(), [filtered]);
  const paged = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const handleExport = () => {
    const csv = ['Date,Ticker,Type,Shares,Price,Amount,Balance',
      ...filtered.map(t => `${formatDate(t.date)},${t.ticker},${t.type},${t.shares ?? ''},${t.price ?? ''},${t.amount},${t.runningBalance}`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'vault-transactions.csv'; a.click();
    toast.success('Export complete', `${filtered.length} transactions exported`);
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {selectedTx && <TransactionPanel tx={selectedTx} onClose={() => setSelectedTx(null)} />}
      {showImport && <ImportModal onClose={() => setShowImport(false)} />}

      <div className="page-header">
        <div>
          <div className="page-title">Transactions</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{filtered.length} transactions</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={handleExport}><Download size={12} /> Export CSV</button>
          <button className="btn btn-primary" onClick={() => setShowImport(true)}><Upload size={12} /> Import Broker</button>
        </div>
      </div>

      {/* Running P&L chart */}
      <div className="vault-card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>Running Balance (filtered)</div>
        <ResponsiveContainer width="100%" height={80}>
          <LineChart data={pnlData}>
            <Line type="monotone" dataKey="balance" stroke="var(--accent-cyan)" strokeWidth={2} dot={false} />
            <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }} formatter={(v: any) => formatCurrency(v)} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="vault-input" placeholder="Search ticker or name..." style={{ paddingLeft: 30 }} />
        </div>
        {['all', 'buy', 'sell', 'dividend', 'fee', 'transfer'].map(t => (
          <button key={t} onClick={() => { setTypeFilter(t); setPage(0); }}
            style={{ padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-mono)', transition: 'all 150ms', background: typeFilter === t ? 'var(--accent-cyan)' : 'var(--bg-elevated)', color: typeFilter === t ? '#000' : 'var(--text-secondary)' }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="vault-card" style={{ overflow: 'hidden', marginRight: selectedTx ? 396 : 0, transition: 'margin 250ms ease' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="vault-table">
            <thead>
              <tr><th>Date</th><th>Ticker</th><th>Type</th><th style={{ textAlign: 'right' }}>Shares</th><th style={{ textAlign: 'right' }}>Price</th><th style={{ textAlign: 'right' }}>Amount</th><th style={{ textAlign: 'right' }}>Balance</th><th>Notes</th></tr>
            </thead>
            <tbody>
              {paged.map(tx => (
                <tr key={tx.id} style={{ cursor: 'pointer', background: selectedTx?.id === tx.id ? 'var(--accent-cyan-dim)' : undefined }}
                  onClick={() => setSelectedTx(selectedTx?.id === tx.id ? null : tx)}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{formatDate(tx.date)}</td>
                  <td><div style={{ fontWeight: 600 }}>{tx.ticker}</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{tx.name.slice(0, 18)}</div></td>
                  <td><span className={`badge ${TYPE_COLORS[tx.type]}`}>{tx.type}</span></td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{tx.shares ?? '—'}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{tx.price ? formatCurrency(tx.price) : '—'}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: tx.amount >= 0 ? 'var(--positive)' : 'var(--negative)', fontWeight: 600 }}>
                    {tx.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{formatCurrency(tx.runningBalance)}</td>
                  <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tx.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Showing {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, filtered.length)} of {filtered.length}</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn btn-ghost" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>← Prev</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
              <button key={i} onClick={() => setPage(i)} style={{ padding: '4px 10px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-mono)', background: page === i ? 'var(--accent-cyan)' : 'var(--bg-elevated)', color: page === i ? '#000' : 'var(--text-secondary)' }}>{i + 1}</button>
            ))}
            <button className="btn btn-ghost" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}