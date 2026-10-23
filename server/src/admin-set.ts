/**
 * Changes the admin login and/or password and signs out every device.
 *
 *   ADMIN_USER=newname ADMIN_PASSWORD='long-secret' npm run admin:set
 *   ADMIN_USER=newname ADMIN_PASSWORD='pass' ADMIN_FROM=old npm run admin:set
 *   npm run admin:set -- <login> <password> [old-login]
 *   DATABASE_URL=postgres://… npm run admin:set          # against Neon
 *
 * `ADMIN_FROM` renames an existing account instead of creating a new one.
 *
 * Content (posts, projects, team, settings) is never touched.
 */
import { closeDb, run } from './lib/db.js';
import { ensureAdmin } from './lib/seed-content.js';

// Positional args avoid npm's own `--flag` parsing.
const [, , posUser, posPassword, posFrom] = process.argv;
const targetUser = posUser ?? process.env.ADMIN_USER;
const password = posPassword ?? process.env.ADMIN_PASSWORD;
const fromUser = posFrom ?? process.env.ADMIN_FROM;

async function main() {
  if (!targetUser || !password) {
    console.error(
      'Usage: ADMIN_USER=<login> ADMIN_PASSWORD=<password> npm run admin:set\n' +
        '   or: npm run admin:set -- <login> <password> [old-login]',
    );
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }
  if (targetUser.length < 3) {
    console.error('Username must be at least 3 characters.');
    process.exit(1);
  }

  if (fromUser && fromUser !== targetUser) {
    await run('UPDATE admins SET username = ? WHERE username = ?', targetUser, fromUser);
    console.log(`Renamed admin "${fromUser}" → "${targetUser}".`);
  }

  const result = await ensureAdmin(targetUser, password);
  await run('DELETE FROM sessions');
  console.log(`Admin "${targetUser}" ${result === 'created' ? 'created' : 'password updated'}.`);
  console.log('All sessions signed out — sign in again with the new credentials.');
  await closeDb();
}

main().catch(async (err) => {
  console.error(err);
  await closeDb();
  process.exit(1);
});
