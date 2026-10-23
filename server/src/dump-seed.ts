/**
 * Export the current database content into `seed-data.json`.
 *
 * Use it after you have edited content in the admin panel, so a fresh install
 * (or another machine) gets exactly your content instead of the demo data:
 *
 *   npm run seed:dump                 # writes server/src/seed-data.json
 *   SEED_RESET=1 npm run seed         # apply it to the current database
 *
 * Admins and contact messages are intentionally excluded (no secrets, no PII).
 */
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { all, db } from './lib/db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, 'seed-data.json');

function parseSocials(raw: string): Record<string, string> {
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

const settingsRows = all<{ key: string; value: string }>('SELECT key, value FROM settings ORDER BY key');
const settings: Record<string, string> = {};
for (const row of settingsRows) settings[row.key] = row.value;

const posts = all<any>(
  `SELECT title, slug, excerpt, body_md, cover, published
   FROM posts ORDER BY created_at ASC, id ASC`,
).map((p) => ({
  title: p.title,
  slug: p.slug,
  excerpt: p.excerpt,
  body_md: p.body_md,
  cover: p.cover,
  published: Boolean(p.published),
}));

const projects = all<any>(
  `SELECT title, slug, client, year, tags, excerpt, body_md, cover, link, order_idx
   FROM projects ORDER BY order_idx ASC, id ASC`,
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

const team = all<any>(
  `SELECT name, role, bio, photo, socials, order_idx
   FROM team ORDER BY order_idx ASC, id ASC`,
).map((m) => ({
  name: m.name,
  role: m.role,
  bio: m.bio,
  photo: m.photo,
  socials: parseSocials(m.socials ?? '{}'),
  order_idx: m.order_idx,
}));

const data = { settings, posts, projects, team };
writeFileSync(OUT, `${JSON.stringify(data, null, 2)}\n`, 'utf8');

console.log(`Wrote ${OUT}`);
console.log(
  `  settings: ${Object.keys(settings).length}, posts: ${posts.length}, ` +
    `projects: ${projects.length}, team: ${team.length}`,
);
db.close();
