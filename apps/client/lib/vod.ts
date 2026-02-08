/**
 * Clasifica un canal por su group_name en: películas, series o en vivo.
 * Usado para el hub unificado (estilo Apple).
 */

const MOVIE_KEYWORDS = [
  "movie",
  "movies",
  "vod",
  "pelis",
  "películas",
  "peliculas",
  "cine",
  "films",
  "film",
  "peli",
];

const SERIES_KEYWORDS = [
  "series",
  "serie",
  "shows",
  "show",
  "tv show",
  "tv series",
];

export type ChannelType = "movies" | "series" | "live";

export function getChannelType(groupName: string | null): ChannelType {
  const g = (groupName ?? "").toLowerCase().trim();
  if (MOVIE_KEYWORDS.some((k) => g.includes(k))) return "movies";
  if (SERIES_KEYWORDS.some((k) => g.includes(k))) return "series";
  return "live";
}
