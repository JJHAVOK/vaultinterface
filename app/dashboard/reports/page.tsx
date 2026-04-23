'use client';
import { useState } from 'react';
import { FileText, Download, Calendar, X, Clock, Check } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { formatCurrency } from '@/lib/utils';
import { PORTFOLIO_KPI, HOLDINGS } from '@/lib/mock-data';

const REPORTS = [
  { id: 'r1', name: 'Monthly Statement', desc: 'Full portfolio activity for April 2026', period: 'Apr 2026', size: '2.4 MB', pages: 12 },
  { id: 'r2', name: 'Annual Performance', desc: 'YTD performance and returns breakdown', period: '2026 YTD', size: '4.1 MB', pages: 24 },
  { id: 'r3', name: 'Tax Summary', desc: 'Capital gains, dividends, and tax lots', period: '2025 Full Year', size: '3.8 MB', pages: 18 },
  { id: 'r4', name: 'Dividend Report', desc: 'All dividend income and projections', period: 'Q1 2026', size: '1.2 MB', pages: 6 },
  { id: 'r5', name: 'Risk Analysis', desc: 'Portfolio risk metrics and exposure report', period: 'Current', size: '2.9 MB', pages: 15 },
  { id: 'r6', name: 'Holdings Summary', desc: 'Snapshot of all positions and weights', period: 'Current', size: '0.8 MB', pages: 4 },
];

const TAX_DOCS = [
  { name: '1099-DIV', desc: 'Dividend and distribution income', year: '2025', status: 'ready' },
  { name: '1099-B', desc: 'Proceeds from broker transactions', year: '2025', status: 'ready' },
  { name: '1099-INT', desc: 'Interest income', year: '2025', status: 'ready' },
  { name: 'Schedule D', desc: 'Capital gains and losses', year: '2025', status: 'processing' },
];

function PreviewModal({ report, onClose }: { report: typeof REPORTS[0]; onClose: () => void }) {
  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, maxHeight: '80vh', background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)', borderRadius: 14, zIndex: 60, boxShadow: '0 24px 80px rgba(0,0,0,0.5)', animation: 'fadeIn 0.2s ease', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>{report.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{report.period} · {report.pages} pages · {report.size}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={16} /></button>
        </div>
        {/* Mock document preview */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, background: 'var(--bg-tertiary)' }}>
          <div style={{ background: 'white', borderRadius: 8, padding: 32, color: '#1a1a1a', fontFamily: 'Georgia, serif', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <div style={{ borderBottom: '2px solid #0a0e1a', paddingBottom: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#0a0e1a' }}>VAULT</div>
              <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>Institutional Portfolio Intelligence</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginTop: 12 }}>{report.name}</div>
              <div style={{ fontSize: 12, color: '#666' }}>{report.period}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Total Portfolio Value', value: formatCurrency(PORTFOLIO_KPI.totalValue) },
                { label: 'Total Return', value: `+${PORTFOLIO_KPI.totalGainPct.toFixed(2)}%` },
                { label: 'YTD Performance', value: `+${PORTFOLIO_KPI.ytdReturn}%` },
              ].map(item => (
                <div key={item.label} style={{ padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                  <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{item.value}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, borderBottom: '1px solid #eee', paddingBottom: 6 }}>Top Holdings</div>
            {HOLDINGS.slice(0, 5).map(h => (
              <div key={h.ticker} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0', fontSize: 12 }}>
                <span style={{ fontWeight: 600 }}>{h.ticker}</span>
                <span>{h.name}</span>
                <span>{h.weight}%</span>
                <span style={{ color: h.unrealizedGainPct >= 0 ? '#16a34a' : '#dc2626' }}>{`${h.unrealizedGainPct >= 0 ? '+' : ''}${h.unrealizedGainPct.toFixed(1)}%`}</span>
              </div>
            ))}
            <div style={{ fontSize: 10, color: '#999', marginTop: 24, textAlign: 'center' }}>
              Generated by Vault · {new Date().toLocaleDateString()} · Page 1 of {report.pages}
            </div>
          </div>
        </div>
        <div style={{ padding: 16, borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexShrink: 0 }}>
          <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => { toast.success('Downloading...', `${report.name} PDF generating`); setTimeout(() => toast.success('Download complete', `${report.name}.pdf saved`), 1500); onClose(); }}>
            <Download size={13} /> Download PDF
          </button>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </>
  );
}

function ScheduleModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ frequency: 'monthly', type: 'Monthly Statement', email: '', day: '1' });

  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 420, background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)', borderRadius: 14, zIndex: 60, boxShadow: '0 24px 80px rgba(0,0,0,0.5)', animation: 'fadeIn 0.2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>Schedule Report</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={16} /></button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Report Type', key: 'type', type: 'select', options: REPORTS.map(r => r.name) },
            { label: 'Frequency', key: 'frequency', type: 'select', options: ['weekly', 'monthly', 'quarterly'] },
            { label: 'Deliver to Email', key: 'email', type: 'email', placeholder: 'you@example.com' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{f.label}</label>
              {f.type === 'select'
                ? <select value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="vault-input">
                  {f.options?.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                </select>
                : <input type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="vault-input" />}
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { toast.success('Report scheduled', `${form.type} will be sent ${form.frequency}`); onClose(); }}>Schedule</button>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ReportsPage() {
  const [previewReport, setPreviewReport] = useState<typeof REPORTS[0] | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {previewReport && <PreviewModal report={previewReport} onClose={() => setPreviewReport(null)} />}
      {showSchedule && <ScheduleModal onClose={() => setShowSchedule(false)} />}

      <div className="page-header">
        <div className="page-title">Reports</div>
        <button className="btn btn-ghost" onClick={() => setShowSchedule(true)}><Calendar size={12} /> Schedule Report</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {REPORTS.map(r => (
          <div key={r.id} className="vault-card" style={{ padding: 18, cursor: 'pointer', transition: 'background 200ms' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = '')}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--accent-cyan-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={16} style={{ color: 'var(--accent-cyan)' }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{r.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{r.desc}</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="badge badge-neutral">{r.period}</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 8 }}>{r.pages}p · {r.size}</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => setPreviewReport(r)}>Preview</button>
                <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => { toast.success('Downloading...', `${r.name} PDF generating`); setTimeout(() => toast.success('Download complete', `${r.name}.pdf saved`), 1500); }}>
                  <Download size={11} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tax Documents */}
      <div className="vault-card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Tax Documents</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {TAX_DOCS.map(doc => (
            <div key={doc.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--bg-tertiary)', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: doc.status === 'ready' ? 'var(--positive-dim)' : 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {doc.status === 'ready' ? <Check size={16} style={{ color: 'var(--positive)' }} /> : <Clock size={16} style={{ color: 'var(--warning)' }} />}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{doc.name} · {doc.year}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{doc.desc}</div>
                </div>
              </div>
              {doc.status === 'ready'
                ? <button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => { toast.success('Downloading...', `${doc.name} ${doc.year} downloading`); }}>
                  <Download size={11} /> Download
                </button>
                : <span className="badge badge-warning">Processing</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Custom Report Builder */}
      <div className="vault-card" style={{ padding: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Custom Report Builder</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <div><label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>From</label><input type="date" className="vault-input" style={{ width: 160 }} defaultValue="2026-01-01" /></div>
          <div><label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>To</label><input type="date" className="vault-input" style={{ width: 160 }} defaultValue="2026-04-23" /></div>
          <div><label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Sections</label>
            <select className="vault-input" style={{ width: 200 }}>
              <option>All Sections</option><option>Performance Only</option><option>Transactions Only</option><option>Tax Lots Only</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => { toast.info('Generating...', 'Building your custom report'); setTimeout(() => toast.success('Report ready', 'Custom-report.pdf downloaded'), 2000); }}>
          <Download size={12} /> Generate Report
        </button>
      </div>
    </div>
  );
}