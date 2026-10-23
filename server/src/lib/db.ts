/**
 * Database layer with two interchangeable drivers:
 *
 *  • PostgreSQL (Neon) when `DATABASE_URL` is set — used on Vercel and any
 *    hosted setup. Talks over HTTPS via `@neondatabase/serverless`, so it works
 *    from serverless functions without a connection pool.
 *  • SQLite (`node:sqlite`) otherwise — zero-dependency local development, the
 *    file lives in `server/data/app.db`, exactly like before.
 *
 * All helpers are async so routes don't care which driver is active. SQL is
 * written once: `?` placeholders are rewritten to `$1, $2…` for Postgres, and
 * the current-timestamp expression comes from `NOW`.
 */

export const DATABASE_URL = process.env.DATABASE_URL ?? '';
export const USING_PG = /^postgres(ql)?:\/\//i.test(DATABASE_URL);

// On serverless hosting the filesystem is read-only, so a database URL is not
// optional there — fail loudly instead of silently writing to /tmp.
if (!USING_PG && (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)) {
  throw new Error(
    'DATABASE_URL is missing. On Vercel set it to your Neon connection string (Project → Settings → Environment Variables).',
  );
}

/** Portable "current timestamp as text" expression (YYYY-MM-DD HH:MM:SS). */
export const NOW = USING_PG
  ? `to_char(now(), 'YYYY-MM-DD HH24:MI:SS')`
  : `datetime('now')`;

/* -------------------------------------------------------------------------- */
/*  PostgreSQL (Neon)                                                          */
/* -------------------------------------------------------------------------- */

type PgSql = {
  query: (text: string, params?: unknown[]) => Promise<{ rows: any[]; rowCount: number | null }>;
};

let pg: PgSql | null = null;

async function pgClient(): Promise<PgSql> {
  if (pg) return pg;
  const { neon } = await import('@neondatabase/serverless');
  const sql = neon(DATABASE_URL, { fullResults: true }) as unknown as (strings: any, ...v: any[]) => any;
  pg = {
    query: async (text, params = []) => {
      const res = await (sql as any).query(text, params);
      return { rows: res.rows ?? [], rowCount: res.rowCount ?? res.rows?.length ?? 0 };
    },
  };
  return pg;
}

