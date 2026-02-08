/**
 * Listas M3U públicas de ejemplo (canales, películas por género, etc.).
 * El usuario puede añadirlas con un toque. No son VOD con temporadas/capítulos.
 */

export type SuggestedPlaylist = {
  id: string;
  name: string;
  url: string;
  description: string;
};

export const SUGGESTED_PLAYLISTS: SuggestedPlaylist[] = [
  {
    id: "iptv-org-index",
    name: "IPTV-org (canales)",
    url: "https://iptv-org.github.io/iptv/index.m3u",
    description: "Canales de todo el mundo",
  },
  {
    id: "iptv-org-us",
    name: "IPTV-org USA",
    url: "https://iptv-org.github.io/iptv/countries/us.m3u",
    description: "Canales Estados Unidos",
  },
  {
    id: "iptv-org-uk",
    name: "IPTV-org UK",
    url: "https://iptv-org.github.io/iptv/countries/uk.m3u",
    description: "Canales Reino Unido",
  },
  {
    id: "iptv-org-es",
    name: "IPTV-org España",
    url: "https://iptv-org.github.io/iptv/countries/es.m3u",
    description: "Canales España",
  },
  {
    id: "iptv-org-mx",
    name: "IPTV-org México",
    url: "https://iptv-org.github.io/iptv/countries/mx.m3u",
    description: "Canales México",
  },
  {
    id: "iptv-org-ar",
    name: "IPTV-org Argentina",
    url: "https://iptv-org.github.io/iptv/countries/ar.m3u",
    description: "Canales Argentina",
  },
  {
    id: "iptv-org-spa",
    name: "IPTV-org Español",
    url: "https://iptv-org.github.io/iptv/languages/spa.m3u",
    description: "Canales en español",
  },
  {
    id: "iptv-org-movies",
    name: "IPTV-org Movies",
    url: "https://iptv-org.github.io/iptv/categories/movies.m3u",
    description: "Categoría películas",
  },
  {
    id: "tmdb-trending-series",
    name: "Series en tendencia",
    url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/trending-series.m3u",
    description: "Lista pública de series",
  },
  {
    id: "tmdb-top-movies",
    name: "Top películas",
    url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/top-movies.m3u",
    description: "Lista pública de películas",
  },
  {
    id: "tmdb-comedy",
    name: "Películas comedia",
    url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/comedy-movies.m3u",
    description: "Comedia",
  },
  {
    id: "tmdb-action",
    name: "Películas acción",
    url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/action-movies.m3u",
    description: "Acción",
  },
  {
    id: "tmdb-drama",
    name: "Películas drama",
    url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/drama-movies.m3u",
    description: "Drama",
  },
];
