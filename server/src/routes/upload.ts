import type { FastifyInstance } from 'fastify';
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES, randomId } from '../lib/security.js';
import { requireAuth } from '../lib/guards.js';
import { deleteFile, listFiles, putFile, storageStats, UPLOAD_DIR } from '../lib/storage.js';

export { UPLOAD_DIR };

/**
 * Image upload. Hard allowlist on MIME type + extension, size cap, and a
 * randomised server-generated filename so nothing user-controlled lands in
 * storage or in a URL. Bytes go to Vercel Blob in production and to
 * `server/uploads` locally.
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
    const url = await putFile(name, buf, mime);
    return { ok: true, url };
  });

  // Return usage so the admin UI can show how much space is used.
  app.get('/api/uploads/stats', { preHandler: requireAuth }, async () => {
    const { bytes, backend } = await storageStats();
    return { bytes, dir: backend, backend };
  });

  // List uploaded media for the media library.
  app.get('/api/uploads', { preHandler: requireAuth }, async () => {
    const files = await listFiles();
    return { files };
  });

  // Delete uploaded media. Name is validated to prevent path traversal.
  app.delete('/api/uploads/:name', { preHandler: requireAuth }, async (req, reply) => {
    const name = String((req.params as any).name);
    if (!/^[a-z0-9]+\.(png|jpg|jpeg|webp|gif|avif)$/i.test(name)) {
      return reply.code(400).send({ error: 'invalid_name' });
    }
    const removed = await deleteFile(name);
    if (!removed) return reply.code(404).send({ error: 'not_found' });
    return { ok: true };
  });
}

/** Very small magic-byte check for common image formats. */
function sniffImage(mime: string, buf: Buffer): boolean {
  if (buf.length < 4) return false;
  const b = buf;
  const png = b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
  const jpg = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  const gif = b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38;
  const webp =
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b.length > 12 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50;
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
