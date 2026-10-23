/**
 * Shared seed logic used by the CLI scripts (`seed`, `db:import`, `seed:dump`,
 * `admin:set`). Works with either driver, so you can dump locally from SQLite
 * and import straight into Neon/Postgres.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { all, get, run, NOW } from './db.js';
import { hashPassword } from './security.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const SEED_FILE = resolve(__dirname, '../seed-data.json');

export type SeedPost = {
  title: string;
  slug: string;
  excerpt?: string;
  body_md?: string;
  cover?: string | null;
  published?: boolean | number;
};

export type SeedProject = {
  title: string;
  slug: string;
  client?: string;
  year?: string;
  tags?: string;
  excerpt?: string;
  body_md?: string;
  cover?: string | null;
  link?: string | null;
  order_idx?: number;
};

export type SeedMember = {
  name: string;
  role?: string;
  bio?: string;
  photo?: string | null;
  socials?: Record<string, string>;
  order_idx?: number;
};

export type SeedData = {
  settings?: Record<string, string>;
  posts?: SeedPost[];
  projects?: SeedProject[];
  team?: SeedMember[];
};

export function loadSeed(): SeedData {
  if (!existsSync(SEED_FILE)) return {};
  try {
    return JSON.parse(readFileSync(SEED_FILE, 'utf8')) as SeedData;
  } catch (err) {
    console.error(`Could not parse ${SEED_FILE}:`, err);
    return {};
  }
}

export async function countContent(): Promise<{
  posts: number;
  projects: number;
  team: number;
  settings: number;
}> {
  const num = async (sql: string) => Number((await get<{ c: number }>(sql))?.c ?? 0);
  return {
    posts: await num('SELECT COUNT(*) AS c FROM posts'),
    projects: await num('SELECT COUNT(*) AS c FROM projects'),
    team: await num('SELECT COUNT(*) AS c FROM team'),
    settings: await num('SELECT COUNT(*) AS c FROM settings'),
  };
}

export async function hasContent(): Promise<boolean> {
  const c = await countContent();
  return c.posts + c.projects + c.team + c.settings > 0;
}

export async function ensureAdmin(username: string, password: string): Promise<'created' | 'updated'> {
  const row = await get<{ id: number }>('SELECT id FROM admins WHERE username = ?', username);
  if (row) {
    await run('UPDATE admins SET password_hash = ? WHERE username = ?', hashPassword(password), username);
    return 'updated';
  }
  await run('INSERT INTO admins (username, password_hash) VALUES (?, ?)', username, hashPassword(password));
  return 'created';
}

export async function applySettings(settings: Record<string, string> | undefined): Promise<number> {
  if (!settings) return 0;
  let n = 0;
  for (const [key, value] of Object.entries(settings)) {
    await run(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      key,
      String(value ?? ''),
    );
    n++;
  }
  return n;
}

export async function applyPosts(posts: SeedPost[] | undefined): Promise<number> {
  if (!posts?.length) return 0;
  for (const p of posts) {
    await run(
      `INSERT INTO posts (title, slug, excerpt, body_md, cover, published)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(slug) DO UPDATE SET
         title = excluded.title,
         excerpt = excluded.excerpt,
         body_md = excluded.body_md,
         cover = excluded.cover,
         published = excluded.published,
         updated_at = ${NOW}`,
      p.title,
      p.slug,
      p.excerpt ?? '',
      p.body_md ?? '',
      p.cover ?? null,
      p.published === false ? 0 : 1,
    );
  }
  return posts.length;
}

export async function applyProjects(projects: SeedProject[] | undefined): Promise<number> {
  if (!projects?.length) return 0;
  for (const p of projects) {
    await run(
      `INSERT INTO projects (title, slug, client, year, tags, excerpt, body_md, cover, link, order_idx)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(slug) DO UPDATE SET
         title = excluded.title,
         client = excluded.client,
         year = excluded.year,
         tags = excluded.tags,
         excerpt = excluded.excerpt,
         body_md = excluded.body_md,
         cover = excluded.cover,
         link = excluded.link,
         order_idx = excluded.order_idx,
         updated_at = ${NOW}`,
      p.title,
      p.slug,
      p.client ?? '',
      p.year ?? '',
      p.tags ?? '',
      p.excerpt ?? '',
      p.body_md ?? '',
      p.cover ?? null,
      p.link ?? null,
      p.order_idx ?? 0,
    );
  }
  return projects.length;
}

export async function applyTeam(team: SeedMember[] | undefined): Promise<number> {
  if (!team?.length) return 0;
  for (const m of team) {
    const socials = JSON.stringify(m.socials ?? {});
    const existing = await get<{ id: number }>('SELECT id FROM team WHERE name = ?', m.name);
    if (existing) {
      await run(
        `UPDATE team SET role = ?, bio = ?, photo = ?, socials = ?, order_idx = ? WHERE id = ?`,
        m.role ?? '',
        m.bio ?? '',
        m.photo ?? null,
        socials,
        m.order_idx ?? 0,
        existing.id,
      );
    } else {
      await run(
        `INSERT INTO team (name, role, bio, photo, socials, order_idx) VALUES (?, ?, ?, ?, ?, ?)`,
        m.name,
        m.role ?? '',
        m.bio ?? '',
        m.photo ?? null,
        socials,
        m.order_idx ?? 0,
      );
    }
  }
  return team.length;
}

export async function resetContent(): Promise<void> {
  await run('DELETE FROM posts');
  await run('DELETE FROM projects');
  await run('DELETE FROM team');
}

export async function applySeed(seed: SeedData): Promise<{
  settings: number;
  posts: number;
  projects: number;
  team: number;
}> {
  return {
    settings: await applySettings(seed.settings),
    posts: await applyPosts(seed.posts),
    projects: await applyProjects(seed.projects),
    team: await applyTeam(seed.team),
  };
}

function parseSocials(raw: string): Record<string, string> {
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

/** Exports the current database content to `seed-data.json`. */
export async function dumpSeed(): Promise<SeedData> {
  const rows = await all<{ key: string; value: string }>('SELECT key, value FROM settings ORDER BY key');
  const settings: Record<string, string> = {};
  for (const row of rows) settings[row.key] = row.value;

  const posts = (
    await all<any>(
      `SELECT title, slug, excerpt, body_md, cover, published
       FROM posts ORDER BY created_at ASC, id ASC`,
    )
  ).map((p) => ({
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    body_md: p.body_md,
    cover: p.cover,
    published: Boolean(p.published),
  }));

  const projects = (
    await all<any>(
      `SELECT title, slug, client, year, tags, excerpt, body_md, cover, link, order_idx
       FROM projects ORDER BY order_idx ASC, id ASC`,
    )
  ).map((p) => ({
    title: p.title,
    slug: p.slug,
    client: p.client,
    year: p.year,
    tags: p.tags,
    excerpt: p.excerpt,
    body_md: p.body_md,
    cover: p.cover,
    link: p.link,
    order_idx: p.order_idx,
  }));

  const team = (
    await all<any>(
      `SELECT name, role, bio, photo, socials, order_idx
       FROM team ORDER BY order_idx ASC, id ASC`,
    )
  ).map((m) => ({
    name: m.name,
    role: m.role,
    bio: m.bio,
    photo: m.photo,
    socials: parseSocials(m.socials ?? '{}'),
    order_idx: m.order_idx,
  }));

  const data: SeedData = { settings, posts, projects, team };
  writeFileSync(SEED_FILE, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  return data;
}
