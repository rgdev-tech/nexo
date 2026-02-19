import { Injectable, Logger, Inject, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../shared/supabase/supabase.service';
import { ExternalHttpService } from '../../shared/http.service';
import { ForexService } from '../forex/forex.service';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  DOLARAPI_BASE_URL,
  BINANCE_P2P_URL,
  PYDOLARVE_BASE_URL,
  FRANKFURTER_BASE_URL,
  FETCH_TIMEOUT_DOLARAPI,
  FETCH_TIMEOUT_LONG,
  CACHE_TTL_VES_PRICE,
  CACHE_TTL_VES_HISTORY,
  VES_SNAPSHOT_INTERVAL_MS,
} from '../../shared/constants';
import { getConfigNumber } from '../../shared/config-utils';
import type { VesHistoryDay, UsdToVes, VesSource } from '../../shared/types';

export type { VesHistoryDay, UsdToVes };

type DolarApiRaw = { oficial: number; paralelo: number; date: string };

@Injectable()
export class VesService implements OnModuleInit {
  private readonly logger = new Logger(VesService.name);

  private readonly dolarApiUrl: string;
  private readonly binanceP2pUrl: string;
  private readonly pyDolarVeUrl: string;
  private readonly frankfurterUrl: string;
  private readonly fetchTimeoutDolarApi: number;
  private readonly fetchTimeoutLong: number;
  private readonly cacheTtlPrice: number;
  private readonly cacheTtlHistory: number;
  private readonly snapshotInterval: number;

