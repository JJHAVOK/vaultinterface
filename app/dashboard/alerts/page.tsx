'use client';
import { useState } from 'react';
import { useAlertsStore } from '@/lib/store';
import { Bell, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

export default function AlertsPage() {
  const { alerts, addAlert, removeAlert, toggleAlert } = useAlertsStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ticker: '', condition: 'above', value: '', method: 'push' });

  const handleAdd = () => {
    if (!form.ticker || !form.value) return;
    addAlert({ id: `a${Date.now()}`, ticker: form.ticker.toUpperCase(), condition: form.condition as any, value: Number(form.value), method: form.method as any, active: true, createdAt: new Date().toISOString() });
    setForm({ ticker: '', condition: 'above', value: '', method: 'push' });
    setShowForm(false);
  };

  const CONDITION_LABELS: Record<string, string> = { above: 'Price above', below: 'Price below', change_up: '% up', change_down: '% down' };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div className="page-header">
        <div className="page-title">Price Alerts</div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={12} /> New Alert</button>
      </div>

      {showForm && (
        <div className="vault-card" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Create Alert</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Ticker</label>
              <input value={form.ticker} onChange={e => setForm(f => ({ ...f, ticker: e.target.value }))} className="vault-input" placeholder="AAPL" style={{ width: 100 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Condition</label>
              <select value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} className="vault-input" style={{ width: 140 }}>
                <option value="above">Price above</option>
                <option value="below">Price below</option>
                <option value="change_up">% change up</option>
                <option value="change_down">% change down</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Value</label>
              <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} className="vault-input" placeholder="150.00" style={{ width: 100 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Notify via</label>
              <select value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))} className="vault-input" style={{ width: 120 }}>
                <option value="push">Push</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </select>
            </div>
            <button onClick={handleAdd} className="btn btn-primary">Create Alert</button>
            <button onClick={() => setShowForm(false)} className="btn btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {alerts.length === 0 && (
          <div className="vault-card" style={{ padding: 40, textAlign: 'center' }}>
            <Bell size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
            <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>No alerts set</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Create alerts to get notified when prices hit your targets</div>
          </div>
        )}
        {alerts.map(a => (
          <div key={a.id} className="vault-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: a.triggered ? 'var(--positive-dim)' : 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bell size={16} style={{ color: a.triggered ? 'var(--positive)' : 'var(--text-secondary)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
                <span style={{ color: 'var(--accent-cyan)' }}>{a.ticker}</span>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}> — {CONDITION_LABELS[a.condition]} </span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{a.condition.includes('change') ? `${a.value}%` : `$${a.value}`}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Notify via {a.method} · {a.triggered ? '✅ Triggered' : a.active ? '🟢 Active' : '⏸ Paused'}
              </div>
            </div>
            <button onClick={() => toggleAlert(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: a.active ? 'var(--accent-cyan)' : 'var(--text-muted)', display: 'flex' }}>
              {a.active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
            </button>
            <button onClick={() => removeAlert(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--negative)', display: 'flex', padding: 4 }}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}