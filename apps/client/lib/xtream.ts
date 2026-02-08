/**
 * Cliente para servidores Xtream Codes (VOD: películas, series con temporadas/capítulos).
 * API: player_api.php con username/password.
 *
 * En Expo Go (solo HTTPS), define EXPO_PUBLIC_XTREAM_PROXY con la URL de un proxy HTTPS
 * que redirija a la API Xtream (ver proxy-xtream/ en el repo o un Cloudflare Worker).
 */

const XTREAM_PROXY =
  typeof process !== "undefined" && process.env?.EXPO_PUBLIC_XTREAM_PROXY
    ? process.env.EXPO_PUBLIC_XTREAM_PROXY.replace(/\/+$/, "")
    : "";

export interface XtreamServer {
  id: number;
  name: string;
  base_url: string;
  username: string;
  password: string;
}

export interface XtreamVodStream {
  num?: number;
  name: string;
  title?: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  rating?: string;
  rating_5based?: number;
  added?: string;
  category_id?: string;
  category_ids?: number[];
  container_extension?: string;
  custom_sid?: string | null;
  direct_source?: string;
}

export interface XtreamSeries {
  num?: number;
  name: string;
  title?: string;
  series_id: number;
  cover?: string;
  plot?: string;
  cast?: string;
  director?: string;
  genre?: string;
  releaseDate?: string;
  last_modified?: string;
  rating?: string;
  rating_5based?: number;
  category_id?: string;
  category_ids?: number[];
}

export interface XtreamEpisode {
  id: string;
  episode_num: number;
  title: string;
  container_extension: string;
  info?: { plot?: string; movie_image?: string };
  custom_sid?: string | null;
  added?: string;
  season_number?: number; // algunos APIs lo ponen en el objeto
}

export interface XtreamSeriesInfo {
  info: {
    name: string;
    cover?: string;
    plot?: string;
    cast?: string;
    director?: string;
    genre?: string;
    releaseDate?: string;
  };
  episodes: Record<string, XtreamEpisode[]>; // key = "1", "2", ... (temporada)
}

export interface XtreamVodInfo {
  info: {
    name: string;
    movie_image?: string;
    plot?: string;
    cast?: string;
    director?: string;
    genre?: string;
    releaseDate?: string;
    rating?: string;
  };
  movie_data: {
    stream_id: number;
    name: string;
    added?: string;
    category_id?: string;
    container_extension?: string;
  };
  subtitles?: Array<{ url: string; lang: string }>;
}

function ensureNoTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

export function buildApiUrl(
  server: Pick<XtreamServer, "base_url" | "username" | "password">,
  action: string,
  params: Record<string, string | number> = {}
): string {
  const base = ensureNoTrailingSlash(server.base_url);
  const search = new URLSearchParams({
    username: server.username,
    password: server.password,
    action,
    ...Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ),
  });
  return `${base}/player_api.php?${search.toString()}`;
}

async function fetchUrl(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const targetUrl = XTREAM_PROXY ? `${XTREAM_PROXY}?url=${encodeURIComponent(url)}` : url;
  const res = await fetch(targetUrl, {
    headers: { Accept: "application/json" },
    signal: controller.signal,
  });
  clearTimeout(timeout);
  return res;
}

export async function fetchXtreamApi<T>(url: string): Promise<T> {
  try {
    const res = await fetchUrl(url);
    if (!res.ok) throw new Error(`Xtream API: ${res.status}`);
    return (await res.json()) as T;
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    if (err.name === "AbortError") {
      throw new Error("Tiempo de espera agotado. Comprueba la URL y tu conexión.");
    }
    if (
      err.message.includes("Network request failed") ||
      err.message.includes("cleartext") ||
      err.message.includes("SSL") ||
      err.message.includes("mixed content")
    ) {
      throw new Error(
        "No se pudo conectar. Comprueba la URL, usuario, contraseña y tu conexión (Wi‑Fi o datos). " +
          (XTREAM_PROXY ? "Si usas proxy, revisa que esté activo." : "")
      );
    }
    throw err;
  }
}

/** Prueba la conexión y credenciales (player_api sin action devuelve user_info). */
export async function testXtreamConnection(
  server: Pick<XtreamServer, "base_url" | "username" | "password">
): Promise<void> {
  const base = ensureNoTrailingSlash(server.base_url);
  const url = `${base}/player_api.php?username=${encodeURIComponent(server.username)}&password=${encodeURIComponent(server.password)}`;
  const data = await fetchXtreamApi<{ user_info?: { auth?: number } }>(url);
  if (data?.user_info?.auth === 0) throw new Error("Usuario o contraseña incorrectos");
}

/** Lista de películas (VOD) */
export async function getVodStreams(server: XtreamServer): Promise<XtreamVodStream[]> {
  const url = buildApiUrl(server, "get_vod_streams");
  const data = await fetchXtreamApi<{ stream_id: number }[] | XtreamVodStream[]>(url);
  return Array.isArray(data) ? data : [];
}

/** Lista de series */
export async function getSeries(server: XtreamServer): Promise<XtreamSeries[]> {
  const url = buildApiUrl(server, "get_series");
  const data = await fetchXtreamApi<XtreamSeries[]>(url);
  return Array.isArray(data) ? data : [];
}

/** Detalle de una serie: temporadas y episodios */
export async function getSeriesInfo(
  server: XtreamServer,
  seriesId: number
): Promise<XtreamSeriesInfo | null> {
  const url = buildApiUrl(server, "get_series_info", { series_id: seriesId });
  const data = await fetchXtreamApi<XtreamSeriesInfo>(url);
  if (!data?.episodes || typeof data.episodes !== "object") return null;
  return data;
}

/** Info de una película (incluye subtítulos si los hay) */
export async function getVodInfo(
  server: XtreamServer,
  vodId: number
): Promise<XtreamVodInfo | null> {
  const url = buildApiUrl(server, "get_vod_info", { vod_id: vodId });
  try {
    const data = await fetchXtreamApi<XtreamVodInfo>(url);
    return data ?? null;
  } catch {
    return null;
  }
}

function wrapStreamUrlIfProxy(httpUrl: string): string {
  if (XTREAM_PROXY) return `${XTREAM_PROXY}?stream=${encodeURIComponent(httpUrl)}`;
  return httpUrl;
}

/** URL para reproducir una película */
export function getMovieStreamUrl(
  server: XtreamServer,
  streamId: number,
  extension: string = "mp4"
): string {
  const base = ensureNoTrailingSlash(server.base_url);
  const url = `${base}/movie/${server.username}/${server.password}/${streamId}.${extension.replace(/^\./, "")}`;
  return wrapStreamUrlIfProxy(url);
}

/** URL para reproducir un episodio de serie */
export function getEpisodeStreamUrl(
  server: XtreamServer,
  episodeId: string,
  extension: string = "mp4"
): string {
  const base = ensureNoTrailingSlash(server.base_url);
  const url = `${base}/series/${server.username}/${server.password}/${episodeId}.${extension.replace(/^\./, "")}`;
  return wrapStreamUrlIfProxy(url);
}
