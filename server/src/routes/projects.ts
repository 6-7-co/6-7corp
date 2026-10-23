import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { all, get, run, NOW } from '../lib/db.js';
import { slugify, sanitizeMarkdown } from '../lib/security.js';
import { requireAuth } from '../lib/guards.js';

const projectSchema = z.object({
  title: z.string().min(1).max(180),
  client: z.string().max(120).default(''),
  year: z.string().max(12).default(''),
  tags: z.string().max(200).default(''),
  excerpt: z.string().max(400).default(''),
  bodyMd: z.string().max(200_000).default(''),
  cover: z.string().max(500).nullable().optional(),
  link: z.string().max(500).nullable().optional(),
  orderIdx: z.number().int().default(0),
});

export function registerProjectRoutes(app: FastifyInstance) {
  app.get('/api/projects', () => getProjects());

  app.get('/api/projects/:slug', async (req, reply) => {
    const { slug } = req.params as { slug: string };
    const project = await get<any>('SELECT * FROM projects WHERE slug = ?', slug);
    if (!project) return reply.code(404).send({ error: 'not_found' });
    return project;
  });

  app.post('/api/projects', { preHandler: requireAuth }, async (req, reply) => {
    const parsed = projectSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'invalid_input', issues: parsed.error.flatten() });
    const d = parsed.data;
    let slug = slugify(d.title);
    while (await get('SELECT id FROM projects WHERE slug = ?', slug)) {
      slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    }
    await run(
      `INSERT INTO projects (title, slug, client, year, tags, excerpt, body_md, cover, link, order_idx)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      d.title, slug, d.client, d.year, d.tags, d.excerpt, sanitizeMarkdown(d.bodyMd),
      d.cover ?? null, d.link ?? null, d.orderIdx,
    );
    return reply.code(201).send({ ok: true });
  });

  app.put('/api/projects/:id', { preHandler: requireAuth }, async (req, reply) => {
    const id = Number((req.params as any).id);
    const parsed = projectSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'invalid_input', issues: parsed.error.flatten() });
    const d = parsed.data;
    if (!(await get('SELECT id FROM projects WHERE id = ?', id))) {
      return reply.code(404).send({ error: 'not_found' });
    }
    await run(
      `UPDATE projects SET title=?, client=?, year=?, tags=?, excerpt=?, body_md=?, cover=?, link=?, order_idx=?, updated_at=${NOW} WHERE id=?`,
      d.title, d.client, d.year, d.tags, d.excerpt, sanitizeMarkdown(d.bodyMd),
      d.cover ?? null, d.link ?? null, d.orderIdx, id,
    );
    return { ok: true };
  });

  app.delete('/api/projects/:id', { preHandler: requireAuth }, async (req) => {
    await run('DELETE FROM projects WHERE id = ?', Number((req.params as any).id));
    return { ok: true };
  });
}

function getProjects() {
  return all<any>(
    `SELECT id, title, slug, client, year, tags, excerpt, cover, link, order_idx, created_at
     FROM projects ORDER BY order_idx ASC, id ASC`,
  );
}
