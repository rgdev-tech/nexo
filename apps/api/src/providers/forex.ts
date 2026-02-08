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

export type ForexHistoryDay = { date: string; rate: number };

/** Historial diario from → to (Frankfurter, hasta 1999). */
export async function getForexHistory(
  from: string,
  to: string,
  days: number
): Promise<ForexHistoryDay[]> {
  const f = from.toUpperCase();
  const t = to.toUpperCase();
  if (f === t) return [];
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - Math.min(365, Math.max(1, days)));
  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);
  const url = `${BASE}/v1/${startStr}..${endStr}?base=${f}&symbols=${t}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return [];
  const data = (await res.json()) as { rates?: Record<string, Record<string, number>> };
  const rates = data.rates;
  if (!rates || typeof rates !== "object") return [];
  return Object.entries(rates)
    .map(([date, row]) => {
      const rate = row?.[t];
      return rate != null && !Number.isNaN(rate) ? { date, rate } : null;
    })
    .filter((x): x is ForexHistoryDay => x != null)
    .sort((a, b) => a.date.localeCompare(b.date));
}
