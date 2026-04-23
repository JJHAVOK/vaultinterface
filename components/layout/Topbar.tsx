'use client';
import { useState } from 'react';
import { Search, Bell, Sun, Moon, Command, X } from 'lucide-react';
import { useUIStore, useNotificationStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';
import { MARKET_INDICES } from '@/lib/mock-data';

export default function Topbar() {
  const { theme, setTheme, openCommandPalette } = useUIStore();
  const { notifications, unreadCount, markAllRead, markRead } = useNotificationStore();
  const [notifOpen, setNotifOpen] = useState(false);

  const indices = MARKET_INDICES.slice(0, 4);

  return (
    <>
      <header style={{
        height: 'var(--topbar-height)',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 16px',
        position: 'sticky',
        top: 0,
        zIndex: 20,
        flexShrink: 0,
      }}>
        {/* Market indices strip */}
        <div style={{ display: 'flex', gap: 16, flex: 1, overflow: 'hidden' }}>
          {indices.map(idx => (
            <div key={idx.ticker} style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{idx.ticker}</span>
              <span style={{ fontSize: 12, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{idx.value.toLocaleString()}</span>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: idx.changePct >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
                {idx.changePct >= 0 ? '+' : ''}{idx.changePct.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Search trigger */}
          <button
            onClick={openCommandPalette}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '5px 10px', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)',
              transition: 'all 200ms',
            }}
            onMouseEnter={e => { (e.target as HTMLElement).closest('button')!.style.borderColor = 'var(--border-bright)'; }}
            onMouseLeave={e => { (e.target as HTMLElement).closest('button')!.style.borderColor = 'var(--border)'; }}
          >
            <Search size={12} />
            <span>Search...</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 8 }}>
              <kbd style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 3, padding: '1px 4px', fontSize: 10 }}>⌘</kbd>
              <kbd style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 3, padding: '1px 4px', fontSize: 10 }}>K</kbd>
            </div>
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 6, padding: 7, cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', transition: 'all 200ms' }}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Notifications */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 6, padding: 7, cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', position: 'relative', transition: 'all 200ms' }}
            >
              <Bell size={14} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: 4,
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--accent-cyan)',
                  border: '1px solid var(--bg-secondary)',
                }} />
              )}
            </button>

            {notifOpen && (
              <>
                <div className="overlay-backdrop" style={{ zIndex: 25 }} onClick={() => setNotifOpen(false)} />
                <div style={{
                  position: 'absolute', right: 0, top: 40,
                  width: 320, background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-bright)',
                  borderRadius: 10, zIndex: 30, overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14 }}>Notifications</span>
                    <button onClick={markAllRead} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>Mark all read</button>
                  </div>
                  <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid var(--border)',
                          cursor: 'pointer',
                          background: n.read ? 'transparent' : 'rgba(0,212,255,0.03)',
                          transition: 'background 200ms',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = n.read ? 'transparent' : 'rgba(0,212,255,0.03)'; }}
                      >
                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                          {!n.read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-cyan)', marginTop: 4, flexShrink: 0 }} />}
                          <div style={{ flex: 1, marginLeft: n.read ? 14 : 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{n.title}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>{n.body}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{formatDate(n.createdAt, 'time')}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
