/**
 * One-shot seed. Source of truth is `seed-data.json` (next to this file) —
 * regenerate it from your local database with `npm run seed:dump`.
 *
 * - settings are upserted (the file wins)
 * - posts / projects are upserted by slug, team members by name
 * - `SEED_RESET=1 npm run seed` wipes content tables first (a clean import)
 * - admins are never stored in the file: they come from ADMIN_USER/ADMIN_PASSWORD
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { all, db, get, run } from './lib/db.js';
import { hashPassword } from './lib/security.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_FILE = resolve(__dirname, 'seed-data.json');

const ADMIN_USER = process.env.ADMIN_USER ?? 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD ?? 'admin12345';
const RESET = /^(1|true|yes)$/i.test(process.env.SEED_RESET ?? '');
const FORCE = /^(1|true|yes)$/i.test(process.env.SEED_FORCE ?? '');

type SeedPost = {
  title: string;
  slug: string;
  excerpt?: string;
  body_md?: string;
  cover?: string | null;
  published?: boolean | number;
};

type SeedProject = {
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

type SeedMember = {
  name: string;
  role?: string;
  bio?: string;
  photo?: string | null;
  socials?: Record<string, string>;
  order_idx?: number;
};

type SeedData = {
  settings?: Record<string, string>;
  posts?: SeedPost[];
  projects?: SeedProject[];
  team?: SeedMember[];
};

function loadSeed(): SeedData {
  if (!existsSync(SEED_FILE)) return {};
  try {
    return JSON.parse(readFileSync(SEED_FILE, 'utf8')) as SeedData;
  } catch (err) {
    console.error(`Could not parse ${SEED_FILE}:`, err);
    return {};
  }
}

function ensureAdmin() {
  const row = get('SELECT id FROM admins WHERE username = ?', ADMIN_USER);
  if (row) {
    run('UPDATE admins SET password_hash = ? WHERE username = ?', hashPassword(ADMIN_PASS), ADMIN_USER);
    console.log(`Admin "${ADMIN_USER}" password refreshed.`);
  } else {
    run('INSERT INTO admins (username, password_hash) VALUES (?, ?)', ADMIN_USER, hashPassword(ADMIN_PASS));
    console.log(`Admin "${ADMIN_USER}" created.`);
  }
}

function applySettings(settings: Record<string, string> | undefined) {
  if (!settings) return 0;
  let n = 0;
  for (const [key, value] of Object.entries(settings)) {
    run(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      key,
      String(value ?? ''),
    );
    n++;
  }
  return n;
}

function applyPosts(posts: SeedPost[] | undefined) {
  if (!posts?.length) return 0;
  for (const p of posts) {
    run(
      `INSERT INTO posts (title, slug, excerpt, body_md, cover, published)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(slug) DO UPDATE SET
         title = excluded.title,
         excerpt = excluded.excerpt,
         body_md = excluded.body_md,
         cover = excluded.cover,
         published = excluded.published,
         updated_at = datetime('now')`,
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

function applyProjects(projects: SeedProject[] | undefined) {
  if (!projects?.length) return 0;
  for (const p of projects) {
    run(
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
         updated_at = datetime('now')`,
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

function applyTeam(team: SeedMember[] | undefined) {
  if (!team?.length) return 0;
  for (const m of team) {
    const socials = JSON.stringify(m.socials ?? {});
    const existing = get('SELECT id FROM team WHERE name = ?', m.name);
    if (existing) {
      run(
        `UPDATE team SET role = ?, bio = ?, photo = ?, socials = ?, order_idx = ? WHERE id = ?`,
        m.role ?? '',
        m.bio ?? '',
        m.photo ?? null,
        socials,
        m.order_idx ?? 0,
        existing.id,
      );
    } else {
      run(
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

function resetContent() {
  run('DELETE FROM posts');
  run('DELETE FROM projects');
  run('DELETE FROM team');
  console.log('Content tables cleared (SEED_RESET=1).');
}

/** True when the database already holds content (i.e. it is not a fresh install). */
function hasContent() {
  const posts = get<{ c: number }>('SELECT COUNT(*) c FROM posts')!.c;
  const projects = get<{ c: number }>('SELECT COUNT(*) c FROM projects')!.c;
  const team = get<{ c: number }>('SELECT COUNT(*) c FROM team')!.c;
  const settings = get<{ c: number }>('SELECT COUNT(*) c FROM settings')!.c;
  return posts + projects + team + settings > 0;
}

function main() {
  const seed = loadSeed();
  if (!Object.keys(seed).length) {
    console.warn(
      `No ${SEED_FILE} found — only the admin account will be created.\n` +
        'Run `npm run seed:dump` on a database that already has your content.',
    );
  }

  ensureAdmin();

  // Safety net: never overwrite content that already exists unless the caller
  // explicitly asks for it. This protects edits made in the admin panel.
  if (hasContent() && !RESET && !FORCE) {
    console.log('\nℹ Database already has content — seed data was NOT applied.');
    console.log('  Your existing posts, projects, team and settings are untouched.');
    console.log('  • want to apply the file anyway:  SEED_FORCE=1 npm run seed');
    console.log('  • want a clean import:            SEED_RESET=1 npm run seed');
    console.log('  • want to save your local edits:  npm run seed:dump');
    db.close();
    return;
  }

  if (RESET) resetContent();

  const counts = {
    settings: applySettings(seed.settings),
    posts: applyPosts(seed.posts),
    projects: applyProjects(seed.projects),
    team: applyTeam(seed.team),
  };

  console.log('Seed applied:', counts);
  console.log(`\nAdmin login -> username: ${ADMIN_USER}  password: ${ADMIN_PASS}`);

  const totals = {
    posts: get<{ c: number }>('SELECT COUNT(*) c FROM posts')!.c,
    projects: get<{ c: number }>('SELECT COUNT(*) c FROM projects')!.c,
    team: get<{ c: number }>('SELECT COUNT(*) c FROM team')!.c,
    settings: get<{ c: number }>('SELECT COUNT(*) c FROM settings')!.c,
  };
  console.log('Database now contains:', totals);
  console.log('Existing content not present in the seed file is kept — use SEED_RESET=1 to start clean.');
  void all;
  db.close();
}

main();
