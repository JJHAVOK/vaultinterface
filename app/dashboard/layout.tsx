'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useUIStore } from '@/lib/store';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import CommandPalette from '@/components/layout/CommandPalette';
import TickerStrip from '@/components/layout/TickerStrip';
import ShortcutsPanel from '@/components/layout/ShortcutsPanel';
import ToastContainer from '@/components/ui/Toast';
import OnboardingTour from '@/components/layout/OnboardingTour';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isFirstLogin } = useAuthStore();
  const { openShortcuts, theme } = useUIStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.replace('/login');
  }, [hydrated, isAuthenticated, router]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const vars = theme === 'light' ? {
      '--bg-primary': '#f0f2f7', '--bg-secondary': '#ffffff', '--bg-tertiary': '#f5f7fa',
      '--bg-elevated': '#e8ecf3', '--bg-hover': '#dde3ef',
      '--border': 'rgba(0,0,0,0.08)', '--border-bright': 'rgba(0,0,0,0.15)',
      '--text-primary': '#0f1629', '--text-secondary': '#4a5568', '--text-muted': '#9ca3af',
    } : {
      '--bg-primary': '#0a0e1a', '--bg-secondary': '#0f1629', '--bg-tertiary': '#141d35',
      '--bg-elevated': '#1a2444', '--bg-hover': '#1f2b4d',
      '--border': 'rgba(255,255,255,0.07)', '--border-bright': 'rgba(255,255,255,0.12)',
      '--text-primary': '#e8eaf0', '--text-secondary': '#8892a4', '--text-muted': '#4d5a6e',
    };
    Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
  }, [theme]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === '?') openShortcuts();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openShortcuts]);

  if (!hydrated) return (
    <div style={{ background: '#0a0e1a', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '2px solid #00d4ff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!isAuthenticated) return null;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TickerStrip />
        <Topbar />
        <main style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {children}
        </main>
      </div>
      <CommandPalette />
      <ShortcutsPanel />
      <ToastContainer />
      {isFirstLogin && <OnboardingTour />}
    </div>
  );
}