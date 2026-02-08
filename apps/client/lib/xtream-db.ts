import type { SQLiteDatabase } from "expo-sqlite";
import type { XtreamServer } from "./xtream";

export async function getXtreamServers(db: SQLiteDatabase): Promise<XtreamServer[]> {
  return db.getAllAsync<XtreamServer>(
    "SELECT id, name, base_url, username, password FROM xtream_servers ORDER BY created_at DESC"
  );
}

export async function getXtreamServerById(
  db: SQLiteDatabase,
  id: number
): Promise<XtreamServer | null> {
  return db.getFirstAsync<XtreamServer>(
    "SELECT id, name, base_url, username, password FROM xtream_servers WHERE id = ?",
    id
  );
}

export async function addXtreamServer(
  db: SQLiteDatabase,
  name: string,
  baseUrl: string,
  username: string,
  password: string
): Promise<number> {
  const base = baseUrl.replace(/\/+$/, "");
  const result = await db.runAsync(
    "INSERT INTO xtream_servers (name, base_url, username, password) VALUES (?, ?, ?, ?)",
    name,
    base,
    username,
    password
  );
  const id = result.lastInsertRowId;
  if (id == null) throw new Error("No se pudo guardar el servidor");
  return id;
}

export async function deleteXtreamServer(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync("DELETE FROM xtream_servers WHERE id = ?", id);
}
