'use client';
import { useState } from 'react';
import { HOLDINGS, TAX_LOTS, PORTFOLIO_KPI, SECTOR_ALLOCATION } from '@/lib/mock-data';
import { formatCurrency, formatPercent, getChangeBg } from '@/lib/utils';
import { TrendingUp, TrendingDown, Download, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const TABS = ['Holdings', 'Tax Lots', 'Allocation', 'Rebalancing'];

export default function PortfolioPage() {
  const [tab, setTab] = useState('Holdings');
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' }>({ key: 'marketValue', dir: 'desc' });

  const sortedHoldings = [...HOLDINGS].sort((a, b) => {
    const av = (a as any)[sort.key];
    const bv = (b as any)[sort.key];
    return sort.dir === 'desc' ? bv - av : av - bv;
  });

  const handleSort = (key: string) => {
    setSort(s => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }));
  };

  const SortTh = ({ k, label }: { k: string; label: string }) => (
    <th onClick={() => handleSort(k)} style={{ textAlign: 'right' }}>
      {label} {sort.key === k ? (sort.dir === 'desc' ? '↓' : '↑') : ''}
    </th>
  );

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div className="page-header">
        <div>
          <div className="page-title">Portfolio</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            {HOLDINGS.length} positions · {formatCurrency(PORTFOLIO_KPI.totalValue)} total value
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost"><RefreshCw size={12} /> Refresh</button>
          <button className="btn btn-ghost"><Download size={12} /> Export CSV</button>
        </div>
      </div>

      {/* Summary bar */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Value', value: formatCurrency(PORTFOLIO_KPI.totalValue), color: 'var(--text-primary)' },
          { label: 'Cost Basis', value: formatCurrency(PORTFOLIO_KPI.totalCostBasis), color: 'var(--text-secondary)' },
          { label: 'Unrealized Gain', value: formatCurrency(PORTFOLIO_KPI.totalGain), color: 'var(--positive)' },
          { label: 'Total Return', value: formatPercent(PORTFOLIO_KPI.totalGainPct), color: 'var(--positive)' },
          { label: "Today's Change", value: formatCurrency(PORTFOLIO_KPI.dayChange), color: 'var(--positive)' },
        ].map(item => (
          <div key={item.label} className="vault-card" style={{ padding: '12px 16px', flex: 1, minWidth: 140 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', color: item.color }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom: 16 }}>
        {TABS.map(t => <div key={t} className={`tab-item ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</div>)}
      </div>

      {tab === 'Holdings' && (
        <div className="vault-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="vault-table">
              <thead>
                <tr>
                  <th>Ticker</th>
                  <th>Sector</th>
                  <SortTh k="shares" label="Shares" />
                  <SortTh k="avgCost" label="Avg Cost" />
                  <SortTh k="currentPrice" label="Price" />
                  <SortTh k="dayChangePct" label="Day %" />
                  <SortTh k="marketValue" label="Market Value" />
                  <SortTh k="unrealizedGain" label="Gain/Loss" />
                  <SortTh k="unrealizedGainPct" label="Return %" />
                  <SortTh k="weight" label="Weight" />
                </tr>
              </thead>
              <tbody>
                {sortedHoldings.map(h => (
                  <tr key={h.ticker}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: h.logoColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          {h.ticker.slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{h.ticker}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.name}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-neutral">{h.sector}</span></td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{h.shares.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatCurrency(h.avgCost)}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatCurrency(h.currentPrice)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`badge ${getChangeBg(h.dayChangePct)}`}>{formatPercent(h.dayChangePct)}</span>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatCurrency(h.marketValue)}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: h.unrealizedGain >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
                      {h.unrealizedGain >= 0 ? '+' : ''}{formatCurrency(h.unrealizedGain)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`badge ${getChangeBg(h.unrealizedGainPct)}`}>{formatPercent(h.unrealizedGainPct)}</span>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{h.weight}%</td>
                  </tr>
                ))}
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
                <tr>
                  <th>Ticker</th>
                  <th style={{ textAlign: 'right' }}>Shares</th>
                  <th style={{ textAlign: 'right' }}>Cost Basis</th>
                  <th style={{ textAlign: 'right' }}>Current Price</th>
                  <th>Acquired</th>
                  <th>Holding</th>
                  <th style={{ textAlign: 'right' }}>Unrealized Gain</th>
                  <th style={{ textAlign: 'right' }}>Est. Tax</th>
                </tr>
              </thead>
              <tbody>
                {TAX_LOTS.slice(0, 20).map(lot => (
                  <tr key={lot.id}>
                    <td style={{ fontWeight: 600 }}>{lot.ticker}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{lot.shares}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatCurrency(lot.costBasis)}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatCurrency(lot.currentValue)}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{lot.acquiredDate}</td>
                    <td>
                      <span className={`badge ${lot.holdingPeriod === 'long' ? 'badge-positive' : 'badge-warning'}`}>
                        {lot.holdingPeriod === 'long' ? 'Long-term' : 'Short-term'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: lot.unrealizedGain >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
                      {formatCurrency(lot.unrealizedGain)}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--warning)' }}>
                      {formatCurrency(lot.estimatedTax)}
                    </td>
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
                <Pie data={SECTOR_ALLOCATION} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value" stroke="none">
                  {SECTOR_ALLOCATION.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="vault-card" style={{ padding: 24 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Breakdown</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {SECTOR_ALLOCATION.map(s => (
                <div key={s.sector}>
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
                    <div style={{ height: '100%', width: `${s.pct}%`, background: s.color, borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'Rebalancing' && (
        <div className="vault-card" style={{ padding: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Rebalancing Tool</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20 }}>Set target allocations to generate rebalancing orders</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {SECTOR_ALLOCATION.map(s => (
              <div key={s.sector} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 140, fontSize: 13 }}>{s.sector}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', width: 60, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>Current: {s.pct}%</div>
                <input type="range" min={0} max={100} defaultValue={s.pct} style={{ flex: 1, accentColor: s.color }} />
                <div style={{ width: 44 }}>
                  <input type="number" defaultValue={s.pct} className="vault-input" style={{ width: 44, padding: '4px 6px', textAlign: 'center' }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            <button className="btn btn-primary">Generate Rebalance Orders</button>
            <button className="btn btn-ghost">Reset to Current</button>
          </div>
        </div>
      )}
    </div>
  );
}