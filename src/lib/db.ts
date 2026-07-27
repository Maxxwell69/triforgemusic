import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : undefined,
});

let initialized: Promise<void> | null = null;

function ensureInitialized(): Promise<void> {
  if (!initialized) {
    initialized = pool.query(`
      CREATE TABLE IF NOT EXISTS tracks (
        id TEXT PRIMARY KEY,
        created_at TIMESTAMPTZ NOT NULL,
        owner_role TEXT NOT NULL CHECK (owner_role IN ('staff', 'client')),
        owner_label TEXT NOT NULL,
        title TEXT NOT NULL,
        tags TEXT NOT NULL,
        lyrics TEXT NOT NULL DEFAULT '',
        duration REAL NOT NULL,
        seed BIGINT,
        audio_url TEXT,
        status TEXT NOT NULL CHECK (status IN ('pending', 'complete', 'failed')),
        error TEXT
      )
    `).then(() => undefined);
  }
  return initialized;
}

export type Track = {
  id: string;
  created_at: string;
  owner_role: "staff" | "client";
  owner_label: string;
  title: string;
  tags: string;
  lyrics: string;
  duration: number;
  seed: number | null;
  audio_url: string | null;
  status: "pending" | "complete" | "failed";
  error: string | null;
};

export async function insertTrack(track: Track): Promise<void> {
  await ensureInitialized();
  await pool.query(
    `INSERT INTO tracks (id, created_at, owner_role, owner_label, title, tags, lyrics, duration, seed, audio_url, status, error)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      track.id,
      track.created_at,
      track.owner_role,
      track.owner_label,
      track.title,
      track.tags,
      track.lyrics,
      track.duration,
      track.seed,
      track.audio_url,
      track.status,
      track.error,
    ]
  );
}

export async function updateTrack(id: string, patch: Partial<Track>): Promise<void> {
  await ensureInitialized();
  const fields = Object.keys(patch) as (keyof Track)[];
  if (fields.length === 0) return;
  const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
  const values = fields.map((f) => patch[f] as string | number | null);
  await pool.query(
    `UPDATE tracks SET ${setClause} WHERE id = $${fields.length + 1}`,
    [...values, id]
  );
}

export async function listTracks(limit = 50): Promise<Track[]> {
  await ensureInitialized();
  const result = await pool.query(
    `SELECT * FROM tracks ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );
  return result.rows as Track[];
}

export async function getTrack(id: string): Promise<Track | undefined> {
  await ensureInitialized();
  const result = await pool.query(`SELECT * FROM tracks WHERE id = $1`, [id]);
  return result.rows[0] as Track | undefined;
}

export default pool;
