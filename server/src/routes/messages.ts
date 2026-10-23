import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { all, get, run } from '../lib/db.js';
import { requireAuth } from '../lib/guards.js';

const messageSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email().max(160),
  content: z.string().min(1).max(10_000),
  content_en: z.string().max(10_000).optional(),
  content_ru: z.string().max(10_000).optional(),
});

export function registerMessageRoutes(app: FastifyInstance) {
  // Public contact form.
  app.post('/api/messages', async (req, reply) => {
    const parsed = messageSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'invalid_input', issues: parsed.error.flatten() });
    const { name, email, content, content_en, content_ru } = parsed.data;
    const inserted = await get<{ id: number }>(
      'INSERT INTO messages (name, email, content, content_en, content_ru) VALUES (?, ?, ?, ?, ?) RETURNING id',
      name, email, content, content_en ?? null, content_ru ?? null,
    );
    return reply.code(201).send({ ok: true, id: Number(inserted?.id ?? 0) });
  });

  // Admin inbox.
  app.get('/api/messages', { preHandler: requireAuth }, async (req) => {
    if (!req.admin) return [];
    return all<any>(
      'SELECT id, name, email, content, created_at FROM messages ORDER BY created_at DESC LIMIT 100',
    );
  });

  app.delete('/api/messages/:id', { preHandler: requireAuth }, async (req) => {
    await run('DELETE FROM messages WHERE id = ?', Number((req.params as any).id));
    return { ok: true };
  });
}
