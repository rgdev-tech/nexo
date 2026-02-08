/**
 * Historial de precios USD → VES (y EUR → BS vía USD/EUR). SQLite, un registro por hora.
 */
import { Database } from "bun:sqlite";
import { getForexRate } from "./providers/forex";
import { getUsdToVes } from "./providers/ves";

const DB_PATH = process.env.VES_DB_PATH ?? "ves.db";
let db: Database | null = null;

function getDb(): Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.exec(`
      CREATE TABLE IF NOT EXISTS ves_history (
        datetime TEXT PRIMARY KEY,
        oficial REAL NOT NULL,
        paralelo REAL NOT NULL,
        usd_eur REAL
      )
    `);
    try {
      db.exec("ALTER TABLE ves_history ADD COLUMN usd_eur REAL");
    } catch {
      // Columna ya existe
    }
  }
  return db;
}

/** Guarda un snapshot (oficial, paralelo, opcional usd_eur) con clave por hora. */
export function saveVesSnapshot(oficial: number, paralelo: number, usd_eur: number | null = null): void {
  const key = new Date().toISOString().slice(0, 13) + ":00:00";
  const database = getDb();
  database.run(
    "INSERT OR REPLACE INTO ves_history (datetime, oficial, paralelo, usd_eur) VALUES (?, ?, ?, ?)",
    [key, oficial, paralelo, usd_eur]
  );
}

export type VesHistoryDay = {
  date: string;
  oficial: number;
  paralelo: number;
  oficial_eur?: number;
  paralelo_eur?: number;
};

/** Devuelve un punto por día (último valor del día) para los últimos N días. */
export function getVesHistory(days: number): VesHistoryDay[] {
  const database = getDb();
  const rows = database
    .query<
      { datetime: string; oficial: number; paralelo: number; usd_eur: number | null },
      [string]
    >(
      "SELECT datetime, oficial, paralelo, usd_eur FROM ves_history WHERE datetime >= datetime('now', ?) ORDER BY datetime ASC"
    )
    .all(`-${days} days`);

  const byDay = new Map<
    string,
    { oficial: number; paralelo: number; usd_eur: number | null }
  >();
  for (const r of rows) {
    const day = r.datetime.slice(0, 10);
    byDay.set(day, {
      oficial: r.oficial,
      paralelo: r.paralelo,
      usd_eur: r.usd_eur ?? null,
    });
  }
  return Array.from(byDay.entries())
    .map(([date, v]) => {
      const day: VesHistoryDay = { date, oficial: v.oficial, paralelo: v.paralelo };
      if (v.usd_eur != null && v.usd_eur > 0) {
        day.oficial_eur = v.oficial / v.usd_eur;
        day.paralelo_eur = v.paralelo / v.usd_eur;
      }
      return day;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Obtiene precios actuales y los persiste (para el job cada hora). */
export async function fetchAndSaveVes(): Promise<void> {
  const data = await getUsdToVes();
  if (!data || (data.oficial <= 0 && data.paralelo <= 0)) return;
  const forex = await getForexRate("USD", "EUR");
  const usd_eur = forex?.rate != null && forex.rate > 0 ? forex.rate : null;
  saveVesSnapshot(data.oficial, data.paralelo, usd_eur);
}

const FRANKFURTER_BASE = "https://api.frankfurter.dev";

/** Rellena usd_eur en registros existentes usando historial de Frankfurter (USD/EUR). */
export async function backfillUsdEurFromFrankfurter(): Promise<void> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90);
  const start = startDate.toISOString().slice(0, 10);
  const url = `${FRANKFURTER_BASE}/v1/${start}..?base=USD&symbols=EUR`;
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) return;
  const data = (await res.json()) as {
    rates?: Record<string, { EUR?: number }>;
  };
  const rates = data.rates;
  if (!rates || typeof rates !== "object") return;
  const database = getDb();
  for (const [date, row] of Object.entries(rates)) {
    const rate = row?.EUR;
    if (rate == null || Number.isNaN(rate) || rate <= 0) continue;
    try {
      database.run("UPDATE ves_history SET usd_eur = ? WHERE datetime LIKE ?", [
        rate,
        `${date}%`,
      ]);
    } catch {
      // ignorar errores por fila
    }
  }
}
