'use client';
import { useState, useEffect } from 'react';
import { Treemap, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { MARKET_INDICES, MARKET_NEWS, SECTOR_ALLOCATION, WATCHLIST_ITEMS } from '@/lib/mock-data';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { useLivePrices } from '@/lib/useLivePrices';

// Fear & Greed Gauge SVG
function FearGreedGauge({ value }: { value: number }) {
  const angle = -90 + (value / 100) * 180;
  const color = value < 25 ? '#ef4444' : value < 45 ? '#f97316' : value < 55 ? '#f59e0b' : value < 75 ? '#84cc16' : '#10b981';
  const label = value < 25 ? 'Extreme Fear' : value < 45 ? 'Fear' : value < 55 ? 'Neutral' : value < 75 ? 'Greed' : 'Extreme Greed';

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={180} height={100} viewBox="0 0 180 100">
        {/* Background arc */}
        <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" stroke="var(--bg-elevated)" strokeWidth={16} strokeLinecap="round" />
        {/* Color arc */}
        <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" stroke={color} strokeWidth={16} strokeLinecap="round"
          strokeDasharray={`${(value / 100) * 251.2} 251.2`} />
        {/* Needle */}
        <line x1="90" y1="90" x2={90 + 60 * Math.cos((angle - 180) * Math.PI / 180)} y2={90 + 60 * Math.sin((angle - 180) * Math.PI / 180)}
          stroke="var(--text-primary)" strokeWidth={2} strokeLinecap="round" />
        <circle cx="90" cy="90" r="5" fill="var(--text-primary)" />
        {/* Labels */}
        <text x="10" y="100" fill="var(--text-muted)" fontSize="9" fontFamily="var(--font-mono)">Fear</text>
        <text x="148" y="100" fill="var(--text-muted)" fontSize="9" fontFamily="var(--font-mono)">Greed</text>
      </svg>
      <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-display)', color, marginTop: -8 }}>{value}</div>
      <div style={{ fontSize: 12, color, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

const OPTIONS_FLOW = [
  { ticker: 'NVDA', type: 'CALL', strike: 900, expiry: 'Apr 26', size: '$4.2M', sentiment: 'bullish', unusual: true },
  { ticker: 'SPY', type: 'PUT', strike: 510, expiry: 'May 2', size: '$8.1M', sentiment: 'bearish', unusual: true },
  { ticker: 'AAPL', type: 'CALL', strike: 195, expiry: 'Apr 26', size: '$2.8M', sentiment: 'bullish', unusual: false },
  { ticker: 'TSLA', type: 'PUT', strike: 170, expiry: 'May 16', size: '$3.4M', sentiment: 'bearish', unusual: true },
  { ticker: 'META', type: 'CALL', strike: 510, expiry: 'May 2', size: '$5.6M', sentiment: 'bullish', unusual: true },
  { ticker: 'AMD', type: 'CALL', strike: 185, expiry: 'Apr 26', size: '$1.9M', sentiment: 'bullish', unusual: false },
];

const ECON_CALENDAR = [
  { date: 'Apr 25', event: 'GDP Q1 Advance', impact: 'high', forecast: '2.4%', prev: '3.4%' },
  { date: 'Apr 26', event: 'PCE Price Index', impact: 'high', forecast: '0.3%', prev: '0.4%' },
  { date: 'Apr 30', event: 'JOLTS Job Openings', impact: 'medium', forecast: '8.75M', prev: '8.79M' },
  { date: 'May 1', event: 'Fed Funds Rate Decision', impact: 'high', forecast: '5.25-5.50%', prev: '5.25-5.50%' },
  { date: 'May 3', event: 'Nonfarm Payrolls', impact: 'high', forecast: '243K', prev: '275K' },
];

const EARNINGS = [
  { ticker: 'AAPL', date: 'Apr 25', eps: 1.62, estimate: 1.58, surprise: '+2.5%' },
  { ticker: 'MSFT', date: 'Apr 26', eps: 2.94, estimate: 2.82, surprise: '+4.3%' },
  { ticker: 'GOOGL', date: 'Apr 29', eps: 1.89, estimate: 1.84, surprise: '+2.7%' },
  { ticker: 'META', date: 'Apr 30', eps: 4.71, estimate: 4.31, surprise: '+9.3%' },
  { ticker: 'AMZN', date: 'May 1', eps: 0.98, estimate: 0.83, surprise: '+18.1%' },
];

export default function MarketsPage() {
  const prices = useLivePrices();
  const [indices, setIndices] = useState(MARKET_INDICES);
  const [fearGreed] = useState(62);
  const [activeTab, setActiveTab] = useState<'overview' | 'options' | 'calendar'>('overview');

  useEffect(() => {
    const interval = setInterval(() => {
      setIndices(prev => prev.map(idx => ({
        ...idx,
        value: parseFloat((idx.value * (1 + (Math.random() - 0.5) * 0.001)).toFixed(2)),
        change: parseFloat((idx.change + (Math.random() - 0.5) * 0.2).toFixed(2)),
        changePct: parseFloat((idx.changePct + (Math.random() - 0.5) * 0.02).toFixed(2)),
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.4s ease' }}>
      <div className="page-header">
        <div className="page-title">Markets</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--positive)', animation: 'pulse-dot 2s infinite' }} />
          <span style={{ fontSize: 11, color: 'var(--positive)' }}>Live · updates every 3s</span>
        </div>
      </div>

      {/* Indices grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {indices.slice(0, 6).map(idx => (
          <div key={idx.ticker} className="vault-card" style={{ padding: 16, cursor: 'pointer', transition: 'background 200ms' }}
            onClick={() => toast.info(idx.name, `${idx.ticker}: ${idx.value.toLocaleString()} (${formatPercent(idx.changePct)}) · ${idx.changePct >= 0 ? '↑' : '↓'} ${Math.abs(idx.change).toFixed(2)} today`)}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = '')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{idx.name}</div>
              <span className={`badge ${idx.changePct >= 0 ? 'badge-positive' : 'badge-negative'}`}>{formatPercent(idx.changePct)}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', fontVariantNumeric: 'tabular-nums' }}>
              {idx.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 12, color: idx.change >= 0 ? 'var(--positive)' : 'var(--negative)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
              {idx.change >= 0 ? '+' : ''}{idx.change.toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Tab nav */}
      <div className="tab-bar">
        {(['overview', 'options', 'calendar'] as const).map(t => (
          <div key={t} className={`tab-item ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)} style={{ textTransform: 'capitalize' }}>{t}</div>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {/* Sector treemap */}
            <div className="vault-card" style={{ padding: 20, gridColumn: 'span 2' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Sector Heatmap</div>
              <ResponsiveContainer width="100%" height={200}>
                <Treemap data={SECTOR_ALLOCATION.map(s => ({ name: s.sector, size: s.value, color: s.color, pct: s.pct }))}
                  dataKey="size" stroke="var(--bg-primary)" fill="#8884d8"
                  content={({ x, y, width, height, name, pct, color }: any) => (
                    <g onClick={() => toast.info(name, `${pct}% of portfolio · ${formatCurrency((SECTOR_ALLOCATION.find(s => s.sector === name)?.value) ?? 0)}`)} style={{ cursor: 'pointer' }}>
                      <rect x={x} y={y} width={width} height={height} fill={color} stroke="var(--bg-primary)" strokeWidth={2} rx={4} />
                      {width > 50 && height > 30 && (
                        <>
                          <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={600}>{name?.split(' ')[0]}</text>
                          <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize={10}>{pct}%</text>
                        </>
                      )}
                    </g>
                  )} />
              </ResponsiveContainer>
            </div>

            {/* Fear & Greed */}
            <div className="vault-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Fear & Greed</div>
              <FearGreedGauge value={fearGreed} />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>Market sentiment index</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Top movers */}
            <div className="vault-card" style={{ padding: 20 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Top Movers</div>
              <div style={{ marginBottom: 10, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gainers</div>
              {WATCHLIST_ITEMS.filter(w => w.changePct > 0).slice(0, 3).map(w => (
                <div key={w.ticker} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  onClick={() => toast.info(w.ticker, `${w.name} · ${formatCurrency(w.price)} · Vol: ${w.volume}`)}>
                  <div><div style={{ fontWeight: 600, fontSize: 13 }}>{w.ticker}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{w.name}</div></div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{formatCurrency(w.price)}</div>
                    <span className="badge badge-positive">{formatPercent(w.changePct)}</span>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 14, marginBottom: 10, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Losers</div>
              {WATCHLIST_ITEMS.filter(w => w.changePct < 0).slice(0, 2).map(w => (
                <div key={w.ticker} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  onClick={() => toast.info(w.ticker, `${w.name} · ${formatCurrency(w.price)} · Vol: ${w.volume}`)}>
                  <div><div style={{ fontWeight: 600, fontSize: 13 }}>{w.ticker}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{w.name}</div></div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{formatCurrency(w.price)}</div>
                    <span className="badge badge-negative">{formatPercent(w.changePct)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* News + Earnings */}
            <div className="vault-card" style={{ padding: 20 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Earnings Calendar</div>
              <table className="vault-table">
                <thead><tr><th>Ticker</th><th>Date</th><th style={{ textAlign: 'right' }}>EPS</th><th style={{ textAlign: 'right' }}>Est.</th><th style={{ textAlign: 'right' }}>Surprise</th></tr></thead>
                <tbody>
                  {EARNINGS.map(e => (
                    <tr key={e.ticker} style={{ cursor: 'pointer' }} onClick={() => toast.info(`${e.ticker} Earnings`, `EPS: $${e.eps} vs est. $${e.estimate} — surprise ${e.surprise}`)}>
                      <td style={{ fontWeight: 600 }}>{e.ticker}</td>
                      <td style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{e.date}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>${e.eps}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>${e.estimate}</td>
                      <td style={{ textAlign: 'right' }}><span className="badge badge-positive">{e.surprise}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'options' && (
        <div className="vault-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>Unusual Options Flow</div>
            <span className="badge badge-cyan">Live</span>
          </div>
          <table className="vault-table">
            <thead>
              <tr><th>Ticker</th><th>Type</th><th style={{ textAlign: 'right' }}>Strike</th><th>Expiry</th><th style={{ textAlign: 'right' }}>Size</th><th>Sentiment</th><th>Unusual</th></tr>
            </thead>
            <tbody>
              {OPTIONS_FLOW.map((o, i) => (
                <tr key={i} style={{ cursor: 'pointer' }}
                  onClick={() => toast.info(`${o.ticker} ${o.type}`, `$${o.strike} strike · ${o.expiry} · ${o.size} volume · ${o.sentiment}`)}>
                  <td style={{ fontWeight: 700 }}>{o.ticker}</td>
                  <td><span className={`badge ${o.type === 'CALL' ? 'badge-positive' : 'badge-negative'}`}>{o.type}</span></td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>${o.strike}</td>
                  <td style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{o.expiry}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-cyan)' }}>{o.size}</td>
                  <td><span className={`badge ${o.sentiment === 'bullish' ? 'badge-positive' : 'badge-negative'}`}>{o.sentiment}</span></td>
                  <td>{o.unusual && <span className="badge badge-warning">⚡ Unusual</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>Economic Calendar</div>
          {ECON_CALENDAR.map((e, i) => (
            <div key={i} className="vault-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'background 200ms' }}
              onClick={() => toast.info(e.event, `Forecast: ${e.forecast} · Previous: ${e.prev}`)}
              onMouseEnter={ev => (ev.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={ev => (ev.currentTarget.style.background = '')}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', width: 50 }}>{e.date}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{e.event}</div>
              </div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Forecast</div>
                  <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>{e.forecast}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Previous</div>
                  <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{e.prev}</div>
                </div>
                <span className={`badge ${e.impact === 'high' ? 'badge-negative' : e.impact === 'medium' ? 'badge-warning' : 'badge-neutral'}`}>
                  {e.impact}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}