'use client';
import { useState } from 'react';
import { useAuthStore, useUIStore } from '@/lib/store';
import { toast } from '@/components/ui/Toast';
import { User, Shield, CreditCard, Bell, Sun, Moon, Key, Upload, X, Check, Download } from 'lucide-react';
import { PORTFOLIO_KPI, HOLDINGS } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';

// ─── CHANGE PASSWORD MODAL ────────────────────────────────────────────────────
function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });

  const handleSave = () => {
    if (!form.current) { toast.error('Required', 'Enter your current password'); return; }
    if (form.next.length < 8) { toast.error('Too short', 'Password must be at least 8 characters'); return; }
    if (form.next !== form.confirm) { toast.error('Mismatch', 'Passwords do not match'); return; }
    toast.success('Password updated', 'Your password has been changed successfully');
    onClose();
  };

  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)', borderRadius: 14, zIndex: 60, boxShadow: '0 24px 80px rgba(0,0,0,0.5)', animation: 'fadeIn 0.2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>Change Password</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={16} /></button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Current Password', key: 'current' },
            { label: 'New Password', key: 'next' },
            { label: 'Confirm New Password', key: 'confirm' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{f.label}</label>
              <input type="password" value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="vault-input" />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button onClick={handleSave} className="btn btn-primary" style={{ flex: 1 }}>Update Password</button>
            <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── 2FA MODAL ────────────────────────────────────────────────────────────────
function TwoFAModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'qr' | 'verify'>('qr');
  const [code, setCode] = useState('');

  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 420, background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)', borderRadius: 14, zIndex: 60, boxShadow: '0 24px 80px rgba(0,0,0,0.5)', animation: 'fadeIn 0.2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>Enable Two-Factor Auth</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={16} /></button>
        </div>
        <div style={{ padding: 20 }}>
          {step === 'qr' ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                {/* Mock QR code SVG */}
                <svg width={160} height={160} viewBox="0 0 160 160" style={{ margin: '0 auto', display: 'block', background: 'white', borderRadius: 8, padding: 8 }}>
                  {Array.from({ length: 10 }, (_, row) => Array.from({ length: 10 }, (_, col) => (
                    Math.random() > 0.5 && <rect key={`${row}-${col}`} x={col * 14 + 4} y={row * 14 + 4} width={12} height={12} fill="#000" rx={1} />
                  )))}
                  <rect x={4} y={4} width={40} height={40} fill="none" stroke="#000" strokeWidth={4} />
                  <rect x={116} y={4} width={40} height={40} fill="none" stroke="#000" strokeWidth={4} />
                  <rect x={4} y={116} width={40} height={40} fill="none" stroke="#000" strokeWidth={4} />
                </svg>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>Scan with Google Authenticator or Authy</div>
                <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginTop: 6, background: 'var(--bg-tertiary)', padding: '6px 10px', borderRadius: 6 }}>
                  VAULT-DEMO-2FA-SECRET-KEY-XK7N
                </div>
              </div>
              <button onClick={() => setStep('verify')} className="btn btn-primary" style={{ width: '100%' }}>I've scanned the QR code →</button>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Enter the 6-digit code from your authenticator app</div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  {Array.from({ length: 6 }, (_, i) => (
                    <input key={i} id={`tfa-${i}`} type="text" inputMode="numeric" maxLength={1}
                      value={code[i] || ''} onChange={e => {
                        const newCode = code.split('');
                        newCode[i] = e.target.value;
                        setCode(newCode.join(''));
                        if (e.target.value && i < 5) document.getElementById(`tfa-${i + 1}`)?.focus();
                      }}
                      style={{ width: 44, height: 52, textAlign: 'center', fontSize: 20, background: 'var(--bg-tertiary)', border: `1px solid ${code[i] ? 'var(--accent-cyan)' : 'var(--border)'}`, borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', outline: 'none' }} />
                  ))}
                </div>
              </div>
              <button onClick={() => { toast.success('2FA enabled', 'Two-factor authentication is now active'); onClose(); }} className="btn btn-primary" style={{ width: '100%' }} disabled={code.length < 6}>
                Verify & Enable 2FA
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ─── API KEY MODAL ────────────────────────────────────────────────────────────
function ApiKeyModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<Set<string>>(new Set(['read:portfolio']));
  const [generated, setGenerated] = useState<string | null>(null);

  const toggle = (p: string) => setPermissions(prev => { const n = new Set(prev); n.has(p) ? n.delete(p) : n.add(p); return n; });

  const generate = () => {
    if (!name) { toast.error('Required', 'Enter a name for this key'); return; }
    const key = `pk_live_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
    setGenerated(key);
  };

  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 440, background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)', borderRadius: 14, zIndex: 60, boxShadow: '0 24px 80px rgba(0,0,0,0.5)', animation: 'fadeIn 0.2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>Generate API Key</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={16} /></button>
        </div>
        <div style={{ padding: 20 }}>
          {!generated ? (
            <>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Key Name</label>
                <input value={name} onChange={e => setName(e.target.value)} className="vault-input" placeholder="My App" />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Permissions</label>
                {['read:portfolio', 'read:transactions', 'write:alerts', 'read:markets'].map(p => (
                  <div key={p} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>{p}</span>
                    <input type="checkbox" checked={permissions.has(p)} onChange={() => toggle(p)} style={{ accentColor: 'var(--accent-cyan)', width: 16, height: 16, cursor: 'pointer' }} />
                  </div>
                ))}
              </div>
              <button onClick={generate} className="btn btn-primary" style={{ width: '100%' }}>Generate Key</button>
            </>
          ) : (
            <>
              <div style={{ padding: 16, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: 'var(--positive)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Check size={12} /> Key generated successfully
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-primary)', wordBreak: 'break-all' }}>{generated}</div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--warning)', marginBottom: 16 }}>⚠️ Copy this key now. You won't be able to see it again.</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { navigator.clipboard?.writeText(generated); toast.success('Copied', 'API key copied to clipboard'); }} className="btn btn-primary" style={{ flex: 1 }}>Copy Key</button>
                <button onClick={onClose} className="btn btn-ghost">Done</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ─── PLAN COMPARISON MODAL ────────────────────────────────────────────────────
function PlanModal({ onClose }: { onClose: () => void }) {
  const PLANS = [
    { name: 'Starter', price: 0, features: ['10 holdings', '1 watchlist', 'Basic charts', 'Community support'] },
    { name: 'Pro', price: 29, features: ['Unlimited holdings', '5 watchlists', 'Advanced analytics', 'Priority support', 'AI Assistant'] },
    { name: 'Institutional', price: 99, features: ['Everything in Pro', 'Unlimited watchlists', 'API access', 'Tax optimization', 'Dedicated account manager'], current: true },
  ];

  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 680, background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)', borderRadius: 14, zIndex: 60, boxShadow: '0 24px 80px rgba(0,0,0,0.5)', animation: 'fadeIn 0.2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>Subscription Plans</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={16} /></button>
        </div>
        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {PLANS.map(plan => (
            <div key={plan.name} style={{ padding: 20, borderRadius: 12, border: `1px solid ${plan.current ? 'var(--accent-cyan)' : 'var(--border)'}`, background: plan.current ? 'var(--accent-cyan-dim)' : 'var(--bg-tertiary)', position: 'relative' }}>
              {plan.current && <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-cyan)', color: '#000', fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 99 }}>CURRENT PLAN</div>}
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{plan.name}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: plan.current ? 'var(--accent-cyan)' : 'var(--text-primary)', marginBottom: 16 }}>
                {plan.price === 0 ? 'Free' : `$${plan.price}/mo`}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <Check size={12} style={{ color: 'var(--positive)', flexShrink: 0 }} /> {f}
                  </div>
                ))}
              </div>
              <button onClick={() => { if (!plan.current) toast.info('Plan upgrade', `Redirecting to ${plan.name} checkout...`); onClose(); }} className={`btn ${plan.current ? 'btn-ghost' : 'btn-primary'}`} style={{ width: '100%', justifyContent: 'center' }}>
                {plan.current ? 'Current Plan' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
export function ProfilePage() {
  const { user } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [formName, setFormName] = useState(user.name);
  const [formEmail, setFormEmail] = useState(user.email);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [draggingAvatar, setDraggingAvatar] = useState(false);

  const handleSaveProfile = () => {
    toast.success('Profile updated', 'Your profile information has been saved');
    setEditing(false);
  };

  const handleDataExport = () => {
    const data = { user: { name: formName, email: formEmail }, portfolio: { totalValue: PORTFOLIO_KPI.totalValue, holdings: HOLDINGS.map(h => ({ ticker: h.ticker, shares: h.shares, value: h.marketValue })) }, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'vault-export.json'; a.click();
    toast.success('Data exported', 'vault-export.json downloaded');
  };

  const SESSIONS = [
    { device: 'Chrome on Windows', location: 'Atlanta, GA', time: 'Now', current: true },
    { device: 'Safari on iPhone', location: 'Atlanta, GA', time: '2 hours ago', current: false },
    { device: 'Firefox on MacOS', location: 'New York, NY', time: '3 days ago', current: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.4s ease', maxWidth: 760 }}>
      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
      {show2FA && <TwoFAModal onClose={() => setShow2FA(false)} />}
      {showPlan && <PlanModal onClose={() => setShowPlan(false)} />}

      <div className="page-title" style={{ marginBottom: 4 }}>Profile</div>

      {/* Avatar + info */}
      <div className="vault-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 24 }}>
          <div
            onDragOver={e => { e.preventDefault(); setDraggingAvatar(true); }}
            onDragLeave={() => setDraggingAvatar(false)}
            onDrop={e => { e.preventDefault(); setDraggingAvatar(false); toast.success('Avatar updated', 'Profile photo changed'); }}
            style={{ width: 72, height: 72, borderRadius: '50%', background: draggingAvatar ? 'var(--accent-cyan)' : 'linear-gradient(135deg, var(--accent-cyan), #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#000', flexShrink: 0, cursor: 'pointer', position: 'relative', transition: 'all 200ms' }}
            title="Drag & drop to change avatar">
            {user.name.split(' ').map(n => n[0]).join('')}
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', opacity: 0, transition: 'opacity 200ms' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
              <Upload size={16} color="#fff" />
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20 }}>{user.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>{user.email}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span className="badge badge-cyan">Pro Institutional</span>
              <button onClick={() => setShowPlan(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>Change plan →</button>
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button onClick={handleDataExport} className="btn btn-ghost" style={{ fontSize: 11 }}><Download size={11} /> Export Data</button>
            <button onClick={() => { if (editing) handleSaveProfile(); else setEditing(true); }} className={`btn ${editing ? 'btn-primary' : 'btn-ghost'}`}>
              {editing ? 'Save Changes' : 'Edit Profile'}
            </button>
            {editing && <button onClick={() => setEditing(false)} className="btn btn-ghost">Cancel</button>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'Full Name', key: 'name', value: formName, setter: setFormName },
            { label: 'Email', key: 'email', value: formEmail, setter: setFormEmail },
            { label: 'Phone', key: 'phone', value: '+1 (404) 555-0192', setter: () => {} },
            { label: 'Timezone', key: 'tz', value: 'America/New_York (EST)', setter: () => {} },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{f.label}</label>
              {editing ? <input value={f.value} onChange={e => f.setter(e.target.value)} className="vault-input" /> : <div style={{ fontSize: 13, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>{f.value}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Billing */}
      <div className="vault-card" style={{ padding: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CreditCard size={16} style={{ color: 'var(--accent-cyan)' }} /> Billing
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: 10, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Pro Institutional</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>$99/month · Next billing May 23, 2026</div>
          </div>
          <button onClick={() => setShowPlan(true)} className="btn btn-ghost" style={{ fontSize: 11 }}>Change Plan</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: 'var(--bg-tertiary)', borderRadius: 10 }}>
          <div style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 20, background: '#1a1f71', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', fontWeight: 700 }}>VISA</div>
            •••• •••• •••• 4242
          </div>
          <button onClick={() => toast.info('Payment method', 'Redirecting to billing portal...')} className="btn btn-ghost" style={{ fontSize: 11 }}>Update</button>
        </div>
      </div>

      {/* Security */}
      <div className="vault-card" style={{ padding: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={16} style={{ color: 'var(--accent-cyan)' }} /> Security
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Two-Factor Authentication</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Add an extra layer of security to your account</div>
            </div>
            <button onClick={() => setShow2FA(true)} className="btn btn-ghost" style={{ fontSize: 11 }}>Enable 2FA</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Password</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Last changed 30 days ago</div>
            </div>
            <button onClick={() => setShowPasswordModal(true)} className="btn btn-ghost" style={{ fontSize: 11 }}>Change Password</button>
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
              {s.current
                ? <span className="badge badge-positive">Current</span>
                : <button onClick={() => toast.warning('Session revoked', `${s.device} (${s.location}) has been signed out`)} className="btn btn-danger" style={{ fontSize: 11, padding: '3px 8px' }}>Revoke</button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────
export function SettingsPage() {
  const { theme, setTheme } = useUIStore();
  const [notifications, setNotifications] = useState({ price: true, milestone: true, marketOpen: false, digest: true });
  const [currency, setCurrency] = useState('USD');
  const [showApiModal, setShowApiModal] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<Record<string, boolean>>({ Fidelity: false, Schwab: false, Robinhood: true });

  const BROKERS = ['Fidelity', 'Schwab', 'Robinhood', 'TD Ameritrade', 'E*TRADE'];

  const toggleNotif = (key: keyof typeof notifications) => {
    setNotifications(prev => {
      const next = { ...prev, [key]: !prev[key] };
      toast.info('Notification updated', `${key.charAt(0).toUpperCase() + key.slice(1)} alerts ${next[key] ? 'enabled' : 'disabled'}`);
      return next;
    });
  };

  const toggleBroker = (broker: string) => {
    const connected = connectedAccounts[broker];
    setConnectedAccounts(prev => ({ ...prev, [broker]: !connected }));
    if (connected) toast.warning(`${broker} disconnected`, 'Account unlinked from Vault');
    else toast.success(`${broker} connected`, 'Account successfully linked');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.4s ease', maxWidth: 760 }}>
      {showApiModal && <ApiKeyModal onClose={() => setShowApiModal(false)} />}

      <div className="page-title" style={{ marginBottom: 4 }}>Settings</div>

      {/* Appearance */}
      <div className="vault-card" style={{ padding: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Appearance</div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Theme</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {(['dark', 'light'] as const).map(t => (
              <button key={t} onClick={() => { setTheme(t); toast.info('Theme changed', `${t.charAt(0).toUpperCase() + t.slice(1)} mode activated`); }}
                style={{ flex: 1, padding: 14, borderRadius: 8, border: `1px solid ${theme === t ? 'var(--accent-cyan)' : 'var(--border)'}`, background: theme === t ? 'var(--accent-cyan-dim)' : 'var(--bg-tertiary)', cursor: 'pointer', color: theme === t ? 'var(--accent-cyan)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, fontFamily: 'var(--font-mono)' }}>
                {t === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                {t.charAt(0).toUpperCase() + t.slice(1)} Mode
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Currency</label>
            <select value={currency} onChange={e => { setCurrency(e.target.value); toast.info('Currency updated', `Display currency set to ${e.target.value}`); }} className="vault-input">
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — British Pound</option>
              <option value="CAD">CAD — Canadian Dollar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="vault-card" style={{ padding: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={15} /> Notifications
        </div>
        {[
          { key: 'price' as const, label: 'Price alerts', desc: 'When a price target is hit' },
          { key: 'milestone' as const, label: 'Portfolio milestones', desc: 'When you reach a new all-time high' },
          { key: 'marketOpen' as const, label: 'Market open/close', desc: 'Daily market open and close reminders' },
          { key: 'digest' as const, label: 'Weekly digest', desc: 'Weekly portfolio performance summary' },
        ].map(n => (
          <div key={n.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: 13 }}>{n.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{n.desc}</div>
            </div>
            <button onClick={() => toggleNotif(n.key)} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: notifications[n.key] ? 'var(--accent-cyan)' : 'var(--bg-elevated)', position: 'relative', transition: 'background 200ms' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: notifications[n.key] ? 23 : 3, transition: 'left 200ms', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
            </button>
          </div>
        ))}
      </div>

      {/* Connected Accounts */}
      <div className="vault-card" style={{ padding: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Connected Accounts</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {BROKERS.map(broker => {
            const connected = connectedAccounts[broker] ?? false;
            return (
              <div key={broker} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--bg-tertiary)', borderRadius: 8, border: `1px solid ${connected ? 'rgba(16,185,129,0.2)' : 'var(--border)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: connected ? 'var(--positive-dim)' : 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: connected ? 'var(--positive)' : 'var(--text-muted)' }}>
                    {broker.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{broker}</div>
                    <div style={{ fontSize: 11, color: connected ? 'var(--positive)' : 'var(--text-muted)' }}>{connected ? 'Connected · syncing' : 'Not connected'}</div>
                  </div>
                </div>
                <button onClick={() => toggleBroker(broker)} className={`btn ${connected ? 'btn-danger' : 'btn-ghost'}`} style={{ fontSize: 11, padding: '4px 12px' }}>
                  {connected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* API Keys */}
      <div className="vault-card" style={{ padding: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Key size={15} /> API Keys
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
          {[{ name: 'Mobile App Key', key: 'pk_live_•••••••••••xK4n', created: 'Jan 15, 2026' }].map(k => (
            <div key={k.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--bg-tertiary)', borderRadius: 8 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{k.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{k.key}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Created {k.created}</span>
                <button onClick={() => toast.warning('Key revoked', `${k.name} has been deactivated`)} className="btn btn-danger" style={{ fontSize: 11, padding: '3px 8px' }}>Revoke</button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => setShowApiModal(true)} className="btn btn-ghost"><Key size={12} /> Generate New Key</button>
      </div>
    </div>
  );
}