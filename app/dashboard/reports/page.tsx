'use client';
import { FileText, Download, Calendar } from 'lucide-react';

const REPORTS = [
  { id: 'r1', name: 'Monthly Statement', desc: 'Full portfolio activity for April 2026', period: 'Apr 2026', size: '2.4 MB' },
  { id: 'r2', name: 'Annual Performance', desc: 'YTD performance and returns breakdown', period: '2026 YTD', size: '4.1 MB' },
  { id: 'r3', name: 'Tax Summary', desc: 'Capital gains, dividends, and tax lots', period: '2025 Full Year', size: '3.8 MB' },
  { id: 'r4', name: 'Dividend Report', desc: 'All dividend income and projections', period: 'Q1 2026', size: '1.2 MB' },
  { id: 'r5', name: 'Risk Analysis', desc: 'Portfolio risk metrics and exposure report', period: 'Current', size: '2.9 MB' },
  { id: 'r6', name: 'Holdings Summary', desc: 'Snapshot of all positions and weights', period: 'Current', size: '0.8 MB' },
];

export default function ReportsPage() {
  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div className="page-header">
        <div className="page-title">Reports</div>
        <button className="btn btn-ghost"><Calendar size={12} /> Schedule Report</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {REPORTS.map(r => (
          <div key={r.id} className="vault-card" style={{ padding: 18 }}>
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
                <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 8 }}>{r.size}</span>
              </div>
              <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }}><Download size={11} /> PDF</button>
            </div>
          </div>
        ))}
      </div>

      <div className="vault-card" style={{ padding: 20 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Custom Report Builder</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Date Range</label>
            <input type="date" className="vault-input" style={{ width: 160 }} defaultValue="2026-01-01" />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>To</label>
            <input type="date" className="vault-input" style={{ width: 160 }} defaultValue="2026-04-23" />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Include</label>
            <select className="vault-input" style={{ width: 180 }}>
              <option>All Sections</option>
              <option>Performance Only</option>
              <option>Transactions Only</option>
              <option>Tax Lots Only</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary"><Download size={12} /> Generate Report</button>
      </div>
    </div>
  );
}