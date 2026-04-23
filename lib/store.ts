'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Notification, Alert } from './types';
import { NOTIFICATIONS, ALERTS } from './mock-data';

interface AuthState {
  isAuthenticated: boolean;
  isFirstLogin: boolean;
  user: {
    name: string;
    email: string;
    plan: string;
    avatar?: string;
  };
  login: (email: string, password: string) => void;
  logout: () => void;
  completeOnboarding: () => void;
}

interface UIState {
  sidebarCollapsed: boolean;
  theme: 'dark' | 'light';
  commandPaletteOpen: boolean;
  shortcutsOpen: boolean;
  toggleSidebar: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  openShortcuts: () => void;
  closeShortcuts: () => void;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  markAllRead: () => void;
  markRead: (id: string) => void;
  addNotification: (n: Notification) => void;
}

interface AlertsState {
  alerts: Alert[];
  addAlert: (a: Alert) => void;
  removeAlert: (id: string) => void;
  toggleAlert: (id: string) => void;
}

interface WatchlistUIState {
  activeWatchlistId: string;
  setActiveWatchlist: (id: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isFirstLogin: true,
      user: {
        name: 'Demo Account',
        email: 'demo@demo.com',
        plan: 'institutional',
      },
      login: (_email: string, _password: string) => {
        set({ isAuthenticated: true });
      },
      logout: () => {
        set({ isAuthenticated: false });
      },
      completeOnboarding: () => {
        set({ isFirstLogin: false });
      },
    }),
    { name: 'vault-auth' }
  )
);

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      theme: 'dark',
      commandPaletteOpen: false,
      shortcutsOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setTheme: (theme) => set({ theme }),
      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),
      openShortcuts: () => set({ shortcutsOpen: true }),
      closeShortcuts: () => set({ shortcutsOpen: false }),
    }),
    { name: 'vault-ui' }
  )
);

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: NOTIFICATIONS,
  unreadCount: NOTIFICATIONS.filter((n) => !n.read).length,
  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  markRead: (id) =>
    set((s) => {
      const updated = s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      return { notifications: updated, unreadCount: updated.filter((n) => !n.read).length };
    }),
  addNotification: (n) =>
    set((s) => ({
      notifications: [n, ...s.notifications],
      unreadCount: s.unreadCount + (n.read ? 0 : 1),
    })),
}));

export const useAlertsStore = create<AlertsState>()((set) => ({
  alerts: ALERTS,
  addAlert: (a) => set((s) => ({ alerts: [...s.alerts, a] })),
  removeAlert: (id) => set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),
  toggleAlert: (id) =>
    set((s) => ({
      alerts: s.alerts.map((a) => (a.id === id ? { ...a, active: !a.active } : a)),
    })),
}));

export const useWatchlistStore = create<WatchlistUIState>()((set) => ({
  activeWatchlistId: 'wl1',
  setActiveWatchlist: (id) => set({ activeWatchlistId: id }),
}));
