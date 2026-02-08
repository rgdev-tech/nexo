/**
 * Cache in-memory con TTL (time-to-live).
 * Para no golpear las APIs externas en cada request.
 */
const store = new Map<string, { value: unknown; expiresAt: number }>();

const defaultTtlMs = 60 * 1000; // 1 minuto

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value as T;
}

export function cacheSet<T>(key: string, value: T, ttlMs = defaultTtlMs): void {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

export function cacheDelete(key: string): void {
  store.delete(key);
}
