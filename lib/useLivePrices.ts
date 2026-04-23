'use client';
import { useState, useEffect, useRef } from 'react';
import { HOLDINGS } from './mock-data';

type PriceMap = Record<string, number>;

let globalPrices: PriceMap = Object.fromEntries(HOLDINGS.map(h => [h.ticker, h.currentPrice]));
const listeners = new Set<(prices: PriceMap) => void>();

// Singleton interval — only one across the whole app
let intervalId: ReturnType<typeof setInterval> | null = null;

function startSimulation() {
  if (intervalId) return;
  intervalId = setInterval(() => {
    globalPrices = Object.fromEntries(
      Object.entries(globalPrices).map(([ticker, price]) => [
        ticker,
        parseFloat((price * (1 + (Math.random() - 0.5) * 0.0015)).toFixed(2))
      ])
    );
    listeners.forEach(fn => fn({ ...globalPrices }));
  }, 3000);
}

export function useLivePrices(): PriceMap {
  const [prices, setPrices] = useState<PriceMap>({ ...globalPrices });

  useEffect(() => {
    startSimulation();
    listeners.add(setPrices);
    return () => { listeners.delete(setPrices); };
  }, []);

  return prices;
}

export function getPrice(ticker: string): number {
  return globalPrices[ticker] ?? 0;
}
