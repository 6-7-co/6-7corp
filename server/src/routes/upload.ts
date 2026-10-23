import type { FastifyInstance } from 'fastify';
import { createWriteStream, mkdirSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES, randomId } from '../lib/security.js';
import { requireAuth } from '../lib/guards.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = resolve(__dirname, '../../uploads');
mkdirSync(UPLOAD_DIR, { recursive: true });

/**
 * Image upload. Hard allowlist on MIME type + extension, size cap, and a
 * randomised server-generated filename so nothing user-controlled lands on
 * disk or in a URL. Uploaded bytes are written straight from the stream.
 */
export function registerUploadRoutes(app: FastifyInstance) {
  app.post('/api/upload', { preHandler: requireAuth }, async (req, reply) => {
    const file = await req.file();
    if (!file) return reply.code(400).send({ error: 'no_file' });

    const mime = file.mimetype;
    const ext = ALLOWED_IMAGE_TYPES[mime];
    if (!ext) {
      // Drain so the socket isn't left hanging.
      await file.toBuffer().catch(() => undefined);
      return reply.code(415).send({ error: 'unsupported_type' });
    }

    const buf = await file.toBuffer();
    if (buf.length > MAX_UPLOAD_BYTES) {
      return reply.code(413).send({ error: 'file_too_large' });
    }
    if (buf.length === 0) {
      return reply.code(400).send({ error: 'empty_file' });
    }

    // Lightweight magic-byte sniff to make sure the header matches the bytes.
    if (!sniffImage(mime, buf)) {
      return reply.code(415).send({ error: 'bad_image_bytes' });
    }

    const name = `${randomId(16)}.${ext}`;
    createWriteStream(join(UPLOAD_DIR, name)).write(buf);
    return { ok: true, url: `/uploads/${name}` };
  });

  // Return disk usage so the admin UI can show how much space is used.
  app.get('/api/uploads/stats', { preHandler: requireAuth }, () => {
    let bytes = 0;
    try {
      for (const f of readdirSync(UPLOAD_DIR)) bytes += statSync(join(UPLOAD_DIR, f)).size;
    } catch { /* ignore */ }
    return { bytes, dir: UPLOAD_DIR };
  });

  // List uploaded media for the media library.
  app.get('/api/uploads', { preHandler: requireAuth }, () => {
    const files = readdirSync(UPLOAD_DIR)
      .filter((f) => ALLOWED_IMAGE_TYPES[mimeByExt(f)] !== undefined)
      .map((f) => {
        let size = 0;
        try { size = statSync(join(UPLOAD_DIR, f)).size; } catch { /* ignore */ }
        return { name: f, url: `/uploads/${f}`, size };
      })
      .sort((a, b) => b.name.localeCompare(a.name));
    return { files };
  });

  // Delete uploaded media. Name is validated to prevent path traversal.
  app.delete('/api/uploads/:name', { preHandler: requireAuth }, (req, reply) => {
    const name = String((req.params as any).name);
    if (!/^[a-z0-9]+\.(png|jpg|webp|gif|avif)$/i.test(name)) {
      return reply.code(400).send({ error: 'invalid_name' });
    }
    const target = join(UPLOAD_DIR, name);
    try {
      unlinkSync(target);
    } catch {
      return reply.code(404).send({ error: 'not_found' });
    }
    return { ok: true };
  });
}

/** Map a filename extension back to a mime type. */
function mimeByExt(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'webp': return 'image/webp';
    case 'gif': return 'image/gif';
    case 'avif': return 'image/avif';
    default: return '';
  }
}

/** Very small magic-byte check for common image formats. */
function sniffImage(mime: string, buf: Buffer): boolean {
  if (buf.length < 4) return false;
  const b = buf;
  const png = b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
  const jpg = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  const gif = b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38;
  const webp = b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b.length > 12 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50;
  const avif = b.slice(4, 12).toString('ascii').includes('ftyp');
  switch (mime) {
    case 'image/png': return png;
    case 'image/jpeg': return jpg;
    case 'image/gif': return gif;
    case 'image/webp': return webp;
    case 'image/avif': return avif;
    default: return false;
  }
}
