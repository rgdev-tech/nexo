import { Injectable, Inject, Logger } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

export type CryptoPrice = {
  symbol: string;
  price: number;
  currency: string;
  source: string;
  timestamp: number;
  change24h?: number;
};

export type CryptoHistoryDay = { date: string; price: number };

const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
  BNB: "binancecoin",
  SOL: "solana",
  XRP: "ripple",
  USDC: "usd-coin",
  ADA: "cardano",
  DOGE: "dogecoin",
  AVAX: "avalanche-2",
  DOT: "polkadot",
  MATIC: "matic-network",
  LINK: "chainlink",
  UNI: "uniswap",
  ATOM: "cosmos",
  LTC: "litecoin",
  NEAR: "near",
  APT: "aptos",
  ARB: "arbitrum",
  OP: "optimism",
  INJ: "injective-protocol",
  SUI: "sui",
  SEI: "sei-network",
  TIA: "celestia",
};

@Injectable()
export class CryptoService {
  private readonly logger = new Logger(CryptoService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getPrice(symbol: string, currency = 'USD'): Promise<CryptoPrice | null> {
    const sym = symbol.toUpperCase();
    const cur = currency.toUpperCase();
    const cacheKey = `crypto:${sym}:${cur}`;
    
    const cached = await this.cacheManager.get<CryptoPrice>(cacheKey);
    if (cached) return cached;

    let result = await this.fetchBinance(sym, cur === "USD" ? "USDT" : cur);
    if (!result) {
      result = await this.fetchCoinGecko(sym, cur);
    }

    if (result) {
      await this.cacheManager.set(cacheKey, result, 60000); // 1 min
    }

    return result;
  }

  async getPrices(symbols: string[], currency = 'USD'): Promise<CryptoPrice[]> {
    const cacheKey = `crypto:${symbols.join(",")}:${currency}`;
    const cached = await this.cacheManager.get<CryptoPrice[]>(cacheKey);
    if (cached) return cached;

    const results = await Promise.all(
      symbols.map((s) => this.getPrice(s.trim(), currency))
    );
    const filtered = results.filter((r): r is CryptoPrice => r != null);
    
    if (filtered.length > 0) {
      await this.cacheManager.set(cacheKey, filtered, 60000);
    }
    
    return filtered;
  }

  async getHistory(symbol: string, currency = 'USD', days = 7): Promise<CryptoHistoryDay[]> {
    const daysValid = Math.min(90, Math.max(1, days));
    const cacheKey = `crypto:history:${symbol}:${currency}:${daysValid}`;
    
    const cached = await this.cacheManager.get<{ history: CryptoHistoryDay[] }>(cacheKey);
    if (cached) return cached.history;

    const id = COINGECKO_IDS[symbol.toUpperCase()];
    if (!id) return [];
    
    const vs = currency.toLowerCase();
    const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=${vs}&days=${daysValid}`;
    // 30/90 días devuelven muchos más puntos (hourly); dar más tiempo a CoinGecko
    const timeoutMs = daysValid >= 30 ? 25000 : 12000;
    const RETRYABLE_STATUSES = [408, 429, 502, 503, 504]; // timeout, rate limit, gateway/server errors

    const fetchOnce = async (): Promise<CryptoHistoryDay[]> => {
      const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
      if (!res.ok) {
        const body = await res.text();
        this.logger.warn(
          `CoinGecko history ${symbol} days=${daysValid}: ${res.status} ${body.slice(0, 200)}`
        );
        if (RETRYABLE_STATUSES.includes(res.status)) {
          throw new Error(`CoinGecko ${res.status}`);
        }
        return [];
      }
      const data = (await res.json()) as { prices?: [number, number][] };
      const prices = data.prices ?? [];
      const byDay = new Map<string, number>();
      for (const [ts, value] of prices) {
        const date = new Date(ts).toISOString().slice(0, 10);
        byDay.set(date, value);
      }
      return Array.from(byDay.entries())
        .map(([date, price]) => ({ date, price }))
        .sort((a, b) => a.date.localeCompare(b.date));
    };

    try {
      let history = await fetchOnce();
      if (history.length > 0) {
        await this.cacheManager.set(cacheKey, { history }, 5 * 60 * 1000); // 5 min
      }
      return history;
    } catch (e) {
      if (daysValid >= 30) {
        this.logger.log(`Retrying CoinGecko history ${symbol} days=${daysValid} after ${e instanceof Error ? e.message : "error"}`);
        await new Promise((r) => setTimeout(r, 2000));
        try {
          const history = await fetchOnce();
          if (history.length > 0) {
            await this.cacheManager.set(cacheKey, { history }, 5 * 60 * 1000);
          }
          return history;
        } catch (e2) {
          this.logger.error(`Error fetching history for ${symbol} days=${daysValid} (after retry)`, e2);
          return [];
        }
      }
      this.logger.error(`Error fetching history for ${symbol} days=${daysValid}`, e);
      return [];
    }
  }

  private async fetchBinance(symbol: string, currency: string): Promise<CryptoPrice | null> {
    const quote = currency === "USD" ? "USDT" : currency;
    const pair = symbol + quote;
    const url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${pair}`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) return null;
      const data = (await res.json()) as { lastPrice?: string; priceChangePercent?: string };
      const price = parseFloat(data.lastPrice ?? "");
      if (Number.isNaN(price)) return null;
      const change24h = data.priceChangePercent != null ? parseFloat(data.priceChangePercent) : undefined;
      return {
        symbol,
        price,
        currency: currency === "USDT" ? "USD" : currency,
        source: "binance",
        timestamp: Date.now(),
        ...(Number.isFinite(change24h) && { change24h }),
      };
    } catch {
      return null;
    }
  }

  private async fetchCoinGecko(symbol: string, currency: string): Promise<CryptoPrice | null> {
    const id = COINGECKO_IDS[symbol.toUpperCase()];
    if (!id) return null;
    const vs = currency.toLowerCase();
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=${vs}`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) return null;
      const data = (await res.json()) as Record<string, Record<string, number>>;
      const price = data[id]?.[vs];
      if (price == null || Number.isNaN(price)) return null;
      return {
        symbol,
        price,
        currency: currency.toUpperCase(),
        source: "coingecko",
        timestamp: Date.now(),
      };
    } catch {
      return null;
    }
  }
}
