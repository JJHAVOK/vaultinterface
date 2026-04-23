'use client';
import { useState } from 'react';
import { useAuthStore, useUIStore } from '@/lib/store';
import { User, Shield, CreditCard, Bell, Sun, Moon, Key, LogOut } from 'lucide-react';

export function ProfilePage() {
  const { user } = useAuthStore();
  const [editing, setEditing] = useState(false);

  const SESSIONS = [
    { device: 'Chrome on Windows', location: 'Atlanta, GA', time: 'Now', current: true },
    { device: 'Safari on iPhone', location: 'Atlanta, GA', time: '2 hours ago', current: false },
    { device: 'Firefox on MacOS', location: 'New York, NY', time: '3 days ago', current: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.4s ease', maxWidth: 760 }}>
      <div className="page-title" style={{ marginBottom: 4 }}>Profile</div>

      {/* Avatar + info */}
      <div className="vault-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 24 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-cyan), #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#000', flexShrink: 0 }}>
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20 }}>{user.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>{user.email}</div>
            <span className="badge badge-cyan">Pro Institutional</span>
          </div>
          <button className="btn btn-ghost" style={{ marginLeft: 'auto' }} onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'Full Name', value: user.name },
            { label: 'Email', value: user.email },
            { label: 'Phone', value: '+1 (404) 555-0192' },
            { label: 'Timezone', value: 'America/New_York (EST)' },
          ].map(f => (
            <div key={f.label}>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{f.label}</label>
              {editing ? <input defaultValue={f.value} className="vault-input" /> : <div style={{ fontSize: 13, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>{f.value}</div>}
            </div>
          ))}
        </div>
        {editing && <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setEditing(false)}>Save Changes</button>}
      </div>

      {/* Security */}
      <div className="vault-card" style={{ padding: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={16} style={{ color: 'var(--accent-cyan)' }} /> Security
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Two-Factor Authentication</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Add an extra layer of security</div>
            </div>
            <span className="badge badge-neutral">Disabled</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Password</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Last changed 30 days ago</div>
            </div>
            <button className="btn btn-ghost" style={{ fontSize: 11 }}>Change</button>
          </div>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Active Sessions</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {SESSIONS.map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-tertiary)', borderRadius: 6 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{s.device}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s.location} · {s.time}</div>
              </div>
              {s.current ? <span className="badge badge-positive">Current</span> : <button className="btn btn-danger" style={{ fontSize: 11, padding: '3px 8px' }}>Revoke</button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { theme, setTheme } = useUIStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.4s ease', maxWidth: 760 }}>
      <div className="page-title" style={{ marginBottom: 4 }}>Settings</div>

      <div className="vault-card" style={{ padding: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Appearance</div>
        <div style={{ display: 'flex', gap: 10 }}>
          {(['dark', 'light'] as const).map(t => (
            <button key={t} onClick={() => setTheme(t)}
              style={{ flex: 1, padding: 14, borderRadius: 8, border: `1px solid ${theme === t ? 'var(--accent-cyan)' : 'var(--border)'}`, background: theme === t ? 'var(--accent-cyan-dim)' : 'var(--bg-tertiary)', cursor: 'pointer', color: theme === t ? 'var(--accent-cyan)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, fontFamily: 'var(--font-mono)' }}>
              {t === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
              {t.charAt(0).toUpperCase() + t.slice(1)} Mode
            </button>
          ))}
        </div>
      </div>

      <div className="vault-card" style={{ padding: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={15} /> Notifications
        </div>
        {[
          { label: 'Price alerts', desc: 'When a price target is hit' },
          { label: 'Portfolio milestones', desc: 'When you reach a new high' },
          { label: 'Market open/close', desc: 'Daily market summary' },
          { label: 'Weekly digest', desc: 'Portfolio performance summary' },
        ].map(n => (
          <div key={n.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: 13 }}>{n.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{n.desc}</div>
            </div>
            <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent-cyan)', width: 16, height: 16, cursor: 'pointer' }} />
          </div>
        ))}
      </div>

      <div className="vault-card" style={{ padding: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Key size={15} /> API Keys
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[{ name: 'Mobile App Key', key: 'pk_live_•••••••••••••xK4n', created: 'Jan 15, 2026' }].map(k => (
            <div key={k.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--bg-tertiary)', borderRadius: 8 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{k.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{k.key}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Created {k.created}</span>
                <button className="btn btn-danger" style={{ fontSize: 11, padding: '3px 8px' }}>Revoke</button>
              </div>
            </div>
          ))}
          <button className="btn btn-ghost" style={{ alignSelf: 'flex-start' }}><Key size={12} /> Generate New Key</button>
        </div>
      </div>
    </div>
  );
}
