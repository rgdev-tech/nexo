import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  COINGECKO_BASE_URL,
  BINANCE_BASE_URL,
  FETCH_TIMEOUT_DEFAULT,
  FETCH_TIMEOUT_COINGECKO_SHORT,
  FETCH_TIMEOUT_COINGECKO_LONG,
  CACHE_TTL_CRYPTO_PRICE,
  CACHE_TTL_CRYPTO_HISTORY,
} from '../../shared/constants';
import { getConfigNumber } from '../../shared/config-utils';
import { ExternalHttpService } from '../../shared/http.service';
import type { CryptoPrice, CryptoHistoryDay } from '../../shared/types';

export type { CryptoPrice, CryptoHistoryDay };

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

  private readonly coingeckoUrl: string;
  private readonly binanceUrl: string;
  private readonly fetchTimeout: number;
  private readonly coingeckoTimeoutShort: number;
  private readonly coingeckoTimeoutLong: number;
  private readonly cacheTtlPrice: number;
  private readonly cacheTtlHistory: number;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
    private readonly http: ExternalHttpService,
  ) {
    this.coingeckoUrl = this.configService.get<string>('COINGECKO_URL') ?? COINGECKO_BASE_URL;
    this.binanceUrl = this.configService.get<string>('BINANCE_URL') ?? BINANCE_BASE_URL;
    this.fetchTimeout = getConfigNumber(this.configService, 'FETCH_TIMEOUT', FETCH_TIMEOUT_DEFAULT);
    this.coingeckoTimeoutShort = getConfigNumber(this.configService, 'FETCH_TIMEOUT_COINGECKO_SHORT', FETCH_TIMEOUT_COINGECKO_SHORT);
    this.coingeckoTimeoutLong = getConfigNumber(this.configService, 'FETCH_TIMEOUT_COINGECKO_LONG', FETCH_TIMEOUT_COINGECKO_LONG);
    this.cacheTtlPrice = getConfigNumber(this.configService, 'CACHE_TTL_CRYPTO_PRICE', CACHE_TTL_CRYPTO_PRICE);
    this.cacheTtlHistory = getConfigNumber(this.configService, 'CACHE_TTL_CRYPTO_HISTORY', CACHE_TTL_CRYPTO_HISTORY);
  }

  parseSymbols(raw?: string): string[] {
    if (!raw) return ['BTC', 'ETH'];
    return raw.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
  }

  async getPrice(symbol: string, currency = 'USD'): Promise<CryptoPrice> {
    const result = await this.findPrice(symbol, currency);
    if (!result) {
      throw new NotFoundException({ error: 'not_found', message: `No price for ${symbol}` });
    }
    return result;
  }

  async findPrice(symbol: string, currency = 'USD'): Promise<CryptoPrice | null> {
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
      await this.cacheManager.set(cacheKey, result, this.cacheTtlPrice);
    }

    return result;
  }

  async getPrices(symbols: string[], currency = 'USD'): Promise<CryptoPrice[]> {
    const cacheKey = `crypto:${symbols.join(",")}:${currency}`;
    const cached = await this.cacheManager.get<CryptoPrice[]>(cacheKey);
    if (cached) return cached;

    const results = await Promise.all(
      symbols.map((s) => this.findPrice(s.trim(), currency))
    );
    const filtered = results.filter((r): r is CryptoPrice => r != null);
    
    if (filtered.length > 0) {
      await this.cacheManager.set(cacheKey, filtered, this.cacheTtlPrice);
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
    const url = `${this.coingeckoUrl}/coins/${id}/market_chart?vs_currency=${vs}&days=${daysValid}`;
    // 30/90 días devuelven muchos más puntos (hourly); dar más tiempo a CoinGecko
    const timeoutMs = daysValid >= 30 ? this.coingeckoTimeoutLong : this.coingeckoTimeoutShort;

    const data = await this.http.fetchJson<{ prices?: [number, number][] }>(url, {
      timeout: timeoutMs,
      retries: daysValid >= 30 ? 1 : 0,
      retryDelay: 2_000,
      label: `CoinGecko history ${symbol} days=${daysValid}`,
    });
    if (!data) return [];

    const prices = data.prices ?? [];
    const byDay = new Map<string, number>();
    for (const [ts, value] of prices) {
      const date = new Date(ts).toISOString().slice(0, 10);
      byDay.set(date, value);
    }
    const history = Array.from(byDay.entries())
      .map(([date, price]) => ({ date, price }))
      .sort((a, b) => a.date.localeCompare(b.date));

    if (history.length > 0) {
      await this.cacheManager.set(cacheKey, { history }, this.cacheTtlHistory);
    }
    return history;
  }

  private async fetchBinance(symbol: string, currency: string): Promise<CryptoPrice | null> {
    const quote = currency === "USD" ? "USDT" : currency;
    const pair = symbol + quote;
    const url = `${this.binanceUrl}/ticker/24hr?symbol=${pair}`;

    const data = await this.http.fetchJson<{ lastPrice?: string; priceChangePercent?: string }>(url, {
      timeout: this.fetchTimeout,
      label: `Binance ${pair}`,
    });
    if (!data) return null;

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
  }

  private async fetchCoinGecko(symbol: string, currency: string): Promise<CryptoPrice | null> {
    const id = COINGECKO_IDS[symbol.toUpperCase()];
    if (!id) return null;
    const vs = currency.toLowerCase();
    const url = `${this.coingeckoUrl}/simple/price?ids=${id}&vs_currencies=${vs}`;

    const data = await this.http.fetchJson<Record<string, Record<string, number>>>(url, {
      timeout: this.fetchTimeout,
      label: `CoinGecko ${id}/${vs}`,
    });
    if (!data) return null;

    const price = data[id]?.[vs];
    if (price == null || Number.isNaN(price)) return null;
    return {
      symbol,
      price,
      currency: currency.toUpperCase(),
      source: "coingecko",
      timestamp: Date.now(),
    };
  }
}
