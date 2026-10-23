/**
 * Media storage with two backends:
 *
 *  • Vercel Blob — used whenever `BLOB_READ_WRITE_TOKEN` is present (Vercel).
 *  • Local disk (`server/uploads`) — local development and self-hosted VPS.
 *
 * The public API is identical, so the upload routes don't care where bytes go.
 */
import { createWriteStream, mkdirSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { MODULE_DIR } from './paths.js';

export const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? resolve(process.env.UPLOAD_DIR)
  : resolve(MODULE_DIR, '../../uploads');

export const USE_BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

mkdirSync(UPLOAD_DIR, { recursive: true });

export type StoredFile = { name: string; url: string; size: number };

function extOf(name: string) {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

/** Files we allow in the media library. */
export const IMAGE_EXTS = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif']);

export async function putFile(name: string, buf: Buffer, contentType: string): Promise<string> {
  if (USE_BLOB) {
    const { put } = await import('@vercel/blob');
    const blob = await put(name, buf, {
      access: 'public',
      contentType,
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return blob.url;
  }
  await new Promise<void>((ok) => {
    createWriteStream(join(UPLOAD_DIR, name)).write(buf, () => ok());
  });
  return `/uploads/${name}`;
}

export async function listFiles(): Promise<StoredFile[]> {
  if (USE_BLOB) {
    const { list } = await import('@vercel/blob');
    const { blobs } = await list({ token: process.env.BLOB_READ_WRITE_TOKEN, limit: 1000 });
    return blobs
      .map((b) => ({
        name: b.pathname.split('/').pop() ?? b.pathname,
        url: b.url,
        size: Number(b.size ?? 0),
      }))
      .sort((a, b) => b.name.localeCompare(a.name));
  }

  try {
    return readdirSync(UPLOAD_DIR)
      .filter((f) => IMAGE_EXTS.has(extOf(f)))
      .map((f) => {
        let size = 0;
        try {
          size = statSync(join(UPLOAD_DIR, f)).size;
        } catch {
          /* ignore */
        }
        return { name: f, url: `/uploads/${f}`, size };
      })
      .sort((a, b) => b.name.localeCompare(a.name));
  } catch {
    return [];
  }
}

export async function deleteFile(name: string): Promise<boolean> {
  if (USE_BLOB) {
    const { del, list } = await import('@vercel/blob');
    const { blobs } = await list({ token: process.env.BLOB_READ_WRITE_TOKEN, limit: 1000 });
    const match = blobs.find((b) => (b.pathname.split('/').pop() ?? b.pathname) === name);
    if (!match) return false;
    await del(match.url, { token: process.env.BLOB_READ_WRITE_TOKEN });
    return true;
  }
  try {
    unlinkSync(join(UPLOAD_DIR, name));
    return true;
  } catch {
    return false;
  }
}

/** Total bytes used by the media library. */
export async function storageStats(): Promise<{ bytes: number; backend: 'blob' | 'disk' }> {
  const files = await listFiles();
  return {
    bytes: files.reduce((sum, f) => sum + f.size, 0),
    backend: USE_BLOB ? 'blob' : 'disk',
  };
}
