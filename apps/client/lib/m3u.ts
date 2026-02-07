// iptv-playlist-parser exports default { parse }
import parser from "iptv-playlist-parser";

export interface ParsedChannel {
  name: string;
  url: string;
  groupTitle: string;
  tvgId: string | null;
  tvgName: string | null;
  tvgLogo: string | null;
}

export interface ParsedPlaylist {
  channels: ParsedChannel[];
}

/**
 * Parsea contenido M3U (string) y devuelve canales normalizados.
 */
export function parseM3U(content: string): ParsedPlaylist {
  const result = parser.parse(content);
  const channels: ParsedChannel[] = (result.items ?? []).map((item, index) => ({
    name: item.name ?? `Canal ${index + 1}`,
    url: item.url ?? "",
    groupTitle: item.group?.title ?? "",
    tvgId: item.tvg?.id ?? null,
    tvgName: item.tvg?.name ?? null,
    tvgLogo: item.tvg?.logo ?? null,
  }));
  return { channels };
}

/**
 * Descarga una lista M3U desde una URL y la parsea.
 */
export async function fetchAndParseM3U(url: string): Promise<ParsedPlaylist> {
  const res = await fetch(url, {
    headers: { Accept: "application/vnd.apple.mpegurl, text/plain, */*" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  const text = await res.text();
  return parseM3U(text);
}
