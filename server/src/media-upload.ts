/**
 * Migrates locally stored media (server/uploads) to Vercel Blob.
 *
 *   BLOB_READ_WRITE_TOKEN=… npm run media:push
 *
 * Run once after deploying: it uploads every file, then rewrites matching
 * `/uploads/<name>` references in posts, projects, team and settings to the
 * Blob URL. Safe to re-run — already-uploaded files are skipped.
 */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { all, closeDb, run } from './lib/db.js';
import { IMAGE_EXTS, putFile, UPLOAD_DIR } from './lib/storage.js';

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('BLOB_READ_WRITE_TOKEN is not set — nothing to do.');
    process.exit(1);
  }

  let names: string[] = [];
  try {
    names = readdirSync(UPLOAD_DIR).filter((f) => IMAGE_EXTS.has(f.split('.').pop()?.toLowerCase() ?? ''));
  } catch {
    names = [];
  }

  if (!names.length) {
    console.log(`No local files in ${UPLOAD_DIR}.`);
    await closeDb();
    return;
  }

  const map = new Map<string, string>();
  for (const name of names) {
    const { readFileSync } = await import('node:fs');
    const buf = readFileSync(join(UPLOAD_DIR, name));
    const mime = guessMime(name);
    const url = await putFile(name, buf, mime);
    map.set(`/uploads/${name}`, url);
    console.log(`↑ ${name} → ${url}`);
  }

  // Rewrite references in content tables.
  const rewrite = async (table: string, column: string) => {
    const rows = await all<any>(`SELECT id, ${column} AS v FROM ${table} WHERE ${column} LIKE '/uploads/%'`);
    for (const row of rows) {
      const next = map.get(String(row.v));
      if (next) await run(`UPDATE ${table} SET ${column} = ? WHERE id = ?`, next, row.id);
    }
    return rows.length;
  };

  const posts = await rewrite('posts', 'cover');
  const projects = await rewrite('projects', 'cover');
  const team = await rewrite('team', 'photo');

  const settingsRows = await all<{ key: string; value: string }>("SELECT key, value FROM settings WHERE value LIKE '%/uploads/%'");
  for (const row of settingsRows) {
    let value = row.value;
    for (const [from, to] of map) value = value.split(from).join(to);
    await run('UPDATE settings SET value = ? WHERE key = ?', value, row.key);
  }

  console.log(`Updated references — posts: ${posts}, projects: ${projects}, team: ${team}, settings: ${settingsRows.length}`);
  await closeDb();
}

function guessMime(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'png': return 'image/png';
    case 'gif': return 'image/gif';
    case 'webp': return 'image/webp';
    case 'avif': return 'image/avif';
    default: return 'image/jpeg';
  }
}

main().catch(async (err) => {
  console.error(err);
  await closeDb();
  process.exit(1);
});
