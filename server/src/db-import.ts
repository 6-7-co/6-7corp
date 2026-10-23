/**
 * Imports `seed-data.json` into the configured database. This is the script you
 * run once against Neon to bring your local content over.
 *
 *   DATABASE_URL=postgres://… ADMIN_USER=me ADMIN_PASSWORD=… npm run db:import
 *
 * Flags:
 *   --reset   wipe posts/projects/team before importing (settings still merge)
 *   --keep    keep existing rows and only upsert (default behaviour)
 */
import { closeDb, USING_PG } from './lib/db.js';
import {
  applySeed,
  countContent,
  ensureAdmin,
  loadSeed,
  resetContent,
} from './lib/seed-content.js';

const RESET = process.argv.includes('--reset');
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASSWORD;

async function main() {
  const seed = loadSeed();
  if (!Object.keys(seed).length) {
    console.error('seed-data.json is empty — run `npm run seed:dump` locally first.');
    process.exit(1);
  }

  console.log(`Importing into ${USING_PG ? 'postgres' : 'local SQLite'}…`);
  if (RESET) {
    await resetContent();
    console.log('Existing posts/projects/team removed (--reset).');
  }

  const counts = await applySeed(seed);
  console.log('Imported:', counts);

  if (ADMIN_USER && ADMIN_PASS) {
    const result = await ensureAdmin(ADMIN_USER, ADMIN_PASS);
    console.log(`Admin "${ADMIN_USER}" ${result === 'created' ? 'created' : 'password set'}.`);
  } else {
    console.log('Admin untouched (set ADMIN_USER and ADMIN_PASSWORD to create/update it).');
  }

  const totals = await countContent();
  console.log('Database now contains:', totals);
  await closeDb();
}

main().catch(async (err) => {
  console.error(err);
  await closeDb();
  process.exit(1);
});
