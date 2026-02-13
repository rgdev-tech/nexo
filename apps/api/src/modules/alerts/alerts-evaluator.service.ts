import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AlertsService } from './alerts.service';
import { PushTokensService } from '../push-tokens/push-tokens.service';
import { PushNotificationService } from '../../shared/push-notification.service';
import { VesService } from '../ves/ves.service';
import { CryptoService } from '../crypto/crypto.service';
import { ForexService } from '../forex/forex.service';
import type { AlertRow } from '../../shared/types';

/** Cooldown en ms: no reenviar si triggered_at fue hace menos de esto */
const ALERT_COOLDOWN_MS = 60 * 60 * 1000; // 1 hora

/** Intervalo de evaluación en modo long-running (dev) */
const EVALUATE_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos

@Injectable()
export class AlertsEvaluatorService implements OnModuleInit {
  private readonly logger = new Logger(AlertsEvaluatorService.name);

  constructor(
    private readonly alertsService: AlertsService,
    private readonly pushTokensService: PushTokensService,
    private readonly pushNotificationService: PushNotificationService,
    private readonly vesService: VesService,
    private readonly cryptoService: CryptoService,
    private readonly forexService: ForexService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    if (this.configService.get<string>('VERCEL') === '1') {
      this.logger.log('Skipping alerts background evaluation (serverless); use /api/cron/evaluate-alerts instead.');
      return;
    }

    this.logger.log('Initializing alerts background evaluation...');
    // Esperar 30s antes de la primera evaluación para que los servicios de precio inicialicen
    setTimeout(() => {
      this.evaluateAll().catch((err) => this.logger.error('Error in initial evaluateAll:', err));
    }, 30_000);

    setInterval(() => {
      this.evaluateAll().catch((err) => this.logger.error('Error in interval evaluateAll:', err));
    }, EVALUATE_INTERVAL_MS);
  }

  /**
   * Evalúa todas las alertas habilitadas, dispara notificaciones push
   * y devuelve un resumen.
   */
  async evaluateAll(): Promise<{ evaluated: number; triggered: number }> {
    const alerts = await this.alertsService.findAllEnabled();
    if (alerts.length === 0) {
      return { evaluated: 0, triggered: 0 };
    }

    this.logger.log(`Evaluating ${alerts.length} active alerts...`);

    // Pre-fetch current prices per type to avoid duplicate requests
    const prices = await this.fetchCurrentPrices(alerts);
    let triggered = 0;

    for (const alert of alerts) {
      try {
        const currentPrice = this.resolvePrice(alert, prices);
        if (currentPrice == null) continue;

        const shouldTrigger = this.checkThreshold(alert, currentPrice);
        if (!shouldTrigger) continue;

        if (this.isInCooldown(alert)) continue;

        // Obtener tokens push del usuario
        const tokens = await this.pushTokensService.findByUserId(alert.user_id);
        if (tokens.length === 0) continue;

        // Enviar notificación
        const { title, body } = this.buildNotificationContent(alert, currentPrice);
        await this.pushNotificationService.sendPushNotifications(tokens, title, body, {
          alertId: alert.id,
          type: alert.type,
          symbol: alert.symbol,
        });

        // Marcar como disparada
        await this.alertsService.markTriggered(alert.id);
        triggered++;
      } catch (e) {
        this.logger.warn(`Error evaluating alert ${alert.id}: ${e instanceof Error ? e.message : e}`);
      }
    }

    this.logger.log(`Evaluation complete: ${alerts.length} evaluated, ${triggered} triggered`);
    return { evaluated: alerts.length, triggered };
  }

  /**
   * Pre-fetch de precios actuales agrupados por tipo para minimizar llamadas.
   */
  private async fetchCurrentPrices(alerts: AlertRow[]): Promise<PriceMap> {
    const map: PriceMap = { ves: null, crypto: {}, forex: {} };

    const needsVes = alerts.some((a) => a.type === 'ves');
    const needsForex = alerts.some((a) => a.type === 'forex');
    const cryptoSymbols = [...new Set(alerts.filter((a) => a.type === 'crypto').map((a) => a.symbol))];

    const promises: Promise<void>[] = [];

    if (needsVes) {
      promises.push(
        this.vesService.getPrice().then((p) => { map.ves = p; }).catch((e) => {
          this.logger.warn(`Failed to fetch VES price: ${e instanceof Error ? e.message : e}`);
        }),
      );
    }

    if (needsForex) {
      promises.push(
        this.forexService.findRate('USD', 'EUR').then((r) => {
          if (r) map.forex['USD_EUR'] = r.rate;
        }).catch((e) => {
          this.logger.warn(`Failed to fetch forex rate: ${e instanceof Error ? e.message : e}`);
        }),
      );
    }

    for (const sym of cryptoSymbols) {
      promises.push(
        this.cryptoService.findPrice(sym, 'USD').then((p) => {
          if (p) map.crypto[sym] = p.price;
        }).catch((e) => {
          this.logger.warn(`Failed to fetch crypto price ${sym}: ${e instanceof Error ? e.message : e}`);
        }),
      );
    }

    await Promise.all(promises);
    return map;
  }

  private resolvePrice(alert: AlertRow, prices: PriceMap): number | null {
    switch (alert.type) {
      case 'ves': {
        if (!prices.ves) return null;
        if (alert.symbol === 'oficial') return prices.ves.oficial;
        if (alert.symbol === 'paralelo') return prices.ves.paralelo;
        return null;
      }
      case 'crypto': {
        return prices.crypto[alert.symbol] ?? null;
      }
      case 'forex': {
        return prices.forex[alert.symbol] ?? null;
      }
      default:
        return null;
    }
  }

  private checkThreshold(alert: AlertRow, currentPrice: number): boolean {
    if (alert.direction === 'above') {
      return currentPrice >= alert.threshold;
    }
    if (alert.direction === 'below') {
      return currentPrice <= alert.threshold;
    }
    return false;
  }

  private isInCooldown(alert: AlertRow): boolean {
    if (!alert.triggered_at) return false;
    const lastTriggered = new Date(alert.triggered_at).getTime();
    return Date.now() - lastTriggered < ALERT_COOLDOWN_MS;
  }

  private buildNotificationContent(alert: AlertRow, currentPrice: number): { title: string; body: string } {
    const directionLabel = alert.direction === 'above' ? 'superó' : 'bajó de';
    const symbolLabel = this.getSymbolLabel(alert);
    const formattedPrice = currentPrice.toLocaleString('es-VE', { maximumFractionDigits: 2 });
    const formattedThreshold = Number(alert.threshold).toLocaleString('es-VE', { maximumFractionDigits: 2 });

    return {
      title: `⚡ Alerta de precio`,
      body: `${symbolLabel} ${directionLabel} ${formattedThreshold}. Precio actual: ${formattedPrice}`,
    };
  }

  private getSymbolLabel(alert: AlertRow): string {
    switch (alert.type) {
      case 'ves':
        return alert.symbol === 'oficial' ? 'Dólar Oficial (BCV)' : 'Dólar Paralelo';
      case 'crypto':
        return alert.symbol;
      case 'forex':
        return alert.symbol.replace('_', '/');
      default:
        return alert.symbol;
    }
  }
}

type PriceMap = {
  ves: { oficial: number; paralelo: number } | null;
  crypto: Record<string, number>;
  forex: Record<string, number>;
};
