'use client';
import { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { PORTFOLIO_HISTORY, MONTHLY_RETURNS } from '@/lib/mock-data';
import { formatCurrency, formatPercent } from '@/lib/utils';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const RISK_METRICS = [
  { label: 'Sharpe Ratio', value: '1.84', desc: 'Risk-adjusted return', good: true },
  { label: 'Sortino Ratio', value: '2.31', desc: 'Downside risk adjusted', good: true },
  { label: 'Beta', value: '1.12', desc: 'vs S&P 500', good: true },
  { label: 'Alpha', value: '+4.2%', desc: 'Annualized excess return', good: true },
  { label: 'Max Drawdown', value: '-18.4%', desc: 'Peak to trough', good: false },
  { label: 'Volatility', value: '22.1%', desc: 'Annualized std dev', good: null },
];

export default function AnalyticsPage() {
  const [scenario, setScenario] = useState(0);

  const benchmarkData = PORTFOLIO_HISTORY.slice(-180).map((d, i) => ({
    date: d.date.slice(5),
    Portfolio: d.value,
    'S&P 500': d.benchmark,
    'All-Weather': d.benchmark * 0.85 + d.value * 0.15,
  }));

  // Drawdown data
  const drawdownData = PORTFOLIO_HISTORY.slice(-180).map((d, i, arr) => {
    const peak = Math.max(...arr.slice(0, i + 1).map(x => x.value));
    const dd = ((d.value - peak) / peak) * 100;
    return { date: d.date.slice(5), drawdown: parseFloat(dd.toFixed(2)) };
  });

  // Monthly heatmap
  const years = [2021, 2022, 2023, 2024];
  const heatmapData = years.map(year => ({
    year,
    months: MONTHS.map((_, mi) => {
      const entry = MONTHLY_RETURNS.find(r => r.year === year && r.month === mi + 1);
      return entry?.return ?? 0;
    }),
  }));

  const scenarioPortfolio = 208813 * (1 + scenario / 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.4s ease' }}>
      <div className="page-header">
        <div className="page-title">Analytics</div>
      </div>

      {/* Risk Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
        {RISK_METRICS.map(m => (
          <div key={m.label} className="vault-card" style={{ padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: m.good === true ? 'var(--positive)' : m.good === false ? 'var(--negative)' : 'var(--text-primary)' }}>{m.value}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{m.desc}</div>
          </div>
        ))}
      </div>

      {/* Performance vs Benchmark */}
      <div className="vault-card" style={{ padding: 20 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Performance vs Benchmarks</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={benchmarkData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" tick={{ fill: '#4d5a6e', fontSize: 10 }} tickLine={false} axisLine={false} interval={30} />
            <YAxis tick={{ fill: '#4d5a6e', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} width={48} />
            <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => formatCurrency(v)} />
            <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)' }} />
            <Line type="monotone" dataKey="Portfolio" stroke="#00d4ff" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="S&P 500" stroke="#7c3aed" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
            <Line type="monotone" dataKey="All-Weather" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Drawdown + Heatmap row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Drawdown chart */}
        <div className="vault-card" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Drawdown Chart</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={drawdownData}>
              <defs>
                <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: '#4d5a6e', fontSize: 9 }} tickLine={false} axisLine={false} interval={30} />
              <YAxis tick={{ fill: '#4d5a6e', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} width={40} />
              <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [`${v}%`, 'Drawdown']} />
              <Area type="monotone" dataKey="drawdown" stroke="#ef4444" strokeWidth={1.5} fill="url(#ddGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Scenario analysis */}
        <div className="vault-card" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Scenario Analysis</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20 }}>Market movement impact on portfolio</div>
          <div style={{ marginBottom: 20 }}>
            <input type="range" min={-50} max={50} value={scenario} onChange={e => setScenario(Number(e.target.value))}
              style={{ width: '100%', accentColor: scenario >= 0 ? 'var(--positive)' : 'var(--negative)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              <span>-50%</span><span style={{ color: scenario >= 0 ? 'var(--positive)' : 'var(--negative)', fontWeight: 600 }}>{scenario >= 0 ? '+' : ''}{scenario}%</span><span>+50%</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Current Value</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatCurrency(208813)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>After Scenario</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: scenario >= 0 ? 'var(--positive)' : 'var(--negative)' }}>{formatCurrency(scenarioPortfolio)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Estimated Change</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: scenario >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
                {scenario >= 0 ? '+' : ''}{formatCurrency(scenarioPortfolio - 208813)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Returns Heatmap */}
      <div className="vault-card" style={{ padding: 20, overflowX: 'auto' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Monthly Returns Heatmap</div>
        <div style={{ minWidth: 600 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(12, 1fr)', gap: 3, marginBottom: 6 }}>
            <div />
            {MONTHS.map(m => <div key={m} style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{m}</div>)}
          </div>
          {heatmapData.map(row => (
            <div key={row.year} style={{ display: 'grid', gridTemplateColumns: '60px repeat(12, 1fr)', gap: 3, marginBottom: 3 }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', fontFamily: 'var(--font-mono)' }}>{row.year}</div>
              {row.months.map((ret, mi) => {
                const intensity = Math.min(Math.abs(ret) / 10, 1);
                const bg = ret > 0 ? `rgba(16,185,129,${0.15 + intensity * 0.6})` : `rgba(239,68,68,${0.15 + intensity * 0.6})`;
                return (
                  <div key={mi} title={`${MONTHS[mi]} ${row.year}: ${formatPercent(ret)}`}
                    style={{ height: 32, background: bg, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', cursor: 'default' }}>
                    {formatPercent(ret, 1)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}