/**
 * Applies `seed-data.json` to the database (SQLite locally, Postgres if
 * `DATABASE_URL` is set).
 *
 * - settings are overwritten, posts/projects upserted by slug, team by name
 * - safe by default: if the database already has content, nothing is applied
 *   (use SEED_FORCE=1 to overwrite, SEED_RESET=1 to wipe content first)
 * - admins are never stored in the file: they come from ADMIN_USER/ADMIN_PASSWORD
 */
import { randomBytes } from 'node:crypto';
import { closeDb, get } from './lib/db.js';
import {
  applySeed,
  ensureAdmin,
  hasContent,
  loadSeed,
  resetContent,
  SEED_FILE,
} from './lib/seed-content.js';

const ADMIN_USER = process.env.ADMIN_USER ?? 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD;
const RESET = /^(1|true|yes)$/i.test(process.env.SEED_RESET ?? '');
const FORCE = /^(1|true|yes)$/i.test(process.env.SEED_FORCE ?? '');

async function main() {
  const seed = loadSeed();
  if (!Object.keys(seed).length) {
    console.warn(
      `No usable data in ${SEED_FILE} — only the admin account will be created.\n` +
        'Run `npm run seed:dump` on a database that already has your content.',
    );
  }

  // No credentials are baked into the repository: either they come from the
  // environment, or a one-off password is generated and printed once.
  const existing = await get<{ id: number }>('SELECT id FROM admins WHERE username = ?', ADMIN_USER);
  if (ADMIN_PASS) {
    const adminResult = await ensureAdmin(ADMIN_USER, ADMIN_PASS);
    console.log(`Account "${ADMIN_USER}" ${adminResult === 'created' ? 'created' : 'password refreshed'}.`);
  } else if (existing) {
    console.log(`Account "${ADMIN_USER}" already exists — password left unchanged.`);
  } else {
    const generated = randomBytes(9).toString('base64url');
    await ensureAdmin(ADMIN_USER, generated);
    console.log(`Account "${ADMIN_USER}" created with a generated password:\n  ${generated}`);
    console.log('Change it any time: npm run admin:set -- <login> <new-password>');
  }

  if ((await hasContent()) && !RESET && !FORCE) {
    console.log('\nℹ Database already has content — seed data was NOT applied.');
    console.log('  Your existing posts, projects, team and settings are untouched.');
    console.log('  • apply the file anyway:          SEED_FORCE=1 npm run seed');
    console.log('  • clean import (drops content):   SEED_RESET=1 npm run seed');
    console.log('  • save your local edits:          npm run seed:dump');
    await closeDb();
    return;
  }

  if (RESET) {
    await resetContent();
    console.log('Content tables cleared (SEED_RESET=1).');
  }

  const counts = await applySeed(seed);
  console.log('Seed applied:', counts);
  console.log(
    '\nExisting rows not present in the seed file are kept — use SEED_RESET=1 to start clean.',
  );
  await closeDb();
}

main().catch(async (err) => {
  console.error(err);
  await closeDb();
  process.exit(1);
});
