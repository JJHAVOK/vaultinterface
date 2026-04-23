'use client';
import { useState } from 'react';
import { useAlertsStore } from '@/lib/store';
import { Bell, Plus, Trash2, ToggleLeft, ToggleRight, Clock, X } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

const ALERT_HISTORY = [
  { id: 'h1', ticker: 'NVDA', condition: 'above', value: 850, triggeredAt: '2026-04-22 14:32', method: 'push' },
  { id: 'h2', ticker: 'AAPL', condition: 'below', value: 180, triggeredAt: '2026-04-20 09:45', method: 'email' },
  { id: 'h3', ticker: 'TSLA', condition: 'change_down', value: 5, triggeredAt: '2026-04-18 11:12', method: 'push' },
  { id: 'h4', ticker: 'SPY', condition: 'above', value: 520, triggeredAt: '2026-04-15 15:58', method: 'push' },
];

const CONDITION_LABELS: Record<string, string> = {
  above: 'Price above', below: 'Price below', change_up: '% up by', change_down: '% down by'
};

const TABS = ['Active Alerts', 'History'];

export default function AlertsPage() {
  const { alerts, addAlert, removeAlert, toggleAlert } = useAlertsStore();
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState('Active Alerts');
  const [form, setForm] = useState({ ticker: '', condition: 'above', value: '', method: 'push' });

  const handleAdd = () => {
    if (!form.ticker || !form.value) { toast.error('Missing fields', 'Ticker and value are required'); return; }
    addAlert({
      id: `a${Date.now()}`,
      ticker: form.ticker.toUpperCase(),
      condition: form.condition as any,
      value: Number(form.value),
      method: form.method as any,
      active: true,
      createdAt: new Date().toISOString(),
    });
    setForm({ ticker: '', condition: 'above', value: '', method: 'push' });
    setShowForm(false);
    toast.success('Alert created', `${form.ticker.toUpperCase()} alert is now active`);
  };

  const handleToggle = (id: string, ticker: string, active: boolean) => {
    toggleAlert(id);
    toast.info('Alert updated', `${ticker} alert ${active ? 'paused' : 'resumed'}`);
  };

  const handleRemove = (id: string, ticker: string) => {
    removeAlert(id);
    toast.warning('Alert deleted', `${ticker} alert removed`);
  };

  const enableAll = () => {
    alerts.forEach(a => { if (!a.active) toggleAlert(a.id); });
    toast.success('All enabled', `${alerts.length} alerts activated`);
  };

  const disableAll = () => {
    alerts.forEach(a => { if (a.active) toggleAlert(a.id); });
    toast.info('All paused', `${alerts.length} alerts paused`);
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div className="page-header">
        <div className="page-title">Price Alerts</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {alerts.length > 0 && (
            <>
              <button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={enableAll}>Enable All</button>
              <button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={disableAll}>Pause All</button>
            </>
          )}
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={12} /> New Alert
          </button>
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="vault-card" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14 }}>Create Alert</div>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={14} /></button>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Ticker</label>
              <input value={form.ticker} onChange={e => setForm(f => ({ ...f, ticker: e.target.value }))} className="vault-input" placeholder="AAPL" style={{ width: 90 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Condition</label>
              <select value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} className="vault-input" style={{ width: 150 }}>
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
              <select value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))} className="vault-input" style={{ width: 110 }}>
                <option value="push">Push</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </select>
            </div>
            <button onClick={handleAdd} className="btn btn-primary">Create Alert</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom: 16 }}>
        {TABS.map(t => (
          <div key={t} className={`tab-item ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t}
            {t === 'Active Alerts' && alerts.length > 0 && (
              <span style={{ marginLeft: 6, background: 'var(--accent-cyan)', color: '#000', borderRadius: 99, padding: '0 6px', fontSize: 10, fontWeight: 700 }}>{alerts.length}</span>
            )}
            {t === 'History' && (
              <span style={{ marginLeft: 6, background: 'var(--bg-elevated)', color: 'var(--text-muted)', borderRadius: 99, padding: '0 6px', fontSize: 10 }}>{ALERT_HISTORY.length}</span>
            )}
          </div>
        ))}
      </div>

      {tab === 'Active Alerts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {alerts.length === 0 && (
            <div className="vault-card" style={{ padding: 48, textAlign: 'center' }}>
              <Bell size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 14px' }} />
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>No active alerts</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Create price alerts to get notified when tickers hit your targets</div>
              <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={12} /> Create First Alert</button>
            </div>
          )}
          {alerts.map(a => (
            <div key={a.id} className="vault-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, opacity: a.active ? 1 : 0.6 }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: a.active ? 'var(--accent-cyan-dim)' : 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bell size={16} style={{ color: a.active ? 'var(--accent-cyan)' : 'var(--text-muted)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
                  <span style={{ color: 'var(--accent-cyan)' }}>{a.ticker}</span>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}> — {CONDITION_LABELS[a.condition]} </span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{a.condition.includes('change') ? `${a.value}%` : `$${a.value}`}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Notify via {a.method}
                  <span style={{ marginLeft: 8 }}>{a.active ? '🟢 Active' : '⏸ Paused'}</span>
                </div>
              </div>
              <button onClick={() => handleToggle(a.id, a.ticker, a.active)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: a.active ? 'var(--accent-cyan)' : 'var(--text-muted)', display: 'flex', padding: 4 }}>
                {a.active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
              </button>
              <button onClick={() => handleRemove(a.id, a.ticker)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--negative)', display: 'flex', padding: 4 }}>
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'History' && (
        <div className="vault-card" style={{ overflow: 'hidden' }}>
          <table className="vault-table">
            <thead>
              <tr><th>Ticker</th><th>Condition</th><th>Value</th><th>Method</th><th>Triggered</th></tr>
            </thead>
            <tbody>
              {ALERT_HISTORY.map(h => (
                <tr key={h.id} style={{ cursor: 'pointer' }}
                  onClick={() => toast.info(`${h.ticker} Alert Triggered`, `${CONDITION_LABELS[h.condition]} ${h.condition.includes('change') ? `${h.value}%` : `$${h.value}`} · ${h.triggeredAt}`)}>
                  <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{h.ticker}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{CONDITION_LABELS[h.condition]}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{h.condition.includes('change') ? `${h.value}%` : `$${h.value}`}</td>
                  <td><span className="badge badge-neutral">{h.method}</span></td>
                  <td style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 12 }}>
                    <Clock size={11} />{h.triggeredAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}