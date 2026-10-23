/**
 * Exports the current database content into `server/src/seed-data.json`.
 *
 * Works against whichever database is configured, so you can dump your local
 * SQLite content and import it into Neon/Postgres:
 *
 *   npm run seed:dump                                   # local SQLite → file
 *   npm run db:import                                   # file → DATABASE_URL
 *   DATABASE_URL=postgres://… npm run seed:dump         # Neon → file (backup)
 *
 * Admins and contact messages are intentionally excluded.
 */
import { closeDb, DATABASE_URL, USING_PG } from './lib/db.js';
import { dumpSeed, loadSeed, SEED_FILE } from './lib/seed-content.js';

const FORCE = process.argv.includes('--force');

async function main() {
  const existing = loadSeed();
  const existingCount =
    Object.keys(existing.settings ?? {}).length +
    (existing.posts?.length ?? 0) +
    (existing.projects?.length ?? 0) +
    (existing.team?.length ?? 0);

  const data = await dumpSeed();
  const newCount =
    Object.keys(data.settings ?? {}).length +
    (data.posts?.length ?? 0) +
    (data.projects?.length ?? 0) +
    (data.team?.length ?? 0);

  // Never silently wipe a good seed file with an empty database.
  if (newCount === 0 && existingCount > 0 && !FORCE) {
    const { writeFileSync } = await import('node:fs');
    writeFileSync(SEED_FILE, `${JSON.stringify(existing, null, 2)}\n`, 'utf8');
    console.log(
      'Database is empty, so seed-data.json was left unchanged.\n' +
        'Point DATABASE_URL or DATA_DIR at the database that has your content, or pass --force.',
    );
    await closeDb();
    return;
  }

  console.log(`Wrote ${SEED_FILE}`);
  console.log(`  source: ${USING_PG ? 'postgres' : 'sqlite'}${DATABASE_URL && USING_PG ? ` (${mask(DATABASE_URL)})` : ''}`);
  console.log(
    `  settings: ${Object.keys(data.settings ?? {}).length}, posts: ${data.posts?.length ?? 0}, ` +
      `projects: ${data.projects?.length ?? 0}, team: ${data.team?.length ?? 0}`,
  );
  await closeDb();
}

function mask(url: string) {
  try {
    const u = new URL(url);
    return `${u.host}${u.pathname}`;
  } catch {
    return 'postgres';
  }
}

main().catch(async (err) => {
  console.error(err);
  await closeDb();
  process.exit(1);
});