  constructor(
    private supabaseService: SupabaseService,
    private forexService: ForexService,
    private readonly http: ExternalHttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {
    this.dolarApiUrl = this.configService.get<string>('DOLARAPI_URL') ?? DOLARAPI_BASE_URL;
    this.binanceP2pUrl = this.configService.get<string>('BINANCE_P2P_URL') ?? BINANCE_P2P_URL;
    this.pyDolarVeUrl = this.configService.get<string>('PYDOLARVE_URL') ?? PYDOLARVE_BASE_URL;
    this.frankfurterUrl = this.configService.get<string>('FRANKFURTER_URL') ?? FRANKFURTER_BASE_URL;
    this.fetchTimeoutDolarApi = getConfigNumber(this.configService, 'FETCH_TIMEOUT_DOLARAPI', FETCH_TIMEOUT_DOLARAPI);
    this.fetchTimeoutLong = getConfigNumber(this.configService, 'FETCH_TIMEOUT_LONG', FETCH_TIMEOUT_LONG);
    this.cacheTtlPrice = getConfigNumber(this.configService, 'CACHE_TTL_VES_PRICE', CACHE_TTL_VES_PRICE);
    this.cacheTtlHistory = getConfigNumber(this.configService, 'CACHE_TTL_VES_HISTORY', CACHE_TTL_VES_HISTORY);
    this.snapshotInterval = getConfigNumber(this.configService, 'VES_SNAPSHOT_INTERVAL_MS', VES_SNAPSHOT_INTERVAL_MS);
  }

  onModuleInit() {
    if (this.configService.get<string>('VERCEL') === '1') {
      this.logger.log('Skipping VES background jobs (serverless); use /api/cron/ves-snapshot instead.');
      return;
    }
    this.logger.log('Initializing VES background jobs...');
    this.fetchAndSaveVes().catch((err) => this.logger.error('Error in initial fetchAndSaveVes:', err));
    this.backfillUsdEurFromFrankfurter().catch((err) => this.logger.error('Error in backfillUsdEurFromFrankfurter:', err));
    setInterval(() => {
      this.fetchAndSaveVes().catch((err) => this.logger.error('Error in interval fetchAndSaveVes:', err));
    }, this.snapshotInterval);
  }

  // ─── Public ────────────────────────────────────────────────────────────────

  async getPrice(): Promise<UsdToVes | null> {
    const cacheKey = "ves:usd";
    const cached = await this.cacheManager.get<UsdToVes>(cacheKey);
    if (cached) return cached;

    const [dolarApi, binanceRate, enParaleloRate] = await Promise.all([
      this.fetchDolarApi(),
      this.fetchBinanceP2p(),
      this.fetchEnParaleloVzla(),
    ]);

    if (!dolarApi) return null;

    const fuentes: VesSource[] = [];
    const now = Date.now();

    if (dolarApi.paralelo > 0) {
      fuentes.push({ nombre: 'DolarAPI', valor: dolarApi.paralelo, timestamp: now });
    }
    if (binanceRate != null && binanceRate > 0) {
      fuentes.push({ nombre: 'Binance P2P', valor: binanceRate, timestamp: now });
    }
    if (enParaleloRate != null && enParaleloRate > 0) {
      fuentes.push({ nombre: 'EnParaleloVzla', valor: enParaleloRate, timestamp: now });
    }

    const paralelo = fuentes.length > 0
      ? fuentes.reduce((s, f) => s + f.valor, 0) / fuentes.length
      : dolarApi.paralelo;

    const result: UsdToVes = {
      from: "USD",
      to: "VES",
      oficial: dolarApi.oficial,
      paralelo,
      date: dolarApi.date,
      source: fuentes.length > 1 ? "promedio" : (fuentes[0]?.nombre ?? "dolarapi"),
      timestamp: now,
      fuentes,
    };

    const forex = await this.forexService.findRate("USD", "EUR");
    if (forex?.rate != null && forex.rate > 0) {
      if (result.oficial > 0) result.oficial_eur = result.oficial / forex.rate;
      if (result.paralelo > 0) result.paralelo_eur = result.paralelo / forex.rate;
    }

    await this.cacheManager.set(cacheKey, result, this.cacheTtlPrice);
    this.logger.log(`VES price assembled from ${fuentes.length} source(s): ${fuentes.map(f => f.nombre).join(', ')}`);
    return result;
  }

  // ─── Source fetchers (each tolerant to failures) ───────────────────────────

  private async fetchDolarApi(): Promise<DolarApiRaw | null> {
    const cacheKey = 'ves:src:dolarapi';
    const cached = await this.cacheManager.get<DolarApiRaw>(cacheKey);
    if (cached) return cached;

    const data = await this.http.fetchJson<
      Array<{ nombre?: string; promedio?: number; fechaActualizacion?: string }>
    >(this.dolarApiUrl, {
      timeout: this.fetchTimeoutDolarApi,
      label: 'DolarAPI',
    });
    if (!data) return null;

    const oficial = data.find((d) => d.nombre?.toLowerCase() === "oficial");
    const paralelo = data.find((d) => d.nombre?.toLowerCase() === "paralelo");
    const rateOficial = oficial?.promedio;
    const rateParalelo = paralelo?.promedio;
    if (rateOficial == null && rateParalelo == null) return null;
    const date =
      oficial?.fechaActualizacion?.slice(0, 10) ??
      paralelo?.fechaActualizacion?.slice(0, 10) ??
      new Date().toISOString().slice(0, 10);

    const result: DolarApiRaw = { oficial: rateOficial ?? 0, paralelo: rateParalelo ?? 0, date };
    await this.cacheManager.set(cacheKey, result, this.cacheTtlPrice);
    return result;
  }

  private async fetchBinanceP2p(): Promise<number | null> {
    const cacheKey = 'ves:src:binance';
    const cached = await this.cacheManager.get<number>(cacheKey);
    if (cached != null) return cached;

    try {
      const data = await this.http.fetchJson<{
        data?: Array<{ adv?: { price?: string } }>;
      }>(this.binanceP2pUrl, {
        timeout: this.fetchTimeoutDolarApi,
        label: 'Binance P2P USDT/VES',
        method: 'POST',
        body: {
          asset: 'USDT',
          fiat: 'VES',
          tradeType: 'SELL',
          page: 1,
          rows: 10,
          merchantCheck: true,
          payTypes: [],
        },
      });

      const ads = data?.data;
      if (!ads || ads.length === 0) return null;

      const prices = ads
        .map((a) => parseFloat(a.adv?.price ?? ''))
        .filter((p) => p > 0);
      if (prices.length === 0) return null;

      const median = prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)];
      await this.cacheManager.set(cacheKey, median, this.cacheTtlPrice);
      return median;
    } catch (e) {
      this.logger.warn('Binance P2P fetch failed', e instanceof Error ? e.message : e);
      return null;
    }
  }

  private async fetchEnParaleloVzla(): Promise<number | null> {
    const cacheKey = 'ves:src:enparalelo';
    const cached = await this.cacheManager.get<number>(cacheKey);
    if (cached != null) return cached;

    try {
      const data = await this.http.fetchJson<{
        monitors?: Record<string, { price?: number; title?: string }>;
      }>(`${this.pyDolarVeUrl}?page=enparalelovzla`, {
        timeout: this.fetchTimeoutDolarApi,
        label: 'EnParaleloVzla',
      });

      const monitors = data?.monitors;
      if (!monitors) return null;

      const entry = Object.values(monitors).find(
        (m) => m.title?.toLowerCase().includes('enparalelo') || m.price != null,
      );
      const price = entry?.price;
      if (price == null || price <= 0) return null;

      await this.cacheManager.set(cacheKey, price, this.cacheTtlPrice);
      return price;
    } catch (e) {
      this.logger.warn('EnParaleloVzla fetch failed', e instanceof Error ? e.message : e);
      return null;
    }
  }

  async getHistory(days: number): Promise<VesHistoryDay[]> {
    const cacheKey = `ves:history:${days}`;
    const cached = await this.cacheManager.get<{ history: VesHistoryDay[] }>(cacheKey);
    if (cached) return cached.history;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startStr = startDate.toISOString();

    const { data: rows, error } = await this.supabaseService.getClient()
      .from('ves_history')
      .select('datetime, oficial, paralelo, usd_eur')
      .gte('datetime', startStr)
      .order('datetime', { ascending: true });

    if (error || !rows) {
      this.logger.error('Error fetching VES history:', error);
      return [];
    }

    const byDay = new Map<
      string,
      { oficial: number; paralelo: number; usd_eur: number | null }
    >();
    
    for (const r of rows) {
      // datetime ahora es timestamptz; extraemos YYYY-MM-DD desde un Date nativo
      const day = new Date(r.datetime).toISOString().slice(0, 10);
      byDay.set(day, {
        // numeric de Postgres llega como string vía PostgREST; convertir a number
        oficial: Number(r.oficial),
        paralelo: Number(r.paralelo),
        usd_eur: r.usd_eur != null ? Number(r.usd_eur) : null,
      });
    }
    
    const history = Array.from(byDay.entries())
      .map(([date, v]) => {
        const day: VesHistoryDay = { date, oficial: v.oficial, paralelo: v.paralelo };
        if (v.usd_eur != null && v.usd_eur > 0) {
          day.oficial_eur = v.oficial / v.usd_eur;
          day.paralelo_eur = v.paralelo / v.usd_eur;
        }
        return day;
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    if (history.length > 0) {
      await this.cacheManager.set(cacheKey, { history }, this.cacheTtlHistory);
    }
    return history;
  }

  async saveVesSnapshot(oficial: number, paralelo: number, usd_eur: number | null = null): Promise<void> {
    // Truncar a la hora exacta para agrupar snapshots por hora (timestamptz nativo)
    const key = new Date().toISOString().replace(/:\d{2}\.\d{3}Z$/, ':00.000Z');
    
    const { error } = await this.supabaseService.getClient()
      .from('ves_history')
      .upsert({ 
        datetime: key, 
        oficial, 
        paralelo, 
        usd_eur 
      }, { onConflict: 'datetime' });

    if (error) {
      this.logger.error('Error saving VES snapshot:', error);
    }
  }

  async fetchAndSaveVes(): Promise<void> {
    const price = await this.getPrice();
    if (!price || (price.oficial <= 0 && price.paralelo <= 0)) return;

    const forex = await this.forexService.findRate("USD", "EUR");
    const usd_eur = forex?.rate != null && forex.rate > 0 ? forex.rate : null;
    await this.saveVesSnapshot(price.oficial, price.paralelo, usd_eur);
  }

  async backfillUsdEurFromFrankfurter(): Promise<void> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);
    const start = startDate.toISOString().slice(0, 10);
    const url = `${this.frankfurterUrl}/v1/${start}..?base=USD&symbols=EUR`;

    const data = await this.http.fetchJson<{
      rates?: Record<string, { EUR?: number }>;
    }>(url, {
      timeout: this.fetchTimeoutLong,
      label: 'Frankfurter backfill USD/EUR',
    });

    const rates = data?.rates;
    if (!rates || typeof rates !== "object") return;
    
    for (const [date, row] of Object.entries(rates)) {
      const rate = row?.EUR;
      if (rate == null || Number.isNaN(rate) || rate <= 0) continue;
      
      try {
        // Usar rangos de fecha nativos en vez de .like() sobre text
        const dayStart = `${date}T00:00:00Z`;
        const dayEnd = `${date}T23:59:59Z`;
        await this.supabaseService.getClient()
          .from('ves_history')
          .update({ usd_eur: rate })
          .gte('datetime', dayStart)
          .lte('datetime', dayEnd);
      } catch (e) {
        this.logger.warn(`Backfill usd_eur update failed for date ${date}`, e instanceof Error ? e.message : e);
      }
    }
  }
}
