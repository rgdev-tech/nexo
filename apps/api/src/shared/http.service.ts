import { Injectable, Logger } from '@nestjs/common';
import { FETCH_TIMEOUT_DEFAULT } from './constants';

export type FetchJsonOptions = {
  /** Timeout en ms. Default: FETCH_TIMEOUT_DEFAULT (5 000) */
  timeout?: number;
  /** Intentos adicionales tras el primero. Default: 0 */
  retries?: number;
  /** ms de espera entre reintentos. Default: 2 000 */
  retryDelay?: number;
  /** Códigos HTTP que permiten reintento. Default: [408, 429, 502, 503, 504] */
  retryableStatuses?: number[];
  /** Etiqueta para los logs (p. ej. "Binance BTCUSDT"). Default: la propia URL */
  label?: string;
  /** HTTP method. Default: "GET" */
  method?: 'GET' | 'POST';
  /** JSON body for POST requests */
  body?: unknown;
};

const DEFAULT_RETRYABLE_STATUSES = [408, 429, 502, 503, 504];

@Injectable()
export class ExternalHttpService {
  private readonly logger = new Logger(ExternalHttpService.name);

  /**
   * Realiza un fetch HTTP, parsea la respuesta como JSON y devuelve el resultado
   * tipado. Soporta timeout, reintentos configurables y logging centralizado.
   *
   * @returns T en caso de éxito, null si falla tras agotar los reintentos.
   */
  async fetchJson<T>(url: string, options?: FetchJsonOptions): Promise<T | null> {
    const {
      timeout = FETCH_TIMEOUT_DEFAULT,
      retries = 0,
      retryDelay = 2_000,
      retryableStatuses = DEFAULT_RETRYABLE_STATUSES,
      label = url,
      method = 'GET',
      body,
    } = options ?? {};

    const maxAttempts = retries + 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        if (attempt > 1) {
          this.logger.log(
            `Retrying ${label} (attempt ${attempt}/${maxAttempts})`,
          );
          await new Promise((r) => setTimeout(r, retryDelay));
        }

        const init: RequestInit = { signal: AbortSignal.timeout(timeout), method };
        if (body != null) {
          init.body = JSON.stringify(body);
          init.headers = { 'Content-Type': 'application/json' };
        }

        const res = await fetch(url, init);

        if (!res.ok) {
          this.logger.warn(`${label}: HTTP ${res.status}`);

          if (retryableStatuses.includes(res.status) && attempt < maxAttempts) {
            continue;
          }
          return null;
        }

        return (await res.json()) as T;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);

        if (attempt < maxAttempts) {
          this.logger.warn(`${label}: ${msg} — will retry`);
          continue;
        }

        this.logger.error(`${label} fetch failed: ${msg}`);
        return null;
      }
    }

    /* istanbul ignore next — unreachable, pero satisface el tipado */
    return null;
  }
}
