import { Injectable, Logger, Inject, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../shared/supabase/supabase.service';
import { ForexService } from '../forex/forex.service';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  DOLARAPI_BASE_URL,
  FRANKFURTER_BASE_URL,
  FETCH_TIMEOUT_DOLARAPI,
  FETCH_TIMEOUT_LONG,
  CACHE_TTL_PRICE,
  VES_SNAPSHOT_INTERVAL_MS,
} from '../../shared/constants';
import { getConfigNumber } from '../../shared/config-utils';

export type VesHistoryDay = {
  date: string;
  oficial: number;
  paralelo: number;
  oficial_eur?: number;
  paralelo_eur?: number;
};

export type UsdToVes = {
  from: string;
  to: string;
  oficial: number;
  paralelo: number;
  date: string;
  source: string;
  timestamp: number;
};

@Injectable()
export class VesService implements OnModuleInit {
  private readonly logger = new Logger(VesService.name);

  private readonly dolarApiUrl: string;
  private readonly frankfurterUrl: string;
  private readonly fetchTimeoutDolarApi: number;
  private readonly fetchTimeoutLong: number;
  private readonly cacheTtlPrice: number;
  private readonly snapshotInterval: number;

  constructor(
    private supabaseService: SupabaseService,
    private forexService: ForexService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {
    this.dolarApiUrl = this.configService.get<string>('DOLARAPI_URL') ?? DOLARAPI_BASE_URL;
    this.frankfurterUrl = this.configService.get<string>('FRANKFURTER_URL') ?? FRANKFURTER_BASE_URL;
    this.fetchTimeoutDolarApi = getConfigNumber(this.configService, 'FETCH_TIMEOUT_DOLARAPI', FETCH_TIMEOUT_DOLARAPI);
    this.fetchTimeoutLong = getConfigNumber(this.configService, 'FETCH_TIMEOUT_LONG', FETCH_TIMEOUT_LONG);
    this.cacheTtlPrice = getConfigNumber(this.configService, 'CACHE_TTL_PRICE', CACHE_TTL_PRICE);
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

  async getPrice(): Promise<UsdToVes | null> {
    const cacheKey = "ves:usd";
    const cached = await this.cacheManager.get<UsdToVes>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.fetchDolarApi();
    if (result) {
      await this.cacheManager.set(cacheKey, result, this.cacheTtlPrice);
    }
    return result;
  }

  private async fetchDolarApi(): Promise<UsdToVes | null> {
    try {
      const res = await fetch(this.dolarApiUrl, { signal: AbortSignal.timeout(this.fetchTimeoutDolarApi) });
      if (!res.ok) {
        this.logger.warn(`DolarAPI responded with ${res.status} ${res.statusText}`);
        return null;
      }
      const data = (await res.json()) as Array<{
        nombre?: string;
        promedio?: number;
        fechaActualizacion?: string;
      }>;
      const oficial = data.find((d) => d.nombre?.toLowerCase() === "oficial");
      const paralelo = data.find((d) => d.nombre?.toLowerCase() === "paralelo");
      const rateOficial = oficial?.promedio;
      const rateParalelo = paralelo?.promedio;
      if (rateOficial == null && rateParalelo == null) return null;
      const date =
        oficial?.fechaActualizacion?.slice(0, 10) ??
        paralelo?.fechaActualizacion?.slice(0, 10) ??
        new Date().toISOString().slice(0, 10);
      return {
        from: "USD",
        to: "VES",
        oficial: rateOficial ?? 0,
        paralelo: rateParalelo ?? 0,
        date,
        source: "dolarapi",
        timestamp: Date.now(),
      };
    } catch (e) {
      this.logger.error('Error fetching DolarAPI', e);
      return null;
    }
  }

  async getHistory(days: number): Promise<VesHistoryDay[]> {
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
      const day = r.datetime.slice(0, 10);
      byDay.set(day, {
        oficial: r.oficial,
        paralelo: r.paralelo,
        usd_eur: r.usd_eur ?? null,
      });
    }
    
    return Array.from(byDay.entries())
      .map(([date, v]) => {
        const day: VesHistoryDay = { date, oficial: v.oficial, paralelo: v.paralelo };
        if (v.usd_eur != null && v.usd_eur > 0) {
          day.oficial_eur = v.oficial / v.usd_eur;
          day.paralelo_eur = v.paralelo / v.usd_eur;
        }
        return day;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async saveVesSnapshot(oficial: number, paralelo: number, usd_eur: number | null = null): Promise<void> {
    const key = new Date().toISOString().slice(0, 13) + ":00:00";
    
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
    const data = await this.fetchDolarApi();
    if (!data || (data.oficial <= 0 && data.paralelo <= 0)) return;
    
    const forex = await this.forexService.findRate("USD", "EUR");
    const usd_eur = forex?.rate != null && forex.rate > 0 ? forex.rate : null;
    await this.saveVesSnapshot(data.oficial, data.paralelo, usd_eur);
  }

  async backfillUsdEurFromFrankfurter(): Promise<void> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);
    const start = startDate.toISOString().slice(0, 10);
    const url = `${this.frankfurterUrl}/v1/${start}..?base=USD&symbols=EUR`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(this.fetchTimeoutLong) });
      if (!res.ok) {
        this.logger.warn(`Frankfurter backfill USD/EUR failed: ${res.status} ${res.statusText}`);
        return;
      }
      const data = (await res.json()) as {
        rates?: Record<string, { EUR?: number }>;
      };
      const rates = data.rates;
      if (!rates || typeof rates !== "object") return;
      
      for (const [date, row] of Object.entries(rates)) {
        const rate = row?.EUR;
        if (rate == null || Number.isNaN(rate) || rate <= 0) continue;
        
        try {
          await this.supabaseService.getClient()
            .from('ves_history')
            .update({ usd_eur: rate })
            .like('datetime', `${date}%`);
        } catch (e) {
          this.logger.warn(`Backfill usd_eur update failed for date ${date}`, e instanceof Error ? e.message : e);
        }
      }
    } catch (e) {
      this.logger.error('Error backfilling USD/EUR', e);
    }
  }
}
