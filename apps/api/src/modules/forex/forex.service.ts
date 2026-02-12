import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  FRANKFURTER_BASE_URL,
  FETCH_TIMEOUT_DEFAULT,
  FETCH_TIMEOUT_MEDIUM,
  CACHE_TTL_PRICE,
  CACHE_TTL_HISTORY_LONG,
} from '../../shared/constants';

export type ForexRate = {
  from: string;
  to: string;
  rate: number;
  date: string;
  source: string;
  timestamp: number;
};

export type ForexHistoryDay = { date: string; rate: number };

@Injectable()
export class ForexService {
  private readonly logger = new Logger(ForexService.name);

  private readonly frankfurterUrl: string;
  private readonly fetchTimeout: number;
  private readonly fetchTimeoutMedium: number;
  private readonly cacheTtlPrice: number;
  private readonly cacheTtlHistory: number;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {
    this.frankfurterUrl = this.configService.get<string>('FRANKFURTER_URL') ?? FRANKFURTER_BASE_URL;
    this.fetchTimeout = this.configService.get<number>('FETCH_TIMEOUT') ?? FETCH_TIMEOUT_DEFAULT;
    this.fetchTimeoutMedium = this.configService.get<number>('FETCH_TIMEOUT_MEDIUM') ?? FETCH_TIMEOUT_MEDIUM;
    this.cacheTtlPrice = this.configService.get<number>('CACHE_TTL_PRICE') ?? CACHE_TTL_PRICE;
    this.cacheTtlHistory = this.configService.get<number>('CACHE_TTL_HISTORY_LONG') ?? CACHE_TTL_HISTORY_LONG;
  }

  async getRate(from: string, to: string): Promise<ForexRate | null> {
    const f = from.toUpperCase();
    const t = to.toUpperCase();
    
    if (f === t) {
      return { from: f, to: t, rate: 1, date: new Date().toISOString().slice(0, 10), source: "identity", timestamp: Date.now() };
    }

    const cacheKey = `forex:${f}:${t}`;
    const cached = await this.cacheManager.get<ForexRate>(cacheKey);
    if (cached) return cached;

    const result = await this.fetchFrankfurter(f, t);
    if (result) {
      await this.cacheManager.set(cacheKey, result, this.cacheTtlPrice);
    }
    return result;
  }

  async getHistory(from: string, to: string, days: number): Promise<ForexHistoryDay[]> {
    const f = from.toUpperCase();
    const t = to.toUpperCase();
    const daysValid = Math.min(365, Math.max(1, days));
    
    const cacheKey = `forex:history:${f}:${t}:${daysValid}`;
    const cached = await this.cacheManager.get<{ history: ForexHistoryDay[] }>(cacheKey);
    if (cached) return cached.history;

    if (f === t) return [];

    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - daysValid);
    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);
    const url = `${this.frankfurterUrl}/v1/${startStr}..${endStr}?base=${f}&symbols=${t}`;

    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(this.fetchTimeoutMedium) });
      if (!res.ok) return [];
      const data = (await res.json()) as { rates?: Record<string, Record<string, number>> };
      const rates = data.rates;
      if (!rates || typeof rates !== "object") return [];
      
      const history = Object.entries(rates)
        .map(([date, row]) => {
          const rate = row?.[t];
          return rate != null && !Number.isNaN(rate) ? { date, rate } : null;
        })
        .filter((x): x is ForexHistoryDay => x != null)
        .sort((a, b) => a.date.localeCompare(b.date));

      await this.cacheManager.set(cacheKey, { history }, this.cacheTtlHistory);
      return history;
    } catch (e) {
      this.logger.error(`Error fetching forex history ${f}->${t}`, e);
      return [];
    }
  }

  private async fetchFrankfurter(from: string, to: string): Promise<ForexRate | null> {
    const url = `${this.frankfurterUrl}/v1/latest?base=${from}&symbols=${to}`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(this.fetchTimeout) });
      if (!res.ok) return null;
      const data = (await res.json()) as {
        base?: string;
        date?: string;
        rates?: Record<string, number>;
      };
      const rate = data.rates?.[to];
      if (rate == null || Number.isNaN(rate)) return null;
      return {
        from: (data.base ?? from).toUpperCase(),
        to: to.toUpperCase(),
        rate,
        date: data.date ?? new Date().toISOString().slice(0, 10),
        source: "frankfurter",
        timestamp: Date.now(),
      };
    } catch {
      return null;
    }
  }
}
