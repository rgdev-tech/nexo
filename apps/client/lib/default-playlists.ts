import type { SQLiteDatabase } from "expo-sqlite";
import { fetchAndParseM3U } from "@/lib/m3u";
import { savePlaylist } from "@/lib/playlists";

const DEFAULT_MOVIES = [
  {
    name: "Top películas",
    url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/top-movies.m3u",
  },
  {
    name: "Películas comedia",
    url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/comedy-movies.m3u",
  },
  {
    name: "Películas acción",
    url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/action-movies.m3u",
  },
  {
    name: "Películas drama",
    url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/drama-movies.m3u",
  },
  {
    name: "IPTV-org Movies",
    url: "https://iptv-org.github.io/iptv/categories/movies.m3u",
  },
];

const DEFAULT_SERIES = [
  {
    name: "Series en tendencia",
    url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/trending-series.m3u",
  },
];

/**
 * Añade listas públicas de películas y series para que aparezcan en las pestañas.
 * Agrupa como "Movies" y "Series" para que se clasifiquen bien.
 */
export async function addDefaultPlaylists(db: SQLiteDatabase): Promise<{ added: number; errors: string[] }> {
  const errors: string[] = [];
  let added = 0;

  for (const item of DEFAULT_MOVIES) {
    try {
      const parsed = await fetchAndParseM3U(item.url);
      if (parsed.channels.length > 0) {
        await savePlaylist(db, item.name, item.url, parsed, "Movies");
        added += 1;
      }
    } catch (e) {
      errors.push(`${item.name}: ${e instanceof Error ? e.message : "Error"}`);
    }
  }

  for (const item of DEFAULT_SERIES) {
    try {
      const parsed = await fetchAndParseM3U(item.url);
      if (parsed.channels.length > 0) {
        await savePlaylist(db, item.name, item.url, parsed, "Series");
        added += 1;
      }
    } catch (e) {
      errors.push(`${item.name}: ${e instanceof Error ? e.message : "Error"}`);
    }
  }

  return { added, errors };
}
