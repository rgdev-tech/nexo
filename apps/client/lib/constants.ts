export const LEGAL_URLS = {
  terms: 'https://zonark-portfolio.vercel.app/legal/terminos',
  privacy:
    process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL || 'https://zonark-portfolio.vercel.app/legal/privacidad',
} as const;

/** Tiempo sin pedir Face ID de nuevo para balance (10 min) */
export const BALANCE_LOCK_AFTER_MS = 10 * 60 * 1000;

/** Montos >= esto se interpretan como BS en el convertidor */
export const BS_THRESHOLD = 1000;

/** Intervalo de refresco automático de precios (1 min) */
export const REFRESH_INTERVAL_MS = 60 * 1000;

/** Timeout máximo para fetch de precios */
export const FETCH_TIMEOUT_MS = 20_000;
