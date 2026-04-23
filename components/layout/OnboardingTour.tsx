'use client';
import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { ChevronRight, X, Wallet } from 'lucide-react';

const STEPS = [
  { title: 'Welcome to Vault', desc: 'Your institutional-grade portfolio intelligence platform. Let\'s take a quick tour.', highlight: null },
  { title: 'Live Dashboard', desc: 'Your portfolio performance, KPIs, and holdings are all visible at a glance with real-time price updates every 3 seconds.', highlight: 'dashboard-kpi' },
  { title: 'Collapsible Sidebar', desc: 'Navigate between Portfolio, Analytics, Transactions, Markets, Screener, and more. Click the arrow at the bottom to collapse.', highlight: 'sidebar' },
  { title: 'Command Palette', desc: 'Press Cmd+K anywhere to instantly search pages, tickers, and actions without touching the mouse.', highlight: 'topbar' },
  { title: 'AI Assistant', desc: 'Chat with your AI financial advisor. It has full context of your portfolio and can analyze risk, suggest rebalancing, and answer market questions.', highlight: null },
  { title: 'You\'re all set!', desc: 'Press ? anytime for keyboard shortcuts. Click any holding for details, or head to Analytics for deep insights.', highlight: null },
];

export default function OnboardingTour() {
  const [step, setStep] = useState(0);
  const { completeOnboarding } = useAuthStore();

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) completeOnboarding();
    else setStep(s => s + 1);
  };

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)', zIndex: 70 }} />
      <div style={{
        position: 'fixed', bottom: 40, left: '50%', transform: 'translateX(-50%)',
        width: 440, background: 'var(--bg-secondary)',
        border: '1px solid var(--border-bright)',
        borderRadius: 16, zIndex: 71,
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        padding: 24, animation: 'fadeIn 0.3s ease',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={14} color="#000" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>Getting Started</span>
          </div>
          <button onClick={() => completeOnboarding()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}>
            <X size={14} />
          </button>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: i <= step ? 'var(--accent-cyan)' : 'var(--bg-elevated)', transition: 'background 300ms' }} />
          ))}
        </div>

        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{current.title}</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>{current.desc}</div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{step + 1} of {STEPS.length}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="btn btn-ghost">Back</button>
            )}
            <button onClick={handleNext} className="btn btn-primary">
              {isLast ? 'Get started' : 'Next'} <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
