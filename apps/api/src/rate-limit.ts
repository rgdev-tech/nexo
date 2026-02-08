/**
 * Rate limiter por IP. In-memory, ventana fija.
 * Para no abusar de las APIs externas ni dejar que un cliente nos sature.
 */
const windowMs = 60 * 1000; // 1 minuto
const maxRequestsPerWindow = 60; // 60 req/min por IP

const counts = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(ip: string): { ok: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  let entry = counts.get(ip);

  if (!entry) {
    entry = { count: 0, resetAt: now + windowMs };
    counts.set(ip, entry);
  }

  if (now >= entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }

  entry.count += 1;
  const remaining = Math.max(0, maxRequestsPerWindow - entry.count);
  const resetInMs = Math.max(0, entry.resetAt - now);

  return {
    ok: entry.count <= maxRequestsPerWindow,
    limit: maxRequestsPerWindow,
    remaining,
    resetInMs,
  };
}
