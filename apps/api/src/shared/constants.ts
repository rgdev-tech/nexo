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

/** TTL para precios individuales (crypto, forex, ves) */
export const CACHE_TTL_PRICE = 60_000; // 1 min

/** TTL para historial de precios (crypto) — 5 min */
export const CACHE_TTL_HISTORY_SHORT = 5 * 60 * 1_000;

/** TTL para historial largo (forex) — 24 h */
export const CACHE_TTL_HISTORY_LONG = 24 * 60 * 60 * 1_000;

// ─── Throttler ──────────────────────────────────────────────────────────────

export const THROTTLE_TTL_MS = 60_000;
export const THROTTLE_LIMIT = 60;

// ─── Servidor ───────────────────────────────────────────────────────────────

export const PORT_DEFAULT = 3000;
export const HOST_DEFAULT = '0.0.0.0';

// ─── VES background job ─────────────────────────────────────────────────────

export const VES_SNAPSHOT_INTERVAL_MS = 60 * 60 * 1_000; // 1 h
