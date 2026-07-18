import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('master','member')),
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS boards (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      background TEXT,
      owner_id TEXT,
      visibility TEXT NOT NULL DEFAULT 'shared',
      position INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lists (
      id TEXT PRIMARY KEY,
      board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      color TEXT,
      position INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      list_id TEXT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      labels TEXT NOT NULL DEFAULT '[]',
      due TEXT,
      start_date TEXT,
      location TEXT,
      checklist TEXT NOT NULL DEFAULT '[]',
      member_ids TEXT NOT NULL DEFAULT '[]',
      completed INTEGER NOT NULL DEFAULT 0,
      urgent INTEGER NOT NULL DEFAULT 0,
      important INTEGER NOT NULL DEFAULT 0,
      position INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS minutes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      author_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      attendee_ids TEXT NOT NULL DEFAULT '[]',
      agenda TEXT NOT NULL DEFAULT '',
      decisions TEXT NOT NULL DEFAULT '',
      action_items TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL
    );

    ALTER TABLE cards ADD COLUMN IF NOT EXISTS completed INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE cards ADD COLUMN IF NOT EXISTS start_date TEXT;
    ALTER TABLE cards ADD COLUMN IF NOT EXISTS location TEXT;
    ALTER TABLE boards ADD COLUMN IF NOT EXISTS background TEXT;
    ALTER TABLE boards ADD COLUMN IF NOT EXISTS owner_id TEXT;
    ALTER TABLE boards ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'shared';
    ALTER TABLE lists ADD COLUMN IF NOT EXISTS color TEXT;
    ALTER TABLE cards ADD COLUMN IF NOT EXISTS urgent INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE cards ADD COLUMN IF NOT EXISTS important INTEGER NOT NULL DEFAULT 0;
  `);
}
