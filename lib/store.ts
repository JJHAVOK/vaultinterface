import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── AUTH STORE ───────────────────────────────────────────────────────────────
interface AuthState {
  isAuthenticated: boolean;
  isFirstLogin: boolean;
  user: { name: string; email: string; plan: string; };
  login: (email: string) => void;
  logout: () => void;
  completeOnboarding: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isFirstLogin: false,
      user: { name: 'Demo Account', email: 'demo@demo.com', plan: 'institutional' },
      login: (_email: string) => set({ isAuthenticated: true, isFirstLogin: true }),
      logout: () => set({ isAuthenticated: false }),
      completeOnboarding: () => set({ isFirstLogin: false }),
    }),
    { name: 'vault-auth' }
  )
);

// ─── UI STORE ─────────────────────────────────────────────────────────────────
interface UIState {
  theme: 'dark' | 'light';
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  shortcutsOpen: boolean;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleSidebar: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  openShortcuts: () => void;
  closeShortcuts: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      shortcutsOpen: false,
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),
      openShortcuts: () => set({ shortcutsOpen: true }),
      closeShortcuts: () => set({ shortcutsOpen: false }),
    }),
    { name: 'vault-ui' }
  )
);

// ─── ALERTS STORE ─────────────────────────────────────────────────────────────
export interface Alert {
  id: string;
  ticker: string;
  condition: 'above' | 'below' | 'change_up' | 'change_down';
  value: number;
  method: 'push' | 'email' | 'sms';
  active: boolean;
  triggered?: boolean;
  createdAt: string;
}

interface AlertsState {
  alerts: Alert[];
  addAlert: (alert: Alert) => void;
  removeAlert: (id: string) => void;
  toggleAlert: (id: string) => void;
}

export const useAlertsStore = create<AlertsState>()(
  persist(
    (set) => ({
      alerts: [
        { id: 'demo1', ticker: 'NVDA', condition: 'above', value: 1000, method: 'push', active: true, createdAt: new Date().toISOString() },
        { id: 'demo2', ticker: 'AAPL', condition: 'below', value: 170, method: 'email', active: true, createdAt: new Date().toISOString() },
        { id: 'demo3', ticker: 'TSLA', condition: 'change_down', value: 5, method: 'push', active: false, createdAt: new Date().toISOString() },
      ],
      addAlert: (alert) => set((s) => ({ alerts: [...s.alerts, alert] })),
      removeAlert: (id) => set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),
      toggleAlert: (id) => set((s) => ({ alerts: s.alerts.map((a) => a.id === id ? { ...a, active: !a.active } : a) })),
    }),
    { name: 'vault-alerts' }
  )
);

// ─── WATCHLIST STORE ──────────────────────────────────────────────────────────
interface WatchlistState {
  activeWatchlistId: string;
  setActiveWatchlist: (id: string) => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set) => ({
      activeWatchlistId: 'wl1',
      setActiveWatchlist: (id) => set({ activeWatchlistId: id }),
    }),
    { name: 'vault-watchlist' }
  )
);

// ─── NOTIFICATIONS STORE (used by Topbar) ────────────────────────────────────
export interface AppNotification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

interface NotifState {
  // Notification feed (Topbar bell)
  notifications: AppNotification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  // Notification preferences (Settings page)
  prefs: {
    price: boolean;
    milestone: boolean;
    marketOpen: boolean;
    digest: boolean;
  };
  setPrefs: (prefs: Partial<NotifState['prefs']>) => void;
}

const DEMO_NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', title: 'NVDA alert triggered', body: 'NVDA crossed $875 — up 2.4% today', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
  { id: 'n2', title: 'Portfolio milestone', body: 'Your portfolio crossed $200K for the first time!', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  { id: 'n3', title: 'Weekly digest ready', body: 'Your week ending Apr 20 summary is available', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  { id: 'n4', title: 'Dividend received', body: 'AAPL paid $0.25/share dividend — $37.25 credited', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
];

export const useNotifStore = create<NotifState>()(
  persist(
    (set) => ({
      notifications: DEMO_NOTIFICATIONS,
      unreadCount: DEMO_NOTIFICATIONS.filter(n => !n.read).length,
      markRead: (id) => set((s) => {
        const notifications = s.notifications.map(n => n.id === id ? { ...n, read: true } : n);
        return { notifications, unreadCount: notifications.filter(n => !n.read).length };
      }),
      markAllRead: () => set((s) => ({
        notifications: s.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      })),
      prefs: { price: true, milestone: true, marketOpen: false, digest: true },
      setPrefs: (p) => set((s) => ({ prefs: { ...s.prefs, ...p } })),
    }),
    { name: 'vault-notifs' }
  )
);