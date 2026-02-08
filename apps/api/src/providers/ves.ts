/**
 * Precio del dólar (USD) en bolívares (VES). DolarAPI Venezuela, sin API key.
 * 1 USD = X BS (oficial y paralelo).
 */

export type UsdToVes = {
  from: string;
  to: string;
  oficial: number;
  paralelo: number;
  date: string;
  source: string;
  timestamp: number;
};

const DOLARAPI = "https://ve.dolarapi.com/v1/dolares";

async function fetchDolarApi(): Promise<UsdToVes | null> {
  const res = await fetch(DOLARAPI, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  const data = (await res.json()) as Array<{
    nombre?: string;
    promedio?: number;
    fechaActualizacion?: string;
  }>;
  const oficial = data.find((d) => d.nombre?.toLowerCase() === "oficial");
  const paralelo = data.find((d) => d.nombre?.toLowerCase() === "paralelo");
  const rateOficial = oficial?.promedio;
  const rateParalelo = paralelo?.promedio;
  if (rateOficial == null && rateParalelo == null) return null;
  const date =
    oficial?.fechaActualizacion?.slice(0, 10) ??
    paralelo?.fechaActualizacion?.slice(0, 10) ??
    new Date().toISOString().slice(0, 10);
  return {
    from: "USD",
    to: "VES",
    oficial: rateOficial ?? 0,
    paralelo: rateParalelo ?? 0,
    date,
    source: "dolarapi",
    timestamp: Date.now(),
  };
}

/** 1 USD = X BS (oficial y paralelo). */
export async function getUsdToVes(): Promise<UsdToVes | null> {
  try {
    return await fetchDolarApi();
  } catch {
    return null;
  }
}
