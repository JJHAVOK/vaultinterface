'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, useUIStore } from '@/lib/store';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import CommandPalette from '@/components/layout/CommandPalette';
import ToastContainer from '@/components/ui/Toast';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { openShortcuts, theme } = useUIStore();
  const [hydrated, setHydrated] = useState(false);

  // Wait for Zustand to rehydrate from localStorage before checking auth
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace('/login');
    }
  }, [hydrated, isAuthenticated, router]);

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      document.documentElement.style.setProperty('--bg-primary', '#f0f2f7');
      document.documentElement.style.setProperty('--bg-secondary', '#ffffff');
      document.documentElement.style.setProperty('--bg-tertiary', '#f5f7fa');
      document.documentElement.style.setProperty('--bg-elevated', '#e8ecf3');
      document.documentElement.style.setProperty('--bg-hover', '#dde3ef');
      document.documentElement.style.setProperty('--border', 'rgba(0,0,0,0.08)');
      document.documentElement.style.setProperty('--border-bright', 'rgba(0,0,0,0.15)');
      document.documentElement.style.setProperty('--text-primary', '#0f1629');
      document.documentElement.style.setProperty('--text-secondary', '#4a5568');
      document.documentElement.style.setProperty('--text-muted', '#9ca3af');
    } else {
      document.documentElement.style.setProperty('--bg-primary', '#0a0e1a');
      document.documentElement.style.setProperty('--bg-secondary', '#0f1629');
      document.documentElement.style.setProperty('--bg-tertiary', '#141d35');
      document.documentElement.style.setProperty('--bg-elevated', '#1a2444');
      document.documentElement.style.setProperty('--bg-hover', '#1f2b4d');
      document.documentElement.style.setProperty('--border', 'rgba(255,255,255,0.07)');
      document.documentElement.style.setProperty('--border-bright', 'rgba(255,255,255,0.12)');
      document.documentElement.style.setProperty('--text-primary', '#e8eaf0');
      document.documentElement.style.setProperty('--text-secondary', '#8892a4');
      document.documentElement.style.setProperty('--text-muted', '#4d5a6e');
    }
  }, [theme]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === '?') openShortcuts();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openShortcuts]);

  // Show nothing until hydrated (prevents flash to login)
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
        <Topbar />
        <main style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {children}
        </main>
      </div>
      <CommandPalette />
      <ToastContainer />
    </div>
  );
}