/** Rewrites `?` placeholders into `$1, $2, …` (no literals in our SQL use `?`). */
function toPgPlaceholders(sql: string): string {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

/* -------------------------------------------------------------------------- */
/*  SQLite (local development)                                                 */
/* -------------------------------------------------------------------------- */

type SqliteDb = {
  prepare: (sql: string) => {
    all: (...params: any[]) => any[];
    get: (...params: any[]) => any;
    run: (...params: any[]) => { changes?: number };
  };
  exec: (sql: string) => void;
};

let sqlite: SqliteDb | null = null;
let sqliteClose: (() => void) | null = null;

async function sqliteClient(): Promise<SqliteDb> {
  if (sqlite) return sqlite;
  const { DatabaseSync } = await import('node:sqlite');
  const { mkdirSync } = await import('node:fs');
  const { resolve } = await import('node:path');
  const { MODULE_DIR } = await import('./paths.js');

  const dataDir = process.env.DATA_DIR
    ? resolve(process.env.DATA_DIR)
    : resolve(MODULE_DIR, '../../data');
  mkdirSync(dataDir, { recursive: true });

  const db = new DatabaseSync(resolve(dataDir, 'app.db')) as unknown as SqliteDb & { close: () => void };
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  sqlite = db;
  sqliteClose = () => db.close();
  return db;
}

/* -------------------------------------------------------------------------- */
/*  Minimal cross-driver helpers                                               */
/* -------------------------------------------------------------------------- */

/** Bind helper that also normalises JS booleans for both drivers. */
function normalise(params: any[]): any[] {
  return params.map((p) => (typeof p === 'boolean' ? (p ? 1 : 0) : p));
}

export async function all<T = any>(sql: string, ...params: any[]): Promise<T[]> {
  await migrate();
  if (USING_PG) {
    const client = await pgClient();
    const res = await client.query(toPgPlaceholders(sql), normalise(params));
    return res.rows as T[];
  }
  const db = await sqliteClient();
  return db.prepare(sql).all(...normalise(params)) as T[];
}

export async function get<T = any>(sql: string, ...params: any[]): Promise<T | undefined> {
  const rows = await all<T>(sql, ...params);
  return rows[0];
}

export async function run(sql: string, ...params: any[]): Promise<{ rowCount: number }> {
  await migrate();
  if (USING_PG) {
    const client = await pgClient();
    const res = await client.query(toPgPlaceholders(sql), normalise(params));
    return { rowCount: res.rowCount ?? 0 };
  }
  const db = await sqliteClient();
  const info = db.prepare(sql).run(...normalise(params));
  return { rowCount: info.changes ?? 0 };
}

/* -------------------------------------------------------------------------- */
/*  Schema                                                                     */
/* -------------------------------------------------------------------------- */

const SCHEMA_SQLITE = `
  CREATE TABLE IF NOT EXISTS admins (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS posts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    excerpt     TEXT NOT NULL DEFAULT '',
    body_md     TEXT NOT NULL DEFAULT '',
    cover       TEXT,
    published   INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    client      TEXT NOT NULL DEFAULT '',
    year        TEXT NOT NULL DEFAULT '',
    tags        TEXT NOT NULL DEFAULT '',
    excerpt     TEXT NOT NULL DEFAULT '',
    body_md     TEXT NOT NULL DEFAULT '',
    cover       TEXT,
    link        TEXT,
    order_idx   INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS team (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    role       TEXT NOT NULL DEFAULT '',
    bio        TEXT NOT NULL DEFAULT '',
    photo      TEXT,
    socials    TEXT NOT NULL DEFAULT '{}',
    order_idx  INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    content    TEXT NOT NULL,
    content_en TEXT,
    content_ru TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token      TEXT PRIMARY KEY,
    admin_id   INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TEXT NOT NULL
  );
`;

const SCHEMA_PG = `
  CREATE TABLE IF NOT EXISTS admins (
    id            SERIAL PRIMARY KEY,
    username      TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT ${NOW}
  );

  CREATE TABLE IF NOT EXISTS posts (
    id          SERIAL PRIMARY KEY,
    title       TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    excerpt     TEXT NOT NULL DEFAULT '',
    body_md     TEXT NOT NULL DEFAULT '',
    cover       TEXT,
    published   INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT NOT NULL DEFAULT ${NOW},
    updated_at  TEXT NOT NULL DEFAULT ${NOW}
  );

  CREATE TABLE IF NOT EXISTS projects (
    id          SERIAL PRIMARY KEY,
    title       TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    client      TEXT NOT NULL DEFAULT '',
    year        TEXT NOT NULL DEFAULT '',
    tags        TEXT NOT NULL DEFAULT '',
    excerpt     TEXT NOT NULL DEFAULT '',
    body_md     TEXT NOT NULL DEFAULT '',
    cover       TEXT,
    link        TEXT,
    order_idx   INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT ${NOW},
    updated_at  TEXT NOT NULL DEFAULT ${NOW}
  );

  CREATE TABLE IF NOT EXISTS team (
    id         SERIAL PRIMARY KEY,
    name       TEXT NOT NULL,
    role       TEXT NOT NULL DEFAULT '',
    bio        TEXT NOT NULL DEFAULT '',
    photo      TEXT,
    socials    TEXT NOT NULL DEFAULT '{}',
    order_idx  INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT ${NOW}
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id         SERIAL PRIMARY KEY,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    content    TEXT NOT NULL,
    content_en TEXT,
    content_ru TEXT,
    created_at TEXT NOT NULL DEFAULT ${NOW}
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token      TEXT PRIMARY KEY,
    admin_id   INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT ${NOW},
    expires_at TEXT NOT NULL
  );
`;

let migration: Promise<void> | null = null;

/** Creates missing tables. Safe and cheap to call on every cold start. */
export function migrate(): Promise<void> {
  if (!migration) {
    migration = (async () => {
      if (USING_PG) {
        const client = await pgClient();
        await client.query(SCHEMA_PG);
        return;
      }
      const db = await sqliteClient();
      db.exec(SCHEMA_SQLITE);
    })().catch((err) => {
      migration = null;
      throw err;
    });
  }
  return migration;
}

/** Closes the local SQLite handle (no-op for Postgres). Used by CLI scripts. */
export async function closeDb(): Promise<void> {
  try {
    sqliteClose?.();
  } catch {
    /* ignore */
  }
  sqlite = null;
  sqliteClose = null;
}
