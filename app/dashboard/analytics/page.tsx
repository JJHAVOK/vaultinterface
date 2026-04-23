'use client';
import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, BarChart, Bar } from 'recharts';
import { PORTFOLIO_HISTORY, MONTHLY_RETURNS } from '@/lib/mock-data';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { X } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const RISK_METRICS = [
  { label: 'Sharpe Ratio', value: '1.84', desc: 'Risk-adjusted return', good: true, detail: 'A Sharpe ratio of 1.84 means your portfolio earns 1.84 units of return per unit of risk. Anything above 1.0 is considered good; above 2.0 is excellent. Your portfolio outperforms the typical 60/40 benchmark of ~0.8.' },
  { label: 'Sortino Ratio', value: '2.31', desc: 'Downside risk adjusted', good: true, detail: 'Similar to Sharpe, but only penalizes downside volatility. A ratio of 2.31 indicates your gains are much more consistent than your losses, which is ideal for long-term wealth preservation.' },
  { label: 'Beta', value: '1.12', desc: 'vs S&P 500', good: true, detail: 'Beta of 1.12 means your portfolio moves 12% more than the S&P 500. When the market rises 10%, you tend to rise 11.2%. This indicates slightly elevated market sensitivity.' },
  { label: 'Alpha', value: '+4.2%', desc: 'Annualized excess return', good: true, detail: 'Alpha of +4.2% means your portfolio generates 4.2% more return per year than would be expected given its market risk. This represents genuine skill or edge in stock selection.' },
  { label: 'Max Drawdown', value: '-18.4%', desc: 'Peak to trough', good: false, detail: 'Your worst peak-to-trough decline was 18.4%, which occurred during the market correction. This is within normal range for a growth-oriented portfolio (typical: -15% to -25%).' },
  { label: 'Volatility', value: '22.1%', desc: 'Annualized std dev', good: null, detail: 'Annualized volatility of 22.1% is moderately high, driven primarily by your tech concentration (NVDA, AAPL, MSFT). Consider adding defensive sectors to reduce this toward 15-18%.' },
];

const CORRELATION_MATRIX = [
  { ticker: 'AAPL', AAPL: 1.00, NVDA: 0.72, MSFT: 0.81, GOOGL: 0.76, TSLA: 0.44, JPM: 0.38 },
  { ticker: 'NVDA', AAPL: 0.72, NVDA: 1.00, MSFT: 0.68, GOOGL: 0.61, TSLA: 0.52, JPM: 0.31 },
  { ticker: 'MSFT', AAPL: 0.81, NVDA: 0.68, MSFT: 1.00, GOOGL: 0.79, TSLA: 0.41, JPM: 0.42 },
  { ticker: 'GOOGL', AAPL: 0.76, NVDA: 0.61, MSFT: 0.79, GOOGL: 1.00, TSLA: 0.38, JPM: 0.44 },
  { ticker: 'TSLA', AAPL: 0.44, NVDA: 0.52, MSFT: 0.41, GOOGL: 0.38, TSLA: 1.00, JPM: 0.22 },
  { ticker: 'JPM', AAPL: 0.38, NVDA: 0.31, MSFT: 0.42, GOOGL: 0.44, TSLA: 0.22, JPM: 1.00 },
];
const CORR_TICKERS = ['AAPL', 'NVDA', 'MSFT', 'GOOGL', 'TSLA', 'JPM'];

const FACTOR_DATA = [
  { factor: 'Growth', exposure: 78 },
  { factor: 'Momentum', exposure: 62 },
  { factor: 'Quality', exposure: 71 },
  { factor: 'Value', exposure: 28 },
  { factor: 'Low Vol', exposure: 32 },
  { factor: 'Size', exposure: -15 },
];

function RiskModal({ metric, onClose }: { metric: typeof RISK_METRICS[0]; onClose: () => void }) {
  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 420, background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)', borderRadius: 14, zIndex: 60, boxShadow: '0 24px 80px rgba(0,0,0,0.5)', animation: 'fadeIn 0.2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>{metric.label}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={16} /></button>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 40, fontWeight: 700, fontFamily: 'var(--font-display)', color: metric.good === true ? 'var(--positive)' : metric.good === false ? 'var(--negative)' : 'var(--text-primary)', marginBottom: 6 }}>{metric.value}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>{metric.desc}</div>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.7, padding: 14, background: 'var(--bg-tertiary)', borderRadius: 8 }}>{metric.detail}</div>
          <button onClick={onClose} className="btn btn-ghost" style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}>Close</button>
        </div>
      </div>
    </>
  );
}

