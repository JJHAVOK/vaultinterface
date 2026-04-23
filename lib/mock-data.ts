import { Holding, Transaction, WatchlistItem, MarketIndex, PortfolioSnapshot, MonthlyReturn, ScreenerStock, Alert, Notification, TaxLot, Watchlist } from './types';
import { generateSparkline } from './utils';

// ─── HOLDINGS ────────────────────────────────────────────────────────────────
export const HOLDINGS: Holding[] = [
  { id: '1', ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology', shares: 150, avgCost: 142.30, currentPrice: 189.84, previousClose: 187.15, marketValue: 28476, costBasis: 21345, unrealizedGain: 7131, unrealizedGainPct: 33.41, dayChange: 2.69, dayChangePct: 1.44, weight: 14.2, logoColor: '#555' },
  { id: '2', ticker: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', shares: 45, avgCost: 380.20, currentPrice: 875.40, previousClose: 862.30, marketValue: 39393, costBasis: 17109, unrealizedGain: 22284, unrealizedGainPct: 130.25, dayChange: 13.10, dayChangePct: 1.52, weight: 19.6, logoColor: '#76b900' },
  { id: '3', ticker: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', shares: 80, avgCost: 280.50, currentPrice: 415.26, previousClose: 412.87, marketValue: 33221, costBasis: 22440, unrealizedGain: 10781, unrealizedGainPct: 48.04, dayChange: 2.39, dayChangePct: 0.58, weight: 16.5, logoColor: '#00a4ef' },
  { id: '4', ticker: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', shares: 60, avgCost: 125.40, currentPrice: 171.95, previousClose: 170.20, marketValue: 10317, costBasis: 7524, unrealizedGain: 2793, unrealizedGainPct: 37.13, dayChange: 1.75, dayChangePct: 1.03, weight: 5.1, logoColor: '#4285f4' },
  { id: '5', ticker: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Discretionary', shares: 55, avgCost: 142.80, currentPrice: 185.07, previousClose: 183.50, marketValue: 10179, costBasis: 7854, unrealizedGain: 2325, unrealizedGainPct: 29.60, dayChange: 1.57, dayChangePct: 0.86, weight: 5.1, logoColor: '#ff9900' },
  { id: '6', ticker: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Discretionary', shares: 40, avgCost: 230.10, currentPrice: 177.58, previousClose: 182.40, marketValue: 7103, costBasis: 9204, unrealizedGain: -2101, unrealizedGainPct: -22.83, dayChange: -4.82, dayChangePct: -2.64, weight: 3.5, logoColor: '#e31937' },
  { id: '7', ticker: 'JPM', name: 'JPMorgan Chase', sector: 'Financials', shares: 70, avgCost: 148.20, currentPrice: 198.47, previousClose: 196.80, marketValue: 13893, costBasis: 10374, unrealizedGain: 3519, unrealizedGainPct: 33.92, dayChange: 1.67, dayChangePct: 0.85, weight: 6.9, logoColor: '#005eb8' },
  { id: '8', ticker: 'V', name: 'Visa Inc.', sector: 'Financials', shares: 65, avgCost: 215.40, currentPrice: 280.12, previousClose: 278.90, marketValue: 18208, costBasis: 14001, unrealizedGain: 4207, unrealizedGainPct: 30.05, dayChange: 1.22, dayChangePct: 0.44, weight: 9.1, logoColor: '#1a1f71' },
  { id: '9', ticker: 'BRK.B', name: 'Berkshire Hathaway', sector: 'Financials', shares: 90, avgCost: 310.20, currentPrice: 367.84, previousClose: 365.20, marketValue: 33106, costBasis: 27918, unrealizedGain: 5188, unrealizedGainPct: 18.58, dayChange: 2.64, dayChangePct: 0.72, weight: 16.5, logoColor: '#b5985a' },
  { id: '10', ticker: 'META', name: 'Meta Platforms', sector: 'Communication', shares: 30, avgCost: 245.80, currentPrice: 497.24, previousClose: 491.80, marketValue: 14917, costBasis: 7374, unrealizedGain: 7543, unrealizedGainPct: 102.30, dayChange: 5.44, dayChangePct: 1.11, weight: 7.4, logoColor: '#0866ff' },
];

// ─── PORTFOLIO HISTORY ────────────────────────────────────────────────────────
function generateHistory(days: number): PortfolioSnapshot[] {
  const data: PortfolioSnapshot[] = [];
  let portfolioVal = 145000;
  let benchmarkVal = 145000;
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const pChange = (Math.random() - 0.46) * 0.018;
    const bChange = (Math.random() - 0.47) * 0.014;
    portfolioVal = portfolioVal * (1 + pChange);
    benchmarkVal = benchmarkVal * (1 + bChange);
    data.push({
      date: date.toISOString().split('T')[0],
      value: parseFloat(portfolioVal.toFixed(2)),
      benchmark: parseFloat(benchmarkVal.toFixed(2)),
    });
  }
  return data;
}

export const PORTFOLIO_HISTORY = generateHistory(365);

// ─── MONTHLY RETURNS ──────────────────────────────────────────────────────────
export const MONTHLY_RETURNS: MonthlyReturn[] = [];
for (let year = 2021; year <= 2024; year++) {
  for (let month = 1; month <= 12; month++) {
    MONTHLY_RETURNS.push({
      year,
      month,
      return: parseFloat((Math.random() * 14 - 5).toFixed(2)),
    });
  }
}

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
const TICKERS = ['AAPL', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'JPM', 'V', 'META', 'BRK.B'];
export const TRANSACTIONS: Transaction[] = Array.from({ length: 120 }, (_, i) => {
  const ticker = TICKERS[i % TICKERS.length];
  const type = i % 8 === 0 ? 'dividend' : i % 12 === 0 ? 'fee' : i % 3 === 0 ? 'sell' : 'buy';
  const shares = type === 'dividend' || type === 'fee' ? undefined : Math.floor(Math.random() * 20) + 1;
  const price = type === 'dividend' || type === 'fee' ? undefined : parseFloat((Math.random() * 300 + 100).toFixed(2));
  const amount = type === 'fee' ? -9.99 : type === 'dividend' ? parseFloat((Math.random() * 200).toFixed(2)) : (shares! * price!) * (type === 'sell' ? 1 : -1);
  const date = new Date();
  date.setDate(date.getDate() - i * 3);
  return {
    id: `tx-${i}`,
    date: date.toISOString(),
    ticker,
    name: HOLDINGS.find(h => h.ticker === ticker)?.name || ticker,
    type,
    shares,
    price,
    amount,
    runningBalance: 200000 - i * 400,
    notes: i % 10 === 0 ? 'Quarterly rebalance' : undefined,
  };
});

// ─── WATCHLIST ────────────────────────────────────────────────────────────────
export const WATCHLIST_ITEMS: WatchlistItem[] = [
  { ticker: 'AAPL', name: 'Apple Inc.', price: 189.84, change: 2.69, changePct: 1.44, sparkline: generateSparkline(185, 20), marketCap: '2.94T', volume: '52.4M' },
  { ticker: 'NVDA', name: 'NVIDIA Corp.', price: 875.40, change: 13.10, changePct: 1.52, sparkline: generateSparkline(860, 20), marketCap: '2.16T', volume: '41.2M' },
  { ticker: 'AMD', name: 'Advanced Micro Devices', price: 178.95, change: -2.34, changePct: -1.29, sparkline: generateSparkline(182, 20), marketCap: '289B', volume: '38.1M' },
  { ticker: 'PLTR', name: 'Palantir Technologies', price: 24.87, change: 0.92, changePct: 3.84, sparkline: generateSparkline(23, 20), marketCap: '53B', volume: '72.4M' },
  { ticker: 'COIN', name: 'Coinbase Global', price: 218.45, change: -8.20, changePct: -3.62, sparkline: generateSparkline(228, 20), marketCap: '54B', volume: '12.8M' },
  { ticker: 'SOFI', name: 'SoFi Technologies', price: 8.42, change: 0.31, changePct: 3.82, sparkline: generateSparkline(8, 20), marketCap: '8.7B', volume: '28.4M' },
];

// ─── MARKET INDICES ───────────────────────────────────────────────────────────
export const MARKET_INDICES: MarketIndex[] = [
  { name: 'S&P 500', ticker: 'SPX', value: 5218.19, change: 42.03, changePct: 0.81 },
  { name: 'NASDAQ', ticker: 'COMP', value: 16742.39, change: 169.30, changePct: 1.02 },
  { name: 'Dow Jones', ticker: 'DJI', value: 39558.11, change: 253.58, changePct: 0.65 },
  { name: 'VIX', ticker: 'VIX', value: 14.23, change: -0.87, changePct: -5.76 },
  { name: 'Russell 2000', ticker: 'RUT', value: 2082.03, change: 18.42, changePct: 0.89 },
  { name: '10Y Treasury', ticker: 'TNX', value: 4.42, change: 0.03, changePct: 0.68 },
];

// ─── SCREENER STOCKS ──────────────────────────────────────────────────────────
const SECTORS = ['Technology', 'Financials', 'Healthcare', 'Consumer Discretionary', 'Industrials', 'Energy', 'Communication', 'Materials', 'Utilities', 'Real Estate'];
export const SCREENER_STOCKS: ScreenerStock[] = Array.from({ length: 500 }, (_, i) => {
  const tickers = ['AAPL','MSFT','GOOGL','AMZN','NVDA','META','TSLA','BRK.B','JPM','V','UNH','XOM','LLY','JNJ','PG','MA','AVGO','HD','CVX','MRK','ABBV','PEP','COST','KO','WMT','DIS','CSCO','ACN','ABT','NFLX','TMO','MCD','ADBE','DHR','CMCSA','BAC','CRM','PFE','NKE','NEE','AMD','INTC','ORCL','QCOM','TXN','LIN','RTX','HON','IBM','GS','SPGI','CAT','AXP','BKNG','ISRG','GILD','ADI','VRTX','SYK','REGN','DE','BLK','MDLZ','T','PANW','MU','CI','ZTS','ADP','MMC','PLD','SO','D','EW','KLAC','LRCX','NSC','CSX','GE','F','GM','UBER','LYFT','SNOW','DDOG','CRWD','OKTA','ZS','NET','CFLT','MDB','GTLB','BILL','AFRM','UPST','SQ','PYPL','HOOD','SOFI','COIN'];
  const ticker = tickers[i % tickers.length] + (i >= tickers.length ? `${Math.floor(i / tickers.length)}` : '');
  const price = parseFloat((Math.random() * 500 + 10).toFixed(2));
  const change = parseFloat((Math.random() * 10 - 4).toFixed(2));
  return {
    ticker: ticker.slice(0, 6),
    name: `${ticker} Corporation`,
    sector: SECTORS[i % SECTORS.length],
    price,
    change,
    changePct: parseFloat(((change / price) * 100).toFixed(2)),
    marketCap: Math.random() * 2_000_000_000_000,
    pe: parseFloat((Math.random() * 60 + 8).toFixed(1)),
    eps: parseFloat((Math.random() * 20 + 0.5).toFixed(2)),
    dividend: parseFloat((Math.random() * 4).toFixed(2)),
    revenueGrowth: parseFloat((Math.random() * 40 - 5).toFixed(1)),
    week52High: price * (1 + Math.random() * 0.5),
    week52Low: price * (1 - Math.random() * 0.4),
    volume: Math.floor(Math.random() * 50_000_000),
    avgVolume: Math.floor(Math.random() * 40_000_000),
  };
});

// ─── ALERTS ───────────────────────────────────────────────────────────────────
export const ALERTS: Alert[] = [
  { id: 'a1', ticker: 'NVDA', condition: 'above', value: 900, method: 'push', active: true, createdAt: '2024-01-15T10:00:00Z' },
  { id: 'a2', ticker: 'TSLA', condition: 'below', value: 170, method: 'email', active: true, createdAt: '2024-01-10T10:00:00Z' },
  { id: 'a3', ticker: 'AAPL', condition: 'change_up', value: 3, method: 'push', active: false, triggered: true, createdAt: '2024-01-05T10:00:00Z' },
];

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'alert', title: 'AAPL Price Alert', body: 'Apple crossed $189 — your target level.', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: 'n2', type: 'milestone', title: 'Portfolio Milestone 🎯', body: 'Your portfolio crossed $200,000 for the first time!', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
  { id: 'n3', type: 'news', title: 'Fed holds rates steady', body: 'Federal Reserve keeps benchmark rate at 5.25–5.50%.', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
  { id: 'n4', type: 'system', title: 'New login detected', body: 'Sign-in from Chrome on Windows — Atlanta, GA.', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
];

// ─── TAX LOTS ─────────────────────────────────────────────────────────────────
export const TAX_LOTS: TaxLot[] = HOLDINGS.flatMap(h => [
  { id: `lot-${h.ticker}-1`, ticker: h.ticker, shares: Math.floor(h.shares * 0.6), costBasis: h.avgCost * 0.95, currentValue: h.currentPrice, acquiredDate: '2022-03-15', holdingPeriod: 'long' as const, unrealizedGain: (h.currentPrice - h.avgCost * 0.95) * Math.floor(h.shares * 0.6), estimatedTax: Math.max(0, (h.currentPrice - h.avgCost * 0.95) * Math.floor(h.shares * 0.6) * 0.15) },
  { id: `lot-${h.ticker}-2`, ticker: h.ticker, shares: Math.floor(h.shares * 0.4), costBasis: h.avgCost * 1.05, currentValue: h.currentPrice, acquiredDate: '2024-01-10', holdingPeriod: 'short' as const, unrealizedGain: (h.currentPrice - h.avgCost * 1.05) * Math.floor(h.shares * 0.4), estimatedTax: Math.max(0, (h.currentPrice - h.avgCost * 1.05) * Math.floor(h.shares * 0.4) * 0.35) },
]);

// ─── WATCHLISTS ───────────────────────────────────────────────────────────────
export const WATCHLISTS: Watchlist[] = [
  { id: 'wl1', name: 'Tech Giants', tickers: ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'META'], createdAt: '2024-01-01T00:00:00Z' },
  { id: 'wl2', name: 'Dividend Income', tickers: ['JPM', 'V', 'JNJ', 'PG', 'KO'], createdAt: '2024-01-05T00:00:00Z' },
  { id: 'wl3', name: 'High Growth', tickers: ['PLTR', 'COIN', 'SOFI', 'AMD', 'CRWD'], createdAt: '2024-01-10T00:00:00Z' },
];

// ─── KPI SUMMARY ──────────────────────────────────────────────────────────────
export const PORTFOLIO_KPI = {
  totalValue: 208813,
  totalCostBasis: 145143,
  totalGain: 63670,
  totalGainPct: 43.87,
  dayChange: 1847.32,
  dayChangePct: 0.89,
  cashPosition: 12450,
  ytdReturn: 18.24,
};

// ─── SECTOR ALLOCATION ────────────────────────────────────────────────────────
export const SECTOR_ALLOCATION = [
  { sector: 'Technology', value: 101090, pct: 48.4, color: '#00d4ff' },
  { sector: 'Financials', value: 65207, pct: 31.2, color: '#7c3aed' },
  { sector: 'Communication', value: 14917, pct: 7.1, color: '#f59e0b' },
  { sector: 'Consumer Disc.', value: 17282, pct: 8.3, color: '#10b981' },
  { sector: 'Cash', value: 12450, pct: 5.0, color: '#6b7280' },
];

// ─── NEWS ──────────────────────────────────────────────────────────────────────
export const MARKET_NEWS = [
  { id: 'news1', headline: 'Fed signals potential rate cuts in second half of 2024', source: 'Reuters', sentiment: 'bullish' as const, time: '2h ago', ticker: 'SPX' },
  { id: 'news2', headline: 'NVIDIA reports record revenue driven by AI chip demand', source: 'Bloomberg', sentiment: 'bullish' as const, time: '3h ago', ticker: 'NVDA' },
  { id: 'news3', headline: 'Tesla misses delivery estimates for third consecutive quarter', source: 'WSJ', sentiment: 'bearish' as const, time: '4h ago', ticker: 'TSLA' },
  { id: 'news4', headline: 'Apple explores AI partnerships with Google and Anthropic', source: 'FT', sentiment: 'bullish' as const, time: '5h ago', ticker: 'AAPL' },
  { id: 'news5', headline: 'Regional bank stress tests show improved capital resilience', source: 'CNBC', sentiment: 'neutral' as const, time: '6h ago', ticker: 'JPM' },
  { id: 'news6', headline: 'CPI data shows inflation cooling to 3.1% annually', source: 'AP', sentiment: 'bullish' as const, time: '8h ago', ticker: 'SPX' },
];
