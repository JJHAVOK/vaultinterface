'use client';
import { useState, useEffect } from 'react';
import { MARKET_INDICES, MARKET_NEWS, SECTOR_ALLOCATION, WATCHLIST_ITEMS } from '@/lib/mock-data';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

const EARNINGS = [
  { ticker: 'AAPL', date: 'Apr 25', eps: 1.62, estimate: 1.58, surprise: '+2.5%' },
  { ticker: 'MSFT', date: 'Apr 26', eps: 2.94, estimate: 2.82, surprise: '+4.3%' },
  { ticker: 'GOOGL', date: 'Apr 29', eps: 1.89, estimate: 1.84, surprise: '+2.7%' },
  { ticker: 'META', date: 'Apr 30', eps: 4.71, estimate: 4.31, surprise: '+9.3%' },
  { ticker: 'AMZN', date: 'May 1', eps: 0.98, estimate: 0.83, surprise: '+18.1%' },
];

export default function MarketsPage() {
  const [indices, setIndices] = useState(MARKET_INDICES);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndices(prev => prev.map(idx => ({
        ...idx,
        value: parseFloat((idx.value * (1 + (Math.random() - 0.5) * 0.001)).toFixed(2)),
        change: parseFloat((idx.change + (Math.random() - 0.5) * 0.5).toFixed(2)),
        changePct: parseFloat((idx.changePct + (Math.random() - 0.5) * 0.05).toFixed(2)),
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const treemapData = SECTOR_ALLOCATION.map(s => ({ name: s.sector, size: s.value, color: s.color, pct: s.pct }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.4s ease' }}>
      <div className="page-header">
        <div className="page-title">Markets</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--positive)', animation: 'pulse-dot 2s infinite' }} />
          <span style={{ fontSize: 11, color: 'var(--positive)' }}>Live</span>
        </div>
      </div>

      {/* Major indices */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {indices.slice(0, 6).map(idx => (
          <div key={idx.ticker} className="vault-card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{idx.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{idx.ticker}</div>
              </div>
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

      {/* Sector Treemap + Top movers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="vault-card" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Sector Performance</div>
          <ResponsiveContainer width="100%" height={220}>
            <Treemap data={treemapData} dataKey="size" aspectRatio={4/3} stroke="var(--bg-primary)" fill="#8884d8"
              content={({ x, y, width, height, name, pct, color }: any) => (
                <g>
                  <rect x={x} y={y} width={width} height={height} fill={color} stroke="var(--bg-primary)" strokeWidth={2} rx={4} />
                  {width > 50 && height > 30 && (
                    <>
                      <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={600}>{name?.split(' ')[0]}</text>
                      <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize={10}>{pct}%</text>
                    </>
                  )}
                </g>
              )}
            />
          </ResponsiveContainer>
        </div>

        <div className="vault-card" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Top Movers</div>
          <div style={{ marginBottom: 10, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gainers</div>
          {WATCHLIST_ITEMS.filter(w => w.changePct > 0).slice(0, 3).map(w => (
            <div key={w.ticker} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{w.ticker}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{w.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{formatCurrency(w.price)}</div>
                <span className="badge badge-positive">{formatPercent(w.changePct)}</span>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 14, marginBottom: 10, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Losers</div>
          {WATCHLIST_ITEMS.filter(w => w.changePct < 0).slice(0, 2).map(w => (
            <div key={w.ticker} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{w.ticker}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{w.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{formatCurrency(w.price)}</div>
                <span className="badge badge-negative">{formatPercent(w.changePct)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings + News */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="vault-card" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Earnings Calendar</div>
          <table className="vault-table">
            <thead><tr><th>Ticker</th><th>Date</th><th style={{ textAlign: 'right' }}>EPS</th><th style={{ textAlign: 'right' }}>Est.</th><th style={{ textAlign: 'right' }}>Surprise</th></tr></thead>
            <tbody>
              {EARNINGS.map(e => (
                <tr key={e.ticker}>
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

        <div className="vault-card" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>News Feed</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MARKET_NEWS.map(n => (
              <div key={n.id} style={{ paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span className={`badge ${n.sentiment === 'bullish' ? 'badge-positive' : n.sentiment === 'bearish' ? 'badge-negative' : 'badge-neutral'} `} style={{ flexShrink: 0, marginTop: 1, fontSize: 9 }}>
                    {n.sentiment}
                  </span>
                  <div>
                    <div style={{ fontSize: 12, lineHeight: 1.4, marginBottom: 3 }}>{n.headline}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{n.source} · {n.time}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}