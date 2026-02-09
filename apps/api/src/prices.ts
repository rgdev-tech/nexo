/**
 * Rutas del aggregator de precios: crypto + forex.
 * Contrato unificado, cache y rate limit.
 */
import { cacheGet, cacheSet } from "./cache.js";
import { rateLimit } from "./rate-limit.js";
import { getCryptoHistory, getCryptoPrice, getCryptoPrices } from "./providers/crypto.js";
import { getForexHistory, getForexRate } from "./providers/forex.js";
import { getUsdToVes } from "./providers/ves.js";

export type VesHistoryDay = { date: string; oficial: number; paralelo: number; oficial_eur?: number; paralelo_eur?: number };

const CACHE_TTL_MS = 60 * 1000; // 1 min

function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
}

function jsonResponse(data: unknown, init: ResponseInit = {}) {
  return Response.json(data, {
    headers: { "Content-Type": "application/json", ...init.headers },
    ...init,
  });
}

export function createHandlePrices(
  getVesHistory: (days: number) => VesHistoryDay[]
): (req: Request, requestUrl: string) => Promise<Response | null> {
  return async function handlePrices(req: Request, requestUrl: string): Promise<Response | null> {
  const ip = getClientIp(req);
  const rl = rateLimit(ip);
  const rateLimitHeaders = {
    "X-RateLimit-Limit": String(rl.limit),
    "X-RateLimit-Remaining": String(rl.remaining),
    "X-RateLimit-Reset": String(Math.ceil(rl.resetInMs / 1000)),
  };

  if (!rl.ok) {
    return jsonResponse(
      { error: "too_many_requests", message: "Rate limit exceeded" },
      { status: 429, headers: rateLimitHeaders }
    );
  }

  const url = new URL(requestUrl);
  const pathname = url.pathname;
  const prefix = "/api/prices";

  // GET /api/prices/crypto/history?symbol=BTC&days=7&currency=USD (antes que /crypto/:symbol)
  if (pathname === `${prefix}/crypto/history` && req.method === "GET") {
    const symbol = url.searchParams.get("symbol") ?? "BTC";
    const days = Math.min(90, Math.max(1, parseInt(url.searchParams.get("days") ?? "7", 10) || 7));
    const currency = url.searchParams.get("currency") ?? "USD";
    const cacheKey = `crypto:history:${symbol}:${currency}:${days}`;
    const cached = cacheGet<{ history: { date: string; price: number }[] }>(cacheKey);
    if (cached) {
      return jsonResponse(cached, { headers: { ...rateLimitHeaders, "X-Cache": "HIT" } });
    }
    const history = await getCryptoHistory(symbol, currency, days);
    const payload = { history };
    cacheSet(cacheKey, payload, 5 * 60 * 1000);
    return jsonResponse(payload, { headers: { ...rateLimitHeaders, "X-Cache": "MISS" } });
  }

  // GET /api/prices/crypto/:symbol
  const cryptoSymbolMatch = pathname.match(new RegExp(`^${prefix}/crypto/([^/]+)$`));
  if (cryptoSymbolMatch && req.method === "GET") {
    const symbol = decodeURIComponent(cryptoSymbolMatch[1]);
    const currency = url.searchParams.get("currency") ?? "USD";
    const cacheKey = `crypto:${symbol}:${currency}`;
    const cached = cacheGet<{ symbol: string; price: number; currency: string; source: string; timestamp: number; change24h?: number }>(cacheKey);
    if (cached) {
      return jsonResponse(cached, { headers: { ...rateLimitHeaders, "X-Cache": "HIT" } });
    }
    const result = await getCryptoPrice(symbol, currency);
    if (!result) {
      return jsonResponse(
        { error: "not_found", message: `No price for ${symbol}` },
        { status: 404, headers: rateLimitHeaders }
      );
    }
    cacheSet(cacheKey, result, CACHE_TTL_MS);
    return jsonResponse(result, { headers: { ...rateLimitHeaders, "X-Cache": "MISS" } });
  }

  // GET /api/prices/crypto?symbols=BTC,ETH
  if (pathname === `${prefix}/crypto` && req.method === "GET") {
    const symbolsParam = url.searchParams.get("symbols");
    const symbols = symbolsParam ? symbolsParam.split(",").map((s) => s.trim()).filter(Boolean) : ["BTC", "ETH"];
    const currency = url.searchParams.get("currency") ?? "USD";
    const cacheKey = `crypto:${symbols.join(",")}:${currency}`;
    const cached = cacheGet<{ symbol: string; price: number; currency: string; source: string; timestamp: number; change24h?: number }[]>(cacheKey);
    if (cached) {
      return jsonResponse({ prices: cached }, { headers: { ...rateLimitHeaders, "X-Cache": "HIT" } });
    }
    const results = await getCryptoPrices(symbols, currency);
    cacheSet(cacheKey, results, CACHE_TTL_MS);
    return jsonResponse({ prices: results }, { headers: { ...rateLimitHeaders, "X-Cache": "MISS" } });
  }

  // GET /api/prices/ves/history?days=7 — historial por día (oficial y paralelo)
  if (pathname === `${prefix}/ves/history` && req.method === "GET") {
    const days = Math.min(90, Math.max(1, parseInt(url.searchParams.get("days") ?? "7", 10) || 7));
    const history = getVesHistory(days);
    return jsonResponse({ history }, { headers: rateLimitHeaders });
  }

  // GET /api/prices/ves — 1 USD = X BS (oficial y paralelo)
  if (pathname === `${prefix}/ves` && req.method === "GET") {
    const cacheKey = "ves:usd";
    const cached = cacheGet<{
      from: string;
      to: string;
      oficial: number;
      paralelo: number;
      date: string;
      source: string;
      timestamp: number;
    }>(cacheKey);
    if (cached) {
      return jsonResponse(cached, { headers: { ...rateLimitHeaders, "X-Cache": "HIT" } });
    }
    const result = await getUsdToVes();
    if (!result) {
      return jsonResponse(
        { error: "not_found", message: "No se pudo obtener USD → VES" },
        { status: 502, headers: rateLimitHeaders }
      );
    }
    cacheSet(cacheKey, result, CACHE_TTL_MS);
    return jsonResponse(result, { headers: { ...rateLimitHeaders, "X-Cache": "MISS" } });
  }

  // GET /api/prices/forex/history?days=30&from=USD&to=EUR
  if (pathname === `${prefix}/forex/history` && req.method === "GET") {
    const days = Math.min(365, Math.max(1, parseInt(url.searchParams.get("days") ?? "30", 10) || 30));
    const from = url.searchParams.get("from") ?? "USD";
    const to = url.searchParams.get("to") ?? "EUR";
    const cacheKey = `forex:history:${from}:${to}:${days}`;
    const cached = cacheGet<{ history: { date: string; rate: number }[] }>(cacheKey);
    if (cached) {
      return jsonResponse(cached, { headers: { ...rateLimitHeaders, "X-Cache": "HIT" } });
    }
    const history = await getForexHistory(from, to, days);
    const payload = { history };
    cacheSet(cacheKey, payload, 24 * 60 * 60 * 1000); // 24h
    return jsonResponse(payload, { headers: { ...rateLimitHeaders, "X-Cache": "MISS" } });
  }

  // GET /api/prices/forex?from=USD&to=EUR
  if (pathname === `${prefix}/forex` && req.method === "GET") {
    const from = url.searchParams.get("from") ?? "USD";
    const to = url.searchParams.get("to") ?? "EUR";
    const cacheKey = `forex:${from}:${to}`;
    const cached = cacheGet<{ from: string; to: string; rate: number; date: string; source: string; timestamp: number }>(cacheKey);
    if (cached) {
      return jsonResponse(cached, { headers: { ...rateLimitHeaders, "X-Cache": "HIT" } });
    }
    const result = await getForexRate(from, to);
    if (!result) {
      return jsonResponse(
        { error: "not_found", message: `No rate for ${from} → ${to}` },
        { status: 404, headers: rateLimitHeaders }
      );
    }
    cacheSet(cacheKey, result, CACHE_TTL_MS);
    return jsonResponse(result, { headers: { ...rateLimitHeaders, "X-Cache": "MISS" } });
  }

  return null;
  };
}
