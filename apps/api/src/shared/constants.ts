/**
 * Valores por defecto centralizados para URLs, timeouts, TTLs y configuración del servidor.
 * Cada valor puede ser sobreescrito mediante variables de entorno vía ConfigService.
 */

// ─── URLs base de terceros ──────────────────────────────────────────────────

export const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
export const BINANCE_BASE_URL = 'https://api.binance.com/api/v3';
export const FRANKFURTER_BASE_URL = 'https://api.frankfurter.dev';
export const DOLARAPI_BASE_URL = 'https://ve.dolarapi.com/v1/dolares';

// ─── Timeouts de fetch (ms) ─────────────────────────────────────────────────

/** Timeout general por defecto para peticiones cortas */
export const FETCH_TIMEOUT_DEFAULT = 5_000;

/** Timeout medio (forex history, dolarapi) */
export const FETCH_TIMEOUT_MEDIUM = 10_000;

/** Timeout largo (backfill, peticiones pesadas) */
export const FETCH_TIMEOUT_LONG = 15_000;

/** CoinGecko history: peticiones cortas (< 30 días) */
export const FETCH_TIMEOUT_COINGECKO_SHORT = 12_000;

/** CoinGecko history: peticiones largas (>= 30 días) */
export const FETCH_TIMEOUT_COINGECKO_LONG = 25_000;

/** DolarAPI fetch timeout */
export const FETCH_TIMEOUT_DOLARAPI = 8_000;

// ─── TTLs de cache (ms) ─────────────────────────────────────────────────────

/** TTL por defecto del CacheModule global */
export const CACHE_TTL_DEFAULT = 60_000; // 1 min

/** TTL para precios crypto (datos altamente volátiles) — 1 min */
export const CACHE_TTL_CRYPTO_PRICE = 60_000;

/** TTL para historial crypto — 10 min */
export const CACHE_TTL_CRYPTO_HISTORY = 10 * 60_000;

/** TTL para precios forex (fuentes actualizan cada ~15 min) — 5 min */
export const CACHE_TTL_FOREX_PRICE = 5 * 60_000;

/** TTL para historial forex — 24 h */
export const CACHE_TTL_FOREX_HISTORY = 24 * 3600_000;

/** TTL para precios VES (BCV publica 1x/día, paralelo pocas veces) — 15 min */
export const CACHE_TTL_VES_PRICE = 15 * 60_000;

/** TTL para historial VES — 30 min */
export const CACHE_TTL_VES_HISTORY = 30 * 60_000;

// ─── Throttler ──────────────────────────────────────────────────────────────

export const THROTTLE_TTL_MS = 60_000;
export const THROTTLE_LIMIT = 60;

// ─── Servidor ───────────────────────────────────────────────────────────────

export const PORT_DEFAULT = 3000;
export const HOST_DEFAULT = '0.0.0.0';

// ─── VES background job ─────────────────────────────────────────────────────

export const VES_SNAPSHOT_INTERVAL_MS = 60 * 60 * 1_000; // 1 h

// ─── Validación ─────────────────────────────────────────────────────────────

/** Monedas fiat permitidas en la API */
export const ALLOWED_CURRENCIES = ['USD', 'EUR', 'GBP', 'VES'] as const;
export type AllowedCurrency = (typeof ALLOWED_CURRENCIES)[number];

/** Rangos de días para historial */
export const DAYS_MIN = 1;
export const DAYS_MAX_CRYPTO = 90;
export const DAYS_MAX_FOREX = 365;
export const DAYS_MAX_VES = 90;
