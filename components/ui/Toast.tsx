'use client';
import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

let toastHandler: ((toast: Omit<Toast, 'id'>) => void) | null = null;

export function toast(t: Omit<Toast, 'id'>) {
  if (toastHandler) toastHandler(t);
}
toast.success = (title: string, message?: string) => toast({ type: 'success', title, message });
toast.error = (title: string, message?: string) => toast({ type: 'error', title, message });
toast.warning = (title: string, message?: string) => toast({ type: 'warning', title, message });
toast.info = (title: string, message?: string) => toast({ type: 'info', title, message });

const ICONS = { success: CheckCircle, error: XCircle, warning: AlertCircle, info: Info };
const COLORS = {
  success: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', icon: 'var(--positive)' },
  error: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', icon: 'var(--negative)' },
  warning: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', icon: 'var(--warning)' },
  info: { bg: 'rgba(0,212,255,0.12)', border: 'rgba(0,212,255,0.3)', icon: 'var(--accent-cyan)' },
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...t, id }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 4000);
  }, []);

  useEffect(() => { toastHandler = addToast; return () => { toastHandler = null; }; }, [addToast]);

  const remove = (id: string) => setToasts(prev => prev.filter(x => x.id !== id));

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360 }}>
      {toasts.map(t => {
        const Icon = ICONS[t.type];
        const c = COLORS[t.type];
        return (
          <div key={t.id} style={{ background: 'var(--bg-secondary)', border: `1px solid ${c.border}`, borderLeft: `3px solid ${c.icon}`, borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', animation: 'slideInRight 0.25s ease' }}>
            <Icon size={16} style={{ color: c.icon, flexShrink: 0, marginTop: 1 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: t.message ? 2 : 0 }}>{t.title}</div>
              {t.message && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t.message}</div>}
            </div>
            <button onClick={() => remove(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 2, flexShrink: 0 }}>
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
