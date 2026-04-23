'use client';
import Link from 'next/link';
import { Wallet, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-mono)', flexDirection: 'column', gap: 24,
      position: 'relative', overflow: 'hidden',
    }}>
      <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.3 }} />
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, animation: 'fadeIn 0.5s ease' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 120, fontWeight: 800, color: 'var(--bg-elevated)', lineHeight: 1, marginBottom: 8, letterSpacing: '-0.04em' }}>404</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={16} color="#000" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 }}>VAULT</span>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Page not found</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 28 }}>
          This position doesn't exist in your portfolio.
        </div>
        <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent-cyan)', color: '#000', padding: '10px 20px', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>
          <Home size={14} /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
