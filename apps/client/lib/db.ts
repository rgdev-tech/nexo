import type { SQLiteDatabase } from "expo-sqlite";

const DATABASE_VERSION = 2;

export async function migrateDb(db: SQLiteDatabase): Promise<void> {
  const { user_version: current } = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version"
  );
  if (current >= DATABASE_VERSION) return;

  if (current < 1) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS playlists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        source_url TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        playlist_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_groups_playlist ON groups(playlist_id);

      CREATE TABLE IF NOT EXISTS channels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        playlist_id INTEGER NOT NULL,
        group_id INTEGER,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        tvg_id TEXT,
        tvg_name TEXT,
        tvg_logo TEXT,
        position INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL
      );
      CREATE INDEX IF NOT EXISTS idx_channels_playlist ON channels(playlist_id);
      CREATE INDEX IF NOT EXISTS idx_channels_group ON channels(group_id);
    `);
  }

  if (current < 2) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS xtream_servers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        base_url TEXT NOT NULL,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
  }

  await db.runAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

export interface PlaylistRow {
  id: number;
  name: string;
  source_url: string;
  created_at: string;
}

export interface GroupRow {
  id: number;
  playlist_id: number;
  name: string;
}

export interface ChannelRow {
  id: number;
  playlist_id: number;
  group_id: number | null;
  name: string;
  url: string;
  tvg_id: string | null;
  tvg_name: string | null;
  tvg_logo: string | null;
  position: number;
  created_at: string;
}
