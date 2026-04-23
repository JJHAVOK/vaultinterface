'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, Percent, Wallet, X, ExternalLink } from 'lucide-react';
import { PORTFOLIO_KPI, PORTFOLIO_HISTORY, SECTOR_ALLOCATION, HOLDINGS, MARKET_NEWS, WATCHLIST_ITEMS } from '@/lib/mock-data';
import { formatCurrency, formatPercent, getChangeBg } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import type { Holding } from '@/lib/types';

const RANGES = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

function KPICard({ label, value, sub, subColor, icon: Icon }: { label: string; value: string; sub: string; subColor: string; icon: React.ElementType }) {
  return (
    <div className="vault-card" style={{ padding: 16, flex: 1, minWidth: 160, animation: 'fadeIn 0.4s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={13} style={{ color: 'var(--text-secondary)' }} />
        </div>
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: subColor, fontFamily: 'var(--font-mono)' }}>{sub}</div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
      <div style={{ color: 'var(--accent-cyan)', marginBottom: 2 }}>Portfolio: {formatCurrency(payload[0]?.value)}</div>
      <div style={{ color: '#7c3aed' }}>S&P 500: {formatCurrency(payload[1]?.value)}</div>
    </div>
  );
};

function HoldingModal({ holding, onClose }: { holding: Holding; onClose: () => void }) {
  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 480, background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)', borderRadius: 14, zIndex: 60, boxShadow: '0 24px 80px rgba(0,0,0,0.5)', animation: 'fadeIn 0.2s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: holding.logoColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
              {holding.ticker.slice(0, 2)}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>{holding.ticker}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{holding.name}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Current Price', value: formatCurrency(holding.currentPrice) },
              { label: 'Day Change', value: `${formatPercent(holding.dayChangePct)}`, color: holding.dayChangePct >= 0 ? 'var(--positive)' : 'var(--negative)' },
              { label: 'Shares', value: holding.shares.toLocaleString() },
              { label: 'Avg Cost', value: formatCurrency(holding.avgCost) },
              { label: 'Market Value', value: formatCurrency(holding.marketValue) },
              { label: 'Cost Basis', value: formatCurrency(holding.costBasis) },
              { label: 'Unrealized Gain', value: formatCurrency(holding.unrealizedGain), color: holding.unrealizedGain >= 0 ? 'var(--positive)' : 'var(--negative)' },
              { label: 'Total Return', value: formatPercent(holding.unrealizedGainPct), color: holding.unrealizedGainPct >= 0 ? 'var(--positive)' : 'var(--negative)' },
              { label: 'Portfolio Weight', value: `${holding.weight}%` },
              { label: 'Sector', value: holding.sector },
            ].map(item => (
              <div key={item.label} style={{ padding: '10px 12px', background: 'var(--bg-tertiary)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-mono)', color: (item as any).color || 'var(--text-primary)' }}>{item.value}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { toast.success('Order placed', `Buy order for ${holding.ticker} submitted`); onClose(); }}>
              Buy More
            </button>
            <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => { toast.warning('Order placed', `Sell order for ${holding.ticker} submitted`); onClose(); }}>
              Sell
            </button>
            <button className="btn btn-ghost" onClick={() => { toast.info('Added to watchlist', `${holding.ticker} added to Tech Giants`); onClose(); }}>
              + Watchlist
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [range, setRange] = useState('1Y');
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null);
  const [prices, setPrices] = useState(() => Object.fromEntries(HOLDINGS.map(h => [h.ticker, h.currentPrice])));

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => Object.fromEntries(
        Object.entries(prev).map(([ticker, price]) => [ticker, parseFloat((price * (1 + (Math.random() - 0.5) * 0.002)).toFixed(2))])
      ));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Toast on mount
  useEffect(() => {
    setTimeout(() => toast.info('Markets open', 'S&P 500 is up +0.81% today'), 1500);
  }, []);

  const rangeData = {
    '1D': PORTFOLIO_HISTORY.slice(-1), '1W': PORTFOLIO_HISTORY.slice(-7),
    '1M': PORTFOLIO_HISTORY.slice(-30), '3M': PORTFOLIO_HISTORY.slice(-90),
    '1Y': PORTFOLIO_HISTORY.slice(-365), 'ALL': PORTFOLIO_HISTORY,
  }[range] || PORTFOLIO_HISTORY;

  const chartData = rangeData.map(d => ({ date: d.date.slice(5), portfolio: d.value, benchmark: d.benchmark }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.4s ease' }}>
      {selectedHolding && <HoldingModal holding={selectedHolding} onClose={() => setSelectedHolding(null)} />}

      <div className="stagger" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <KPICard label="Total Value" value={formatCurrency(PORTFOLIO_KPI.totalValue)} sub={`${formatPercent(PORTFOLIO_KPI.totalGainPct)} all-time`} subColor="var(--positive)" icon={Wallet} />
        <KPICard label="Today's P&L" value={formatCurrency(PORTFOLIO_KPI.dayChange)} sub={`${formatPercent(PORTFOLIO_KPI.dayChangePct)} today`} subColor="var(--positive)" icon={TrendingUp} />
        <KPICard label="Total Gain" value={formatCurrency(PORTFOLIO_KPI.totalGain)} sub="Unrealized" subColor="var(--positive)" icon={Activity} />
        <KPICard label="YTD Return" value={`+${PORTFOLIO_KPI.ytdReturn}%`} sub="Year to date" subColor="var(--positive)" icon={Percent} />
        <KPICard label="Cash" value={formatCurrency(PORTFOLIO_KPI.cashPosition)} sub="Available" subColor="var(--text-muted)" icon={DollarSign} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
        <div className="vault-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 2 }}>Portfolio Performance</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>vs S&P 500 benchmark</div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {RANGES.map(r => (
                <button key={r} onClick={() => setRange(r)} style={{ padding: '4px 10px', borderRadius: 5, border: 'none', cursor: 'pointer', background: range === r ? 'var(--accent-cyan)' : 'var(--bg-elevated)', color: range === r ? '#000' : 'var(--text-secondary)', fontSize: 11, fontFamily: 'var(--font-mono)', transition: 'all 150ms' }}>{r}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="benchmarkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: '#4d5a6e', fontSize: 10 }} tickLine={false} axisLine={false} interval={Math.floor(chartData.length / 6)} />
              <YAxis tick={{ fill: '#4d5a6e', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} width={48} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="benchmark" stroke="#7c3aed" strokeWidth={1.5} fill="url(#benchmarkGrad)" dot={false} />
              <Area type="monotone" dataKey="portfolio" stroke="#00d4ff" strokeWidth={2} fill="url(#portfolioGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="vault-card" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Allocation</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={SECTOR_ALLOCATION} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value" stroke="none"
                  onClick={(entry: any) => { toast.info(entry.sector, `${entry.pct}% of portfolio · ${formatCurrency(entry.value)}`); }}>
                  {SECTOR_ALLOCATION.map((entry, i) => <Cell key={i} fill={entry.color} style={{ cursor: 'pointer' }} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SECTOR_ALLOCATION.map(s => (
              <div key={s.sector} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                onClick={() => toast.info(s.sector, `${s.pct}% · ${formatCurrency(s.value)}`)}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 11, color: 'var(--text-secondary)' }}>{s.sector}</span>
                <span style={{ fontSize: 11, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="vault-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>Top Holdings</div>
            <button onClick={() => router.push('/dashboard/portfolio')} style={{ fontSize: 11, color: 'var(--accent-cyan)', background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
          </div>
          <table className="vault-table">
            <thead><tr><th>Ticker</th><th style={{ textAlign: 'right' }}>Price</th><th style={{ textAlign: 'right' }}>Day</th><th style={{ textAlign: 'right' }}>Value</th></tr></thead>
            <tbody>
              {HOLDINGS.slice(0, 6).map(h => (
                <tr key={h.ticker} style={{ cursor: 'pointer' }} onClick={() => setSelectedHolding(h)}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{h.ticker}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{h.shares} shares</div>
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatCurrency(prices[h.ticker] || h.currentPrice)}</td>
                  <td style={{ textAlign: 'right' }}><span className={`badge ${h.dayChangePct >= 0 ? 'badge-positive' : 'badge-negative'}`}>{formatPercent(h.dayChangePct)}</span></td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatCurrency(h.marketValue, true)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="vault-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>Market News</div>
            <button onClick={() => router.push('/dashboard/markets')} style={{ fontSize: 11, color: 'var(--accent-cyan)', background: 'none', border: 'none', cursor: 'pointer' }}>Markets →</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {MARKET_NEWS.slice(0, 5).map(n => (
              <div key={n.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', paddingBottom: 12, borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                onClick={() => toast.info(n.ticker, n.headline)}>
                <span className={`badge ${n.sentiment === 'bullish' ? 'badge-positive' : n.sentiment === 'bearish' ? 'badge-negative' : 'badge-neutral'}`} style={{ flexShrink: 0, marginTop: 1 }}>{n.sentiment}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 3 }}>{n.headline}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{n.source} · {n.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
