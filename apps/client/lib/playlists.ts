import type { SQLiteDatabase } from "expo-sqlite";
import type { ParsedPlaylist } from "./m3u";

export async function savePlaylist(
  db: SQLiteDatabase,
  name: string,
  sourceUrl: string,
  parsed: ParsedPlaylist
): Promise<number> {
  const result = await db.runAsync(
    "INSERT INTO playlists (name, source_url) VALUES (?, ?)",
    name,
    sourceUrl
  );
  const playlistId = result.lastInsertRowId;
  if (playlistId == null) throw new Error("Failed to insert playlist");

  const groupNames = new Map<string, number>();
  for (const ch of parsed.channels) {
    const groupTitle = ch.groupTitle.trim() || "Sin categoría";
    if (!groupNames.has(groupTitle)) {
      const r = await db.runAsync(
        "INSERT INTO groups (playlist_id, name) VALUES (?, ?)",
        playlistId,
        groupTitle
      );
      if (r.lastInsertRowId != null) groupNames.set(groupTitle, r.lastInsertRowId);
    }
    const groupId = groupNames.get(groupTitle) ?? null;
    await db.runAsync(
      `INSERT INTO channels (playlist_id, group_id, name, url, tvg_id, tvg_name, tvg_logo, position)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      playlistId,
      groupId,
      ch.name,
      ch.url,
      ch.tvgId,
      ch.tvgName,
      ch.tvgLogo,
      parsed.channels.indexOf(ch)
    );
  }
  return playlistId;
}

export async function getPlaylists(db: SQLiteDatabase) {
  return db.getAllAsync<{
    id: number;
    name: string;
    source_url: string;
    created_at: string;
    channel_count: number;
  }>(
    `SELECT p.id, p.name, p.source_url, p.created_at,
            (SELECT COUNT(*) FROM channels c WHERE c.playlist_id = p.id) AS channel_count
     FROM playlists p
     ORDER BY p.created_at DESC`
  );
}

export async function getGroups(db: SQLiteDatabase, playlistId: number) {
  return db.getAllAsync<{ id: number; name: string; channel_count: number }>(
    `SELECT g.id, g.name,
            (SELECT COUNT(*) FROM channels c WHERE c.group_id = g.id) AS channel_count
     FROM groups g
     WHERE g.playlist_id = ?
     ORDER BY g.name`,
    playlistId
  );
}

export async function getChannels(
  db: SQLiteDatabase,
  playlistId: number,
  groupId?: number | null
) {
  if (groupId != null) {
    return db.getAllAsync<{
      id: number;
      name: string;
      url: string;
      tvg_logo: string | null;
      group_name: string;
    }>(
      `SELECT c.id, c.name, c.url, c.tvg_logo, g.name AS group_name
       FROM channels c
       LEFT JOIN groups g ON c.group_id = g.id
       WHERE c.playlist_id = ? AND c.group_id = ?
       ORDER BY c.position, c.id`,
      playlistId,
      groupId
    );
  }
  return db.getAllAsync<{
    id: number;
    name: string;
    url: string;
    tvg_logo: string | null;
    group_name: string | null;
  }>(
    `SELECT c.id, c.name, c.url, c.tvg_logo, g.name AS group_name
     FROM channels c
     LEFT JOIN groups g ON c.group_id = g.id
     WHERE c.playlist_id = ?
     ORDER BY g.name, c.position, c.id`,
    playlistId
  );
}

export async function getPlaylistById(db: SQLiteDatabase, id: number) {
  return db.getFirstAsync<{
    id: number;
    name: string;
    source_url: string;
    created_at: string;
  }>("SELECT id, name, source_url, created_at FROM playlists WHERE id = ?", id);
}

export async function getChannelById(db: SQLiteDatabase, id: number) {
  return db.getFirstAsync<{
    id: number;
    name: string;
    url: string;
    tvg_logo: string | null;
  }>("SELECT id, name, url, tvg_logo FROM channels WHERE id = ?", id);
}
