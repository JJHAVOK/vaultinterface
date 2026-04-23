'use client';
import { useLivePrices } from '@/lib/useLivePrices';
import { HOLDINGS } from '@/lib/mock-data';

export default function TickerStrip() {
  const prices = useLivePrices();

  const items = HOLDINGS.map(h => ({
    ticker: h.ticker,
    price: prices[h.ticker] ?? h.currentPrice,
    changePct: h.dayChangePct + (Math.random() - 0.5) * 0.1,
  }));

  // Duplicate for seamless loop
  const doubled = [...items, ...items];

  return (
    <div style={{
      background: 'var(--bg-tertiary)',
      borderBottom: '1px solid var(--border)',
      overflow: 'hidden',
      height: 28,
      display: 'flex',
      alignItems: 'center',
    }}>
      <div style={{ display: 'flex', animation: 'ticker-scroll 35s linear infinite', whiteSpace: 'nowrap' }}>
        {doubled.map((item, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 18px', borderRight: '1px solid var(--border)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--text-muted)', letterSpacing: '0.04em' }}>{item.ticker}</span>
            <span style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
              ${item.price.toFixed(2)}
            </span>
            <span style={{ color: item.changePct >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
              {item.changePct >= 0 ? '▲' : '▼'}{Math.abs(item.changePct).toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
