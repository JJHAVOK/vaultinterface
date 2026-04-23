'use client';
import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, Percent, Wallet } from 'lucide-react';
import { PORTFOLIO_KPI, PORTFOLIO_HISTORY, SECTOR_ALLOCATION, HOLDINGS, MARKET_NEWS, WATCHLIST_ITEMS } from '@/lib/mock-data';
import { formatCurrency, formatPercent, getChangeColor, getChangeBg } from '@/lib/utils';

const RANGES = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

function KPICard({ label, value, sub, subColor, icon: Icon }: { label: string; value: string; sub: string; subColor: string; icon: React.ElementType }) {
  const [displayed, setDisplayed] = useState(false);
  useEffect(() => { setTimeout(() => setDisplayed(true), 100); }, []);
  return (
    <div className="vault-card" style={{ padding: 16, flex: 1, minWidth: 160, animation: 'fadeIn 0.4s ease forwards' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={13} style={{ color: 'var(--text-secondary)' }} />
        </div>
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: 4, opacity: displayed ? 1 : 0, transition: 'opacity 0.3s' }}>{value}</div>
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

export default function DashboardPage() {
  const [range, setRange] = useState('1Y');
  const [prices, setPrices] = useState(() => Object.fromEntries(HOLDINGS.map(h => [h.ticker, h.currentPrice])));

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => Object.fromEntries(
        Object.entries(prev).map(([ticker, price]) => [ticker, parseFloat((price * (1 + (Math.random() - 0.5) * 0.002)).toFixed(2))])
      ));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const rangeData = {
    '1D': PORTFOLIO_HISTORY.slice(-1),
    '1W': PORTFOLIO_HISTORY.slice(-7),
    '1M': PORTFOLIO_HISTORY.slice(-30),
    '3M': PORTFOLIO_HISTORY.slice(-90),
    '1Y': PORTFOLIO_HISTORY.slice(-365),
    'ALL': PORTFOLIO_HISTORY,
  }[range] || PORTFOLIO_HISTORY;

  const chartData = rangeData.map(d => ({
    date: d.date.slice(5),
    portfolio: d.value,
    benchmark: d.benchmark,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.4s ease' }}>
      {/* KPI Bar */}
      <div className="stagger" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <KPICard label="Total Value" value={formatCurrency(PORTFOLIO_KPI.totalValue)} sub={`${formatPercent(PORTFOLIO_KPI.totalGainPct)} all-time`} subColor="var(--positive)" icon={Wallet} />
        <KPICard label="Today's P&L" value={formatCurrency(PORTFOLIO_KPI.dayChange)} sub={`${formatPercent(PORTFOLIO_KPI.dayChangePct)} today`} subColor={PORTFOLIO_KPI.dayChange >= 0 ? 'var(--positive)' : 'var(--negative)'} icon={PORTFOLIO_KPI.dayChange >= 0 ? TrendingUp : TrendingDown} />
        <KPICard label="Total Gain" value={formatCurrency(PORTFOLIO_KPI.totalGain)} sub={`${formatPercent(PORTFOLIO_KPI.totalGainPct)} unrealized`} subColor="var(--positive)" icon={Activity} />
        <KPICard label="YTD Return" value={`+${PORTFOLIO_KPI.ytdReturn}%`} sub="Year to date" subColor="var(--positive)" icon={Percent} />
        <KPICard label="Cash" value={formatCurrency(PORTFOLIO_KPI.cashPosition)} sub="Available to invest" subColor="var(--text-muted)" icon={DollarSign} />
      </div>

      {/* Main row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
        {/* Portfolio Chart */}
        <div className="vault-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 2 }}>Portfolio Performance</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>vs S&P 500 benchmark</div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {RANGES.map(r => (
                <button key={r} onClick={() => setRange(r)} style={{
                  padding: '4px 10px', borderRadius: 5, border: 'none', cursor: 'pointer',
                  background: range === r ? 'var(--accent-cyan)' : 'var(--bg-elevated)',
                  color: range === r ? '#000' : 'var(--text-secondary)',
                  fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: range === r ? 600 : 400,
                  transition: 'all 150ms',
                }}>
                  {r}
                </button>
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
              <XAxis dataKey="date" tick={{ fill: '#4d5a6e', fontSize: 10, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} interval={Math.floor(chartData.length / 6)} />
              <YAxis tick={{ fill: '#4d5a6e', fontSize: 10, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} width={48} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="benchmark" stroke="#7c3aed" strokeWidth={1.5} fill="url(#benchmarkGrad)" dot={false} />
              <Area type="monotone" dataKey="portfolio" stroke="#00d4ff" strokeWidth={2} fill="url(#portfolioGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Allocation Donut */}
        <div className="vault-card" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Allocation</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={SECTOR_ALLOCATION} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value" stroke="none">
                  {SECTOR_ALLOCATION.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SECTOR_ALLOCATION.map(s => (
              <div key={s.sector} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.sector}</span>
                <span style={{ fontSize: 11, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Holdings preview */}
        <div className="vault-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>Top Holdings</div>
            <a href="/dashboard/portfolio" style={{ fontSize: 11, color: 'var(--accent-cyan)', textDecoration: 'none' }}>View all →</a>
          </div>
          <table className="vault-table">
            <thead>
              <tr>
                <th>Ticker</th>
                <th style={{ textAlign: 'right' }}>Price</th>
                <th style={{ textAlign: 'right' }}>Day</th>
                <th style={{ textAlign: 'right' }}>Value</th>
              </tr>
            </thead>
            <tbody>
              {HOLDINGS.slice(0, 6).map(h => (
                <tr key={h.ticker}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{h.ticker}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{h.shares} shares</div>
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatCurrency(prices[h.ticker] || h.currentPrice)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={`badge ${h.dayChangePct >= 0 ? 'badge-positive' : 'badge-negative'}`}>
                      {formatPercent(h.dayChangePct)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{formatCurrency(h.marketValue, true)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* News feed */}
        <div className="vault-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>Market News</div>
            <a href="/dashboard/markets" style={{ fontSize: 11, color: 'var(--accent-cyan)', textDecoration: 'none' }}>Markets →</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {MARKET_NEWS.slice(0, 5).map(n => (
              <div key={n.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                <span className={`badge ${n.sentiment === 'bullish' ? 'badge-positive' : n.sentiment === 'bearish' ? 'badge-negative' : 'badge-neutral'}`} style={{ flexShrink: 0, marginTop: 1 }}>
                  {n.sentiment}
                </span>
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
