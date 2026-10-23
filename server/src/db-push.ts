/**
 * Creates the database schema (idempotent).
 *
 *   DATABASE_URL=postgres://… npm run db:push    # Neon / Postgres
 *   npm run db:push                             # local SQLite
 */
import { closeDb, DATABASE_URL, migrate, USING_PG } from './lib/db.js';

async function main() {
  if (USING_PG) {
    console.log(`Applying schema to postgres (${hostOf(DATABASE_URL)})…`);
  } else {
    console.log('Applying schema to local SQLite (server/data/app.db)…');
  }
  await migrate();
  console.log('Schema is up to date.');
  await closeDb();
}

function hostOf(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return 'unknown host';
  }
}

main().catch(async (err) => {
  console.error(err);
  await closeDb();
  process.exit(1);
});
