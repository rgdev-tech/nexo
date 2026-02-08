/**
 * Provider de tipos de cambio (forex). Frankfurter (gratis, sin API key).
 * Fallback: mismo endpoint con otro host no hay; podríamos añadir otro proveedor después.
 */

export type ForexRate = {
  from: string;
  to: string;
  rate: number;
  date: string;
  source: string;
  timestamp: number;
};

const BASE = "https://api.frankfurter.dev";

async function fetchFrankfurter(from: string, to: string): Promise<ForexRate | null> {
  const url = `${BASE}/v1/latest?base=${from}&symbols=${to}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    base?: string;
    date?: string;
    rates?: Record<string, number>;
  };
  const rate = data.rates?.[to];
  if (rate == null || Number.isNaN(rate)) return null;
  return {
    from: (data.base ?? from).toUpperCase(),
    to: to.toUpperCase(),
    rate,
    date: data.date ?? new Date().toISOString().slice(0, 10),
    source: "frankfurter",
    timestamp: Date.now(),
  };
}

/** Obtiene tipo de cambio from → to. */
export async function getForexRate(from: string, to: string): Promise<ForexRate | null> {
  const f = from.toUpperCase();
  const t = to.toUpperCase();
  if (f === t) {
    return { from: f, to: t, rate: 1, date: new Date().toISOString().slice(0, 10), source: "identity", timestamp: Date.now() };
  }
  try {
    return await fetchFrankfurter(f, t);
  } catch {
    return null;
  }
}
