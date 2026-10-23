/**
 * One-shot seed for local development. Idempotent — safe to re-run.
 * Creates the admin account, default settings and sample content.
 */
import { db, get, run } from './lib/db.js';
import { hashPassword } from './lib/security.js';

const ADMIN_USER = process.env.ADMIN_USER ?? 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD ?? 'admin12345';

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

function ensureSettings() {
  const settings: Record<string, string> = {
    company_name: '6-7 Corporation',
    tagline: 'We build the unbuildable.',
    description:
      '6-7 Corporation is a product studio engineering bold interfaces, ' +
      'distributed systems and security-first software for teams who refuse to ' +
      'settle for ordinary.',
    email: 'hello@6-7corp.com',
    established: '2019',
    locale_default: 'en',
  };
  for (const [k, v] of Object.entries(settings)) {
    run(`INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO NOTHING`, k, v);
  }
}

function ensureContent() {
  if (get('SELECT id FROM posts')) return;

  run(
    `INSERT INTO posts (title, slug, excerpt, body_md, cover, published) VALUES (?, ?, ?, ?, ?, 1)`,
    'Why we engineer for the impossible',
    'why-we-engineer',
    'A short field note on scope, speed and staying secure at scale.',
    `## The brief

Every product starts with a question that sounds a little *too hard*.

We treat that as a feature, not a warning. The work is to cut the problem
down to its spine, then build the spine well.

### What we optimise for

- **Clarity** — one obvious path through a thousand possible ones.
- **Resilience** — systems that degrade gracefully instead of failing loudly.
- **Security** — threat models written before the first line of code.

> We do not ship anything we would not put in front of our own users.`,
    null,
  );

  run(
    `INSERT INTO projects (title, slug, client, year, tags, excerpt, body_md, cover, link, order_idx)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    'Helio Pay',
    'helio-pay',
    'Helio',
    '2024',
    'Payments, Fraud, Rust',
    'A 12ms payment gateway with adaptive fraud scoring.',
    `## What we did

Rebuilt the authorisation pipeline in Rust and cut p99 latency from
**480ms to 12ms** while adding adaptive fraud scoring.

### Stack

- Rust · Tokio
- PostgreSQL · Redis
- Custom scoring runtime`,
    null, 'https://example.com/helio', 1,
  );

  run(
    `INSERT INTO projects (title, slug, client, year, tags, excerpt, body_md, cover, link, order_idx)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    'Northwind OS',
    'northwind-os',
    'Northwind',
    '2023',
    'Platform, DevTools, TS',
    'A developer platform serving 40k builds a day.',
    `## What we did

Designed a build orchestration platform that scales to **40,000 builds/day**
with deterministic caching.

### Stack

- TypeScript · React
- Go orchestrator
- Object storage`,
    null, 'https://example.com/northwind', 2,
  );

  run(
    `INSERT INTO team (name, role, bio, photo, socials, order_idx) VALUES (?, ?, ?, ?, ?, ?)`,
    'Ada Voss', 'Founder & CTO', 'Sets the technical direction. 15 years shipping at scale.', null, JSON.stringify({ website: 'https://example.com', github: 'https://github.com/ada' }), 1,
  );
  run(
    `INSERT INTO team (name, role, bio, photo, socials, order_idx) VALUES (?, ?, ?, ?, ?, ?)`,
    'Kenji Mori', 'Security Lead', 'Red-teams everything before it ships. Former CTF champion.', null, JSON.stringify({ github: 'https://github.com/kenji', telegram: 'https://t.me/kenji' }), 2,
  );
  run(
    `INSERT INTO team (name, role, bio, photo, socials, order_idx) VALUES (?, ?, ?, ?, ?, ?)`,
    'Lena Ortiz', 'Design Director', 'Turns dense systems into calm interfaces.', null, JSON.stringify({ x: 'https://x.com/lena', website: 'https://example.com/lena' }), 3,
  );
}

function main() {
  ensureAdmin();
  ensureSettings();
  ensureContent();
  const counts = {
    admins: get<{ c: number }>('SELECT COUNT(*) c FROM admins')!.c,
    posts: get<{ c: number }>('SELECT COUNT(*) c FROM posts')!.c,
    projects: get<{ c: number }>('SELECT COUNT(*) c FROM projects')!.c,
    team: get<{ c: number }>('SELECT COUNT(*) c FROM team')!.c,
  };
  console.log('Seed complete:', counts);
  console.log(`\nAdmin login -> username: ${ADMIN_USER}  password: ${ADMIN_PASS}`);
  db.close();
}

main();
