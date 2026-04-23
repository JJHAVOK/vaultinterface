'use client';
import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line } from 'recharts';
import { HOLDINGS, SECTOR_ALLOCATION, PORTFOLIO_KPI, TAX_LOTS } from '@/lib/mock-data';
import { formatCurrency, formatPercent, getChangeBg, generateSparkline } from '@/lib/utils';
import { useLivePrices } from '@/lib/useLivePrices';
import { toast } from '@/components/ui/Toast';
import { Download, RefreshCw, Plus, X, TrendingUp, TrendingDown, ChevronUp, ChevronDown } from 'lucide-react';
import type { Holding } from '@/lib/types';

const TABS = ['Holdings', 'Tax Lots', 'Allocation', 'Rebalancing'];

// Sparklines pre-generated per ticker
const SPARKLINES: Record<string, number[]> = Object.fromEntries(
  HOLDINGS.map(h => [h.ticker, generateSparkline(h.currentPrice * 0.95, 20)])
);

function SparklineCell({ ticker, positive }: { ticker: string; positive: boolean }) {
  const data = SPARKLINES[ticker]?.map((v, i) => ({ v, i })) || [];
  return (
    <LineChart width={60} height={28} data={data}>
      <Line type="monotone" dataKey="v" stroke={positive ? 'var(--positive)' : 'var(--negative)'} strokeWidth={1.5} dot={false} />
    </LineChart>
  );
}

function HoldingModal({ holding, onClose }: { holding: Holding; onClose: () => void }) {
  const prices = useLivePrices();
  const livePrice = prices[holding.ticker] ?? holding.currentPrice;
  const liveValue = livePrice * holding.shares;
  const liveGain = liveValue - holding.costBasis;
  const liveGainPct = (liveGain / holding.costBasis) * 100;

  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)', borderRadius: 14, zIndex: 60, boxShadow: '0 24px 80px rgba(0,0,0,0.5)', animation: 'fadeIn 0.2s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: holding.logoColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>
              {holding.ticker.slice(0, 2)}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20 }}>{holding.ticker}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{holding.name} · {holding.sector}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={16} /></button>
        </div>
        <div style={{ padding: 20 }}>
          {/* Live price */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-display)', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(livePrice)}</div>
              <span className={`badge ${holding.dayChangePct >= 0 ? 'badge-positive' : 'badge-negative'}`} style={{ marginTop: 4 }}>
                {holding.dayChangePct >= 0 ? '▲' : '▼'} {formatPercent(Math.abs(holding.dayChangePct))} today
              </span>
            </div>
            <SparklineCell ticker={holding.ticker} positive={holding.dayChangePct >= 0} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Shares Owned', value: holding.shares.toLocaleString() },
              { label: 'Avg Cost Basis', value: formatCurrency(holding.avgCost) },
              { label: 'Market Value', value: formatCurrency(liveValue), color: 'var(--text-primary)' },
              { label: 'Cost Basis', value: formatCurrency(holding.costBasis) },
              { label: 'Unrealized Gain', value: formatCurrency(liveGain), color: liveGain >= 0 ? 'var(--positive)' : 'var(--negative)' },
              { label: 'Total Return', value: formatPercent(liveGainPct), color: liveGainPct >= 0 ? 'var(--positive)' : 'var(--negative)' },
              { label: 'Day Change $', value: formatCurrency(holding.dayChange * holding.shares), color: holding.dayChange >= 0 ? 'var(--positive)' : 'var(--negative)' },
              { label: 'Portfolio Weight', value: `${holding.weight}%` },
            ].map(item => (
              <div key={item.label} style={{ padding: '10px 12px', background: 'var(--bg-tertiary)', borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-mono)', color: (item as any).color || 'var(--text-primary)' }}>{item.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { toast.success('Buy order submitted', `Market buy order for ${holding.ticker} queued`); onClose(); }}>
              <TrendingUp size={13} /> Buy More
            </button>
            <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => { toast.warning('Sell order submitted', `Market sell order for ${holding.ticker} queued`); onClose(); }}>
              <TrendingDown size={13} /> Sell Position
            </button>
            <button className="btn btn-ghost" onClick={() => { toast.info('Watchlist updated', `${holding.ticker} added to Tech Giants`); onClose(); }}>+ Watch</button>
          </div>
        </div>
      </div>
    </>
  );
}

function AddPositionModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ ticker: '', shares: '', price: '', date: '' });

  const handleAdd = () => {
    if (!form.ticker || !form.shares || !form.price) { toast.error('Missing fields', 'Please fill in all required fields'); return; }
    toast.success('Position added', `${form.shares} shares of ${form.ticker.toUpperCase()} added to portfolio`);
    onClose();
  };

  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 420, background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)', borderRadius: 14, zIndex: 60, boxShadow: '0 24px 80px rgba(0,0,0,0.5)', animation: 'fadeIn 0.2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>Add Position</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={16} /></button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Ticker Symbol *', key: 'ticker', placeholder: 'AAPL', type: 'text' },
            { label: 'Number of Shares *', key: 'shares', placeholder: '10', type: 'number' },
            { label: 'Purchase Price *', key: 'price', placeholder: '150.00', type: 'number' },
            { label: 'Purchase Date', key: 'date', placeholder: '', type: 'date' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{f.label}</label>
              <input type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="vault-input" />
            </div>
          ))}
          {form.ticker && form.shares && form.price && (
            <div style={{ padding: 12, background: 'var(--accent-cyan-dim)', borderRadius: 8, border: '1px solid rgba(0,212,255,0.2)', fontSize: 12 }}>
              Total cost: <strong>{formatCurrency(Number(form.shares) * Number(form.price))}</strong>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button onClick={handleAdd} className="btn btn-primary" style={{ flex: 1 }}>Add Position</button>
            <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function PortfolioPage() {
  const prices = useLivePrices();
  const [tab, setTab] = useState('Holdings');
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' }>({ key: 'marketValue', dir: 'desc' });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [modalHolding, setModalHolding] = useState<Holding | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const sortedHoldings = useMemo(() => [...HOLDINGS].sort((a, b) => {
    const av = (a as any)[sort.key];
    const bv = (b as any)[sort.key];
    return sort.dir === 'desc' ? bv - av : av - bv;
  }), [sort]);

  const handleSort = (key: string) => setSort(s => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }));

  const toggleSelect = (ticker: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(prev => { const n = new Set(prev); n.has(ticker) ? n.delete(ticker) : n.add(ticker); return n; });
  };

  const handleExport = () => {
    const csv = ['Ticker,Name,Shares,Avg Cost,Current Price,Market Value,Gain%',
      ...HOLDINGS.map(h => `${h.ticker},${h.name},${h.shares},${h.avgCost},${prices[h.ticker] ?? h.currentPrice},${h.marketValue},${h.unrealizedGainPct}%`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'vault-holdings.csv'; a.click();
    toast.success('Export complete', 'holdings.csv downloaded');
  };

  const SortTh = ({ k, label, right }: { k: string; label: string; right?: boolean }) => (
    <th onClick={() => handleSort(k)} style={{ textAlign: right ? 'right' : 'left', cursor: 'pointer' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {label}
        {sort.key === k ? (sort.dir === 'desc' ? <ChevronDown size={10} /> : <ChevronUp size={10} />) : null}
      </span>
    </th>
  );

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {modalHolding && <HoldingModal holding={modalHolding} onClose={() => setModalHolding(null)} />}
      {showAddModal && <AddPositionModal onClose={() => setShowAddModal(false)} />}

      <div className="page-header">
        <div>
          <div className="page-title">Portfolio</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{HOLDINGS.length} positions · {formatCurrency(PORTFOLIO_KPI.totalValue)}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {selected.size > 0 && (
            <button className="btn btn-danger" onClick={() => { toast.warning('Sell orders queued', `${selected.size} positions queued for sale`); setSelected(new Set()); }}>
              Sell {selected.size} selected
            </button>
          )}
          <button className="btn btn-ghost" onClick={() => { toast.info('Prices refreshed', 'Live prices updated'); }}><RefreshCw size={12} /> Refresh</button>
          <button className="btn btn-ghost" onClick={handleExport}><Download size={12} /> Export CSV</button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}><Plus size={12} /> Add Position</button>
        </div>
      </div>

      {/* Summary bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Value', value: formatCurrency(PORTFOLIO_KPI.totalValue), color: 'var(--text-primary)' },
          { label: 'Cost Basis', value: formatCurrency(PORTFOLIO_KPI.totalCostBasis), color: 'var(--text-secondary)' },
          { label: 'Unrealized Gain', value: formatCurrency(PORTFOLIO_KPI.totalGain), color: 'var(--positive)' },
          { label: 'Total Return', value: formatPercent(PORTFOLIO_KPI.totalGainPct), color: 'var(--positive)' },
          { label: "Today's P&L", value: formatCurrency(PORTFOLIO_KPI.dayChange), color: 'var(--positive)' },
        ].map(item => (
          <div key={item.label} className="vault-card" style={{ padding: '12px 16px', flex: 1, minWidth: 130 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', color: item.color }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div className="tab-bar" style={{ marginBottom: 16 }}>
        {TABS.map(t => <div key={t} className={`tab-item ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</div>)}
      </div>

      {tab === 'Holdings' && (
        <div className="vault-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="vault-table">
              <thead>
                <tr>
                  <th style={{ width: 32 }}><input type="checkbox" style={{ accentColor: 'var(--accent-cyan)' }} onChange={e => setSelected(e.target.checked ? new Set(HOLDINGS.map(h => h.ticker)) : new Set())} /></th>
                  <SortTh k="ticker" label="Ticker" />
                  <th>Trend</th>
                  <SortTh k="shares" label="Shares" right />
                  <SortTh k="avgCost" label="Avg Cost" right />
                  <SortTh k="currentPrice" label="Price" right />
                  <SortTh k="dayChangePct" label="Day %" right />
                  <SortTh k="marketValue" label="Value" right />
                  <SortTh k="unrealizedGainPct" label="Return %" right />
                  <SortTh k="weight" label="Weight" right />
                </tr>
              </thead>
              <tbody>
                {sortedHoldings.map(h => {
                  const livePrice = prices[h.ticker] ?? h.currentPrice;
                  const isSelected = selected.has(h.ticker);
                  return (
                    <tr key={h.ticker} style={{ cursor: 'pointer', background: isSelected ? 'var(--accent-cyan-dim)' : undefined }}
                      onClick={() => setModalHolding(h)}>
                      <td onClick={e => toggleSelect(h.ticker, e)}>
                        <input type="checkbox" checked={isSelected} readOnly style={{ accentColor: 'var(--accent-cyan)' }} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 6, background: h.logoColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                            {h.ticker.slice(0, 2)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{h.ticker}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.name}</div>
                          </div>
                        </div>
                      </td>
                      <td><SparklineCell ticker={h.ticker} positive={h.dayChangePct >= 0} /></td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{h.shares.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatCurrency(h.avgCost)}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatCurrency(livePrice)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={`badge ${h.dayChangePct >= 0 ? 'badge-positive' : 'badge-negative'}`}>{formatPercent(h.dayChangePct)}</span>
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatCurrency(h.marketValue)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={`badge ${h.unrealizedGainPct >= 0 ? 'badge-positive' : 'badge-negative'}`}>{formatPercent(h.unrealizedGainPct)}</span>
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{h.weight}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Tax Lots' && (
        <div className="vault-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="vault-table">
              <thead>
                <tr><th>Ticker</th><th style={{ textAlign: 'right' }}>Shares</th><th style={{ textAlign: 'right' }}>Cost Basis</th><th style={{ textAlign: 'right' }}>Current</th><th>Acquired</th><th>Holding</th><th style={{ textAlign: 'right' }}>Unrealized</th><th style={{ textAlign: 'right' }}>Est. Tax</th></tr>
              </thead>
              <tbody>
                {TAX_LOTS.slice(0, 20).map(lot => (
                  <tr key={lot.id} style={{ cursor: 'pointer' }} onClick={() => toast.info(`${lot.ticker} Tax Lot`, `${lot.holdingPeriod}-term · acquired ${lot.acquiredDate} · est. tax ${formatCurrency(lot.estimatedTax)}`)}>
                    <td style={{ fontWeight: 600 }}>{lot.ticker}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{lot.shares}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatCurrency(lot.costBasis)}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatCurrency(lot.currentValue)}</td>
                    <td style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>{lot.acquiredDate}</td>
                    <td><span className={`badge ${lot.holdingPeriod === 'long' ? 'badge-positive' : 'badge-warning'}`}>{lot.holdingPeriod === 'long' ? 'Long-term' : 'Short-term'}</span></td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: lot.unrealizedGain >= 0 ? 'var(--positive)' : 'var(--negative)' }}>{formatCurrency(lot.unrealizedGain)}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--warning)' }}>{formatCurrency(lot.estimatedTax)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Allocation' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="vault-card" style={{ padding: 24 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Sector Allocation</div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={SECTOR_ALLOCATION} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value" stroke="none"
                  onClick={(e: any) => toast.info(e.sector, `${e.pct}% · ${formatCurrency(e.value)}`)}>
                  {SECTOR_ALLOCATION.map((entry, i) => <Cell key={i} fill={entry.color} style={{ cursor: 'pointer' }} />)}
                </Pie>
                <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="vault-card" style={{ padding: 24 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Breakdown</div>
            {SECTOR_ALLOCATION.map(s => (
              <div key={s.sector} style={{ marginBottom: 12, cursor: 'pointer' }} onClick={() => toast.info(s.sector, `${s.pct}% of portfolio`)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color }} />
                    <span style={{ fontSize: 13 }}>{s.sector}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>{formatCurrency(s.value, true)}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, width: 40, textAlign: 'right' }}>{s.pct}%</span>
                  </div>
                </div>
                <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${s.pct}%`, background: s.color, borderRadius: 2, transition: 'width 600ms ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'Rebalancing' && (
        <div className="vault-card" style={{ padding: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Rebalancing Tool</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20 }}>Drag sliders to set target allocations</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {SECTOR_ALLOCATION.map(s => (
              <div key={s.sector} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 140, fontSize: 13 }}>{s.sector}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', width: 70, fontFamily: 'var(--font-mono)' }}>Now: {s.pct}%</div>
                <input type="range" min={0} max={100} defaultValue={s.pct} style={{ flex: 1, accentColor: s.color }}
                  onChange={e => toast.info('Target updated', `${s.sector}: ${e.target.value}% target`)} />
                <input type="number" defaultValue={s.pct} className="vault-input" style={{ width: 52, padding: '4px 6px', textAlign: 'center' }} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={() => toast.success('Orders generated', '5 rebalancing orders ready for review')}>Generate Rebalance Orders</button>
            <button className="btn btn-ghost" onClick={() => toast.info('Reset', 'Targets reset to current allocation')}>Reset</button>
          </div>
        </div>
      )}
    </div>
  );
}