export default function AnalyticsPage() {
  const [scenario, setScenario] = useState(0);
  const [riskModal, setRiskModal] = useState<typeof RISK_METRICS[0] | null>(null);

  const benchmarkData = PORTFOLIO_HISTORY.slice(-180).map(d => ({
    date: d.date.slice(5), Portfolio: d.value, 'S&P 500': d.benchmark, 'All-Weather': d.benchmark * 0.85 + d.value * 0.15,
  }));

  const drawdownData = PORTFOLIO_HISTORY.slice(-180).map((d, i, arr) => {
    const peak = Math.max(...arr.slice(0, i + 1).map(x => x.value));
    return { date: d.date.slice(5), drawdown: parseFloat((((d.value - peak) / peak) * 100).toFixed(2)) };
  });

  const years = [2021, 2022, 2023, 2024];
  const heatmapData = years.map(year => ({
    year, months: MONTHS.map((_, mi) => MONTHLY_RETURNS.find(r => r.year === year && r.month === mi + 1)?.return ?? 0),
  }));

  const corrColor = (val: number) => {
    if (val === 1) return 'var(--bg-elevated)';
    if (val > 0.7) return 'rgba(239,68,68,0.6)';
    if (val > 0.5) return 'rgba(245,158,11,0.5)';
    if (val > 0.3) return 'rgba(245,158,11,0.25)';
    return 'rgba(16,185,129,0.3)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.4s ease' }}>
      {riskModal && <RiskModal metric={riskModal} onClose={() => setRiskModal(null)} />}

      <div className="page-header"><div className="page-title">Analytics</div></div>

      {/* Risk Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
        {RISK_METRICS.map(m => (
          <div key={m.label} className="vault-card" style={{ padding: 14, textAlign: 'center', cursor: 'pointer', transition: 'background 200ms' }}
            onClick={() => setRiskModal(m)}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = '')}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: m.good === true ? 'var(--positive)' : m.good === false ? 'var(--negative)' : 'var(--text-primary)' }}>{m.value}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{m.desc}</div>
            <div style={{ fontSize: 10, color: 'var(--accent-cyan)', marginTop: 4 }}>Click for details</div>
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
            <YAxis tick={{ fill: '#4d5a6e', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} width={48} />
            <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => formatCurrency(v)} />
            <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)' }} />
            <Line type="monotone" dataKey="Portfolio" stroke="#00d4ff" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="S&P 500" stroke="#7c3aed" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
            <Line type="monotone" dataKey="All-Weather" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Drawdown + Scenario */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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

        <div className="vault-card" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Scenario Analysis</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20 }}>Market movement impact on portfolio</div>
          <input type="range" min={-50} max={50} value={scenario} onChange={e => setScenario(Number(e.target.value))} style={{ width: '100%', accentColor: scenario >= 0 ? 'var(--positive)' : 'var(--negative)', marginBottom: 8 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>
            <span>-50%</span><span style={{ color: scenario >= 0 ? 'var(--positive)' : 'var(--negative)', fontWeight: 600 }}>{scenario >= 0 ? '+' : ''}{scenario}%</span><span>+50%</span>
          </div>
          {[
            { label: 'Current Value', value: formatCurrency(208813), color: 'var(--text-primary)' },
            { label: 'After Scenario', value: formatCurrency(208813 * (1 + scenario / 100)), color: scenario >= 0 ? 'var(--positive)' : 'var(--negative)' },
            { label: 'Estimated Change', value: `${scenario >= 0 ? '+' : ''}${formatCurrency(208813 * (scenario / 100))}`, color: scenario >= 0 ? 'var(--positive)' : 'var(--negative)' },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-tertiary)', borderRadius: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{row.label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: row.color }}>{row.value}</span>
            </div>
          ))}
          <button onClick={() => toast.info('Scenario analysis', `At ${scenario >= 0 ? '+' : ''}${scenario}% market move, estimated portfolio: ${formatCurrency(208813 * (1 + scenario / 100))}`)} className="btn btn-ghost" style={{ width: '100%', marginTop: 4, justifyContent: 'center' }}>Generate Rebalance Orders</button>
        </div>
      </div>

      {/* Correlation Matrix + Factor Exposure */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="vault-card" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Correlation Matrix</div>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `60px repeat(${CORR_TICKERS.length}, 1fr)`, gap: 3 }}>
              <div />
              {CORR_TICKERS.map(t => <div key={t} style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', paddingBottom: 4 }}>{t}</div>)}
              {CORRELATION_MATRIX.map(row => (
                <>
                  <div key={row.ticker + 'label'} style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', paddingRight: 4 }}>{row.ticker}</div>
                  {CORR_TICKERS.map(t => {
                    const val = (row as any)[t] as number;
                    return (
                      <div key={t} style={{ height: 36, background: corrColor(val), borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontFamily: 'var(--font-mono)', cursor: 'pointer', transition: 'opacity 200ms' }}
                        title={`${row.ticker} vs ${t}: ${val.toFixed(2)}`}
                        onClick={() => toast.info(`${row.ticker} × ${t}`, `Correlation: ${val.toFixed(2)} — ${val > 0.7 ? 'Highly correlated — limited diversification' : val > 0.5 ? 'Moderately correlated' : 'Low correlation — good diversification'}`)}>
                        {val.toFixed(2)}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>
        </div>

        <div className="vault-card" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Factor Exposure</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={FACTOR_DATA} layout="vertical">
              <XAxis type="number" domain={[-30, 100]} tick={{ fill: '#4d5a6e', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
              <YAxis type="category" dataKey="factor" tick={{ fill: '#8892a4', fontSize: 11 }} tickLine={false} axisLine={false} width={60} />
              <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [`${v}%`, 'Exposure']}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="exposure" radius={[0, 4, 4, 0]}
                onClick={(data: any) => toast.info(`${data.factor} exposure`, `${data.exposure > 0 ? '+' : ''}${data.exposure}% — ${data.exposure > 50 ? 'High positive exposure' : data.exposure > 0 ? 'Moderate exposure' : 'Negative exposure (contrarian)'}`)}
                fill="#00d4ff" label={{ position: 'right', fill: '#8892a4', fontSize: 10, formatter: (v: any) => `${v}%` }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Heatmap */}
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
                  <div key={mi} style={{ height: 32, background: bg, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
                    title={`${MONTHS[mi]} ${row.year}: ${formatPercent(ret)}`}
                    onClick={() => toast.info(`${MONTHS[mi]} ${row.year}`, `Monthly return: ${formatPercent(ret)}`)}>
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