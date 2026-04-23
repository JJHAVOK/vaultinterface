'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore, useAuthStore } from '@/lib/store';
import {
  LayoutDashboard, TrendingUp, BarChart3, ArrowLeftRight,
  Globe, Search, Bookmark, Bell, FileText, Bot,
  User, Settings, LogOut, ChevronLeft, ChevronRight,
  Wallet
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Portfolio', href: '/dashboard/portfolio', icon: TrendingUp },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Transactions', href: '/dashboard/transactions', icon: ArrowLeftRight },
  { label: 'Markets', href: '/dashboard/markets', icon: Globe },
  { label: 'Screener', href: '/dashboard/screener', icon: Search },
  { label: 'Watchlists', href: '/dashboard/watchlists', icon: Bookmark },
  { label: 'Alerts', href: '/dashboard/alerts', icon: Bell },
  { label: 'Reports', href: '/dashboard/reports', icon: FileText },
  { label: 'Assistant', href: '/dashboard/assistant', icon: Bot },
];

const BOTTOM_ITEMS = [
  { label: 'Profile', href: '/dashboard/profile', icon: User },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { logout, user } = useAuthStore();

  const w = sidebarCollapsed ? 64 : 240;

  return (
    <aside
      style={{
        width: w,
        minWidth: w,
        height: '100vh',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 200ms cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        padding: sidebarCollapsed ? '0 16px' : '0 16px',
        borderBottom: '1px solid var(--border)',
        gap: 10,
        flexShrink: 0,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'var(--accent-cyan)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Wallet size={16} color="#000" />
        </div>
        {!sidebarCollapsed && (
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            VAULT
          </span>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link key={href} href={href} className={`nav-item ${active ? 'active' : ''}`}
                title={sidebarCollapsed ? label : undefined}
                style={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start', padding: sidebarCollapsed ? '8px' : '8px 12px' }}
              >
                <Icon size={16} className="nav-icon" style={{ flexShrink: 0 }} />
                {!sidebarCollapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border)', margin: '12px 4px' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {BOTTOM_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} className={`nav-item ${active ? 'active' : ''}`}
                title={sidebarCollapsed ? label : undefined}
                style={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start', padding: sidebarCollapsed ? '8px' : '8px 12px' }}
              >
                <Icon size={16} className="nav-icon" style={{ flexShrink: 0 }} />
                {!sidebarCollapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User + Collapse */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '8px', flexShrink: 0 }}>
        {/* User info */}
        {!sidebarCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px', marginBottom: 4 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-cyan), #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#000', flexShrink: 0,
            }}>
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pro Institutional</div>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className="nav-item"
          style={{ width: '100%', border: 'none', background: 'transparent', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', padding: sidebarCollapsed ? '8px' : '8px 12px', cursor: 'pointer' }}
          title={sidebarCollapsed ? 'Logout' : undefined}
        >
          <LogOut size={16} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
          {!sidebarCollapsed && <span style={{ color: 'var(--text-muted)' }}>Logout</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          style={{
            width: '100%', padding: '8px', border: 'none',
            background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-end',
            color: 'var(--text-muted)', borderRadius: 6, transition: 'all 200ms',
          }}
          className="nav-item"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          {!sidebarCollapsed && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
