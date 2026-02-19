import { Injectable, Logger } from '@nestjs/common';
import { ExternalHttpService } from './http.service';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

type ExpoPushMessage = {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  priority?: 'default' | 'normal' | 'high';
};

type ExpoPushTicket = {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: { error?: string };
};

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);

  constructor(private readonly http: ExternalHttpService) {}

  /**
   * Envía notificaciones push a múltiples tokens usando la Expo Push API.
   * Los tokens que fallan se ignoran silenciosamente (logged).
   */
  async sendPushNotifications(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<{ sent: number; failed: number }> {
    if (tokens.length === 0) {
      return { sent: 0, failed: 0 };
    }

    const messages: ExpoPushMessage[] = tokens.map((token) => ({
      to: token,
      title,
      body,
      data,
      sound: 'default' as const,
      priority: 'high' as const,
    }));

    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
        signal: AbortSignal.timeout(10_000),
      });

      if (!response.ok) {
        this.logger.error(`Expo Push API returned ${response.status}`);
        return { sent: 0, failed: tokens.length };
      }

      const result = await response.json() as { data: ExpoPushTicket[] };
      let sent = 0;
      let failed = 0;

      for (const ticket of result.data) {
        if (ticket.status === 'ok') {
          sent++;
        } else {
          failed++;
          this.logger.warn(`Push ticket error: ${ticket.message} (${ticket.details?.error})`);
        }
      }

      this.logger.log(`Push notifications: ${sent} sent, ${failed} failed`);
      return { sent, failed };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.error(`Failed to send push notifications: ${msg}`);
      return { sent: 0, failed: tokens.length };
    }
  }
}
