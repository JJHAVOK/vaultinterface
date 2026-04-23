'use client';
import { useEffect } from 'react';
import { useUIStore } from '@/lib/store';
import { X } from 'lucide-react';

const SHORTCUTS = [
  { section: 'Navigation', items: [
    { keys: ['G', 'D'], desc: 'Go to Dashboard' },
    { keys: ['G', 'P'], desc: 'Go to Portfolio' },
    { keys: ['G', 'A'], desc: 'Go to Analytics' },
    { keys: ['G', 'T'], desc: 'Go to Transactions' },
    { keys: ['G', 'M'], desc: 'Go to Markets' },
  ]},
  { section: 'Global', items: [
    { keys: ['⌘', 'K'], desc: 'Open command palette' },
    { keys: ['?'], desc: 'Show keyboard shortcuts' },
    { keys: ['Esc'], desc: 'Close modal / palette' },
  ]},
  { section: 'Portfolio', items: [
    { keys: ['N'], desc: 'Add new position' },
    { keys: ['E'], desc: 'Export CSV' },
    { keys: ['R'], desc: 'Refresh prices' },
  ]},
  { section: 'Tables', items: [
    { keys: ['↑', '↓'], desc: 'Navigate rows' },
    { keys: ['Enter'], desc: 'Open row detail' },
    { keys: ['Space'], desc: 'Select row' },
  ]},
];

export default function ShortcutsPanel() {
  const { shortcutsOpen, closeShortcuts } = useUIStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeShortcuts();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeShortcuts]);

  if (!shortcutsOpen) return null;

  return (
    <>
      <div className="overlay-backdrop" style={{ zIndex: 50 }} onClick={closeShortcuts} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 560, maxHeight: '80vh', overflowY: 'auto',
        background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)',
        borderRadius: 14, zIndex: 51, boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        animation: 'fadeIn 0.2s ease',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>Keyboard Shortcuts</div>
          <button onClick={closeShortcuts} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          {SHORTCUTS.map(section => (
            <div key={section.section} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>{section.section}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {section.items.map(item => (
                  <div key={item.desc} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.desc}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {item.keys.map(k => (
                        <kbd key={k} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)', borderRadius: 4, padding: '2px 6px', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{k}</kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '12px 20px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
          Press <kbd style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 3, padding: '1px 5px', fontSize: 11 }}>?</kbd> anywhere to toggle this panel
        </div>
      </div>
    </>
  );
}
