export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: 'starter' | 'pro' | 'institutional';
  joinedAt: string;
  twoFactorEnabled: boolean;
}

export interface Holding {
  id: string;
  ticker: string;
  name: string;
  sector: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  previousClose: number;
  marketValue: number;
  costBasis: number;
  unrealizedGain: number;
  unrealizedGainPct: number;
  dayChange: number;
  dayChangePct: number;
  weight: number;
  logoColor: string;
}

export interface Transaction {
  id: string;
  date: string;
  ticker: string;
  name: string;
  type: 'buy' | 'sell' | 'dividend' | 'fee' | 'transfer';
  shares?: number;
  price?: number;
  amount: number;
  runningBalance: number;
  notes?: string;
}

export interface WatchlistItem {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  sparkline: number[];
  marketCap: string;
  volume: string;
}

export interface MarketIndex {
  name: string;
  ticker: string;
  value: number;
  change: number;
  changePct: number;
}

export interface PortfolioSnapshot {
  date: string;
  value: number;
  benchmark: number;
}

export interface MonthlyReturn {
  year: number;
  month: number;
  return: number;
}

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

export interface Notification {
  id: string;
  type: 'alert' | 'milestone' | 'news' | 'system';
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface ScreenerStock {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePct: number;
  marketCap: number;
  pe: number;
  eps: number;
  dividend: number;
  revenueGrowth: number;
  week52High: number;
  week52Low: number;
  volume: number;
  avgVolume: number;
}

export interface Watchlist {
  id: string;
  name: string;
  tickers: string[];
  createdAt: string;
}

export interface TaxLot {
  id: string;
  ticker: string;
  shares: number;
  costBasis: number;
  currentValue: number;
  acquiredDate: string;
  holdingPeriod: 'short' | 'long';
  unrealizedGain: number;
  estimatedTax: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  toolUse?: {
    name: string;
    result: string;
  };
}
