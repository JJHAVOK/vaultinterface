'use client';

export function Skeleton({ width = '100%', height = 16, borderRadius = 6 }: { width?: string | number; height?: number; borderRadius?: number }) {
  return (
    <div style={{
      width, height, borderRadius,
      background: 'linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-hover) 50%, var(--bg-elevated) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    }} />
  );
}

export function CardSkeleton() {
  return (
    <div className="vault-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Skeleton height={14} width="40%" />
      <Skeleton height={28} width="60%" />
      <Skeleton height={12} width="30%" />
    </div>
  );
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="vault-card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        <Skeleton height={12} width="30%" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 16, padding: '12px 16px', borderBottom: '1px solid var(--border)', opacity: 1 - i * 0.08 }}>
          <Skeleton height={12} width={60} />
          <Skeleton height={12} width="20%" />
          <Skeleton height={12} width="15%" />
          <Skeleton height={12} width="15%" />
          <Skeleton height={12} width="12%" />
        </div>
      ))}
    </div>
  );
}

// Add to globals.css:
// @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
