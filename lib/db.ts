import { createClient } from '@libsql/client';
import type { AppState } from './types';

function client() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

const INIT_SQL = `
  CREATE TABLE IF NOT EXISTS state (
    id   TEXT PRIMARY KEY,
    data TEXT NOT NULL
  );
  INSERT OR IGNORE INTO state (id, data)
  VALUES ('main', '{"tiles":[],"folders":[]}');
`;

export async function loadAppState(): Promise<AppState> {
  const db = client();
  await db.executeMultiple(INIT_SQL);
  const res = await db.execute({ sql: `SELECT data FROM state WHERE id = 'main'`, args: [] });
  if (!res.rows[0]) return { tiles: [], folders: [] };
  return JSON.parse(res.rows[0].data as string) as AppState;
}

export async function saveAppState(state: AppState): Promise<void> {
  const db = client();
  await db.executeMultiple(INIT_SQL);
  await db.execute({
    sql: `INSERT OR REPLACE INTO state (id, data) VALUES ('main', ?)`,
    args: [JSON.stringify(state)],
  });
}
