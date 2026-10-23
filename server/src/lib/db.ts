import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '../../data');
mkdirSync(DATA_DIR, { recursive: true });

export const DB_PATH = resolve(DATA_DIR, 'app.db');

export const db = new DatabaseSync(DB_PATH);

// Hardening pragmas — durability + concurrency safety.
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA synchronous = NORMAL;');
db.exec('PRAGMA wal_autocheckpoint = 1000;');

let migrated = false;

/**
 * Runs schema migrations. All statements are static strings (no user input),
 * which combined with parameterised queries below removes any SQL-injection
 * surface: user supplied values are never concatenated into SQL.
 */
function migrate() {
  if (migrated) return;
  migrated = true;

  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS posts (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT NOT NULL,
      slug        TEXT NOT NULL UNIQUE,
      excerpt     TEXT NOT NULL DEFAULT '',
      body_md     TEXT NOT NULL DEFAULT '',
      cover       TEXT,
      published   INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
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
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS team (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      role       TEXT NOT NULL DEFAULT '',
      bio        TEXT NOT NULL DEFAULT '',
      photo      TEXT,
      socials    TEXT NOT NULL DEFAULT '{}',
      order_idx  INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      name              TEXT NOT NULL,
      email             TEXT NOT NULL,
      content           TEXT NOT NULL,
      content_en        TEXT,
      content_ru        TEXT,
      created_at        TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token      TEXT PRIMARY KEY,
      admin_id   INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL,
      FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
    );
  `);
}

migrate();

/** Parameterised query helper — values are always bound, never interpolated. */
export function all<T = any>(sql: string, ...params: any[]): T[] {
  return db.prepare(sql).all(...params) as T[];
}

export function get<T = any>(sql: string, ...params: any[]): T | undefined {
  return db.prepare(sql).get(...params) as T | undefined;
}

export function run(sql: string, ...params: any[]) {
  return db.prepare(sql).run(...params);
}
