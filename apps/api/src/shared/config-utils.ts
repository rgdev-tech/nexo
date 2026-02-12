import { ConfigService } from '@nestjs/config';

/**
 * Obtiene un número desde ConfigService. Las variables de entorno son siempre
 * strings; esta función convierte a number para evitar errores en APIs que
 * esperan número (p. ej. AbortSignal.timeout(ms), cache TTL, port).
 */
export function getConfigNumber(
  config: ConfigService,
  key: string,
  fallback: number,
): number {
  const raw = config.get(key);
  if (raw === undefined || raw === null) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}
