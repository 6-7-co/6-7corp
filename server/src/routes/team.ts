import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { all, get, run } from '../lib/db.js';
import { sanitizeMarkdown } from '../lib/security.js';
import { requireAuth } from '../lib/guards.js';

const socialsSchema = z.object({
  website: z.string().max(400).optional(),
  github: z.string().max(400).optional(),
  telegram: z.string().max(400).optional(),
  youtube: z.string().max(400).optional(),
  x: z.string().max(400).optional(),
});

const memberSchema = z.object({
  name: z.string().min(1).max(80),
  role: z.string().max(80).default(''),
  bio: z.string().max(5000).default(''),
  photo: z.string().max(300).nullable().optional(),
  socials: socialsSchema.default({}),
  orderIdx: z.number().int().default(0),
});

export function registerTeamRoutes(app: FastifyInstance) {
  app.get('/api/team', () =>
    all<any[]>('SELECT id, name, role, bio, photo, socials, order_idx FROM team ORDER BY order_idx ASC, name ASC'),
  );

  app.post('/api/team', { preHandler: requireAuth }, (req, reply) => {
    const parsed = memberSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'invalid_input', issues: parsed.error.flatten() });
    const d = parsed.data;
    run(
      `INSERT INTO team (name, role, bio, photo, socials, order_idx) VALUES (?, ?, ?, ?, ?, ?)`,
      d.name, d.role, sanitizeMarkdown(d.bio), d.photo ?? null, JSON.stringify(d.socials ?? {}), d.orderIdx,
    );
    return reply.code(201).send({ ok: true });
  });

  app.put('/api/team/:id', { preHandler: requireAuth }, (req, reply) => {
    const id = Number((req.params as any).id);
    const parsed = memberSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'invalid_input', issues: parsed.error.flatten() });
    const d = parsed.data;
    if (!get('SELECT id FROM team WHERE id = ?', id)) return reply.code(404).send({ error: 'not_found' });
    run(
      `UPDATE team SET name=?, role=?, bio=?, photo=?, socials=?, order_idx=? WHERE id=?`,
      d.name, d.role, sanitizeMarkdown(d.bio), d.photo ?? null, JSON.stringify(d.socials ?? {}), d.orderIdx, id,
    );
    return { ok: true };
  });

  app.delete('/api/team/:id', { preHandler: requireAuth }, (req, reply) => {
    run('DELETE FROM team WHERE id = ?', Number((req.params as any).id));
    return { ok: true };
  });
}
