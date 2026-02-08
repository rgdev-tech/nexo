/**
 * Providers de precios crypto. Binance primero (rápido, muchos pares), CoinGecko de fallback.
 */

export type CryptoPrice = {
  symbol: string;
  price: number;
  currency: string;
  source: string;
  timestamp: number;
  /** Variación 24h % (Binance); opcional */
  change24h?: number;
};

export type CryptoHistoryDay = { date: string; price: number };

const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
  BNB: "binancecoin",
  SOL: "solana",
  XRP: "ripple",
  USDC: "usd-coin",
  ADA: "cardano",
  DOGE: "dogecoin",
  AVAX: "avalanche-2",
  DOT: "polkadot",
  MATIC: "matic-network",
  LINK: "chainlink",
  UNI: "uniswap",
  ATOM: "cosmos",
  LTC: "litecoin",
  NEAR: "near",
  APT: "aptos",
  ARB: "arbitrum",
  OP: "optimism",
  INJ: "injective-protocol",
  SUI: "sui",
  SEI: "sei-network",
  TIA: "celestia",
};

async function fetchBinance(symbol: string, currency: string): Promise<CryptoPrice | null> {
  const quote = currency === "USD" ? "USDT" : currency;
  const pair = symbol + quote;
  const url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${pair}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) return null;
  const data = (await res.json()) as { lastPrice?: string; priceChangePercent?: string };
  const price = parseFloat(data.lastPrice ?? "");
  if (Number.isNaN(price)) return null;
  const change24h = data.priceChangePercent != null ? parseFloat(data.priceChangePercent) : undefined;
  return {
    symbol,
    price,
    currency: currency === "USDT" ? "USD" : currency,
    source: "binance",
    timestamp: Date.now(),
    ...(Number.isFinite(change24h) && { change24h }),
  };
}

async function fetchCoinGecko(symbol: string, currency: string): Promise<CryptoPrice | null> {
  const id = COINGECKO_IDS[symbol.toUpperCase()];
  if (!id) return null;
  const vs = currency.toLowerCase();
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=${vs}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) return null;
  const data = (await res.json()) as Record<string, Record<string, number>>;
  const price = data[id]?.[vs];
  if (price == null || Number.isNaN(price)) return null;
  return {
    symbol,
    price,
    currency: currency.toUpperCase(),
    source: "coingecko",
    timestamp: Date.now(),
  };
}

/** Obtiene precio crypto: intenta Binance, luego CoinGecko. */
export async function getCryptoPrice(
  symbol: string,
  currency = "USD"
): Promise<CryptoPrice | null> {
  const sym = symbol.toUpperCase();
  const cur = currency.toUpperCase();

  try {
    const fromBinance = await fetchBinance(sym, cur === "USD" ? "USDT" : cur);
    if (fromBinance) return fromBinance;
  } catch {
    // fallback
  }

  try {
    const fromCoinGecko = await fetchCoinGecko(sym, cur);
    if (fromCoinGecko) return fromCoinGecko;
  } catch {
    // nada
  }

  return null;
}

/** Varios símbolos a la vez (en paralelo). */
export async function getCryptoPrices(
  symbols: string[],
  currency = "USD"
): Promise<CryptoPrice[]> {
  const results = await Promise.all(
    symbols.map((s) => getCryptoPrice(s.trim(), currency))
  );
  return results.filter((r): r is CryptoPrice => r != null);
}

/** Historial de precios (CoinGecko). Últimos N días, un punto por día. */
export async function getCryptoHistory(
  symbol: string,
  currency = "USD",
  days = 7
): Promise<CryptoHistoryDay[]> {
  const id = COINGECKO_IDS[symbol.toUpperCase()];
  if (!id) return [];
  const vs = currency.toLowerCase();
  const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=${vs}&days=${Math.min(90, Math.max(1, days))}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return [];
  const data = (await res.json()) as { prices?: [number, number][] };
  const prices = data.prices ?? [];
  const byDay = new Map<string, number>();
  for (const [ts, value] of prices) {
    const date = new Date(ts).toISOString().slice(0, 10);
    byDay.set(date, value);
  }
  return Array.from(byDay.entries())
    .map(([date, price]) => ({ date, price }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
