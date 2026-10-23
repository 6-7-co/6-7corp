import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { all, get, run } from '../lib/db.js';
import { slugify, sanitizeMarkdown } from '../lib/security.js';
import { requireAuth } from '../lib/guards.js';

const postSchema = z.object({
  title: z.string().min(1).max(180),
  excerpt: z.string().max(400).default(''),
  bodyMd: z.string().max(200_000).default(''),
  cover: z.string().max(300).nullable().optional(),
  published: z.boolean().default(true),
});

export function registerPostRoutes(app: FastifyInstance) {
  // Public list (published only for anonymous visitors).
  app.get('/api/posts', (req) => {
    const isAdmin = Boolean((req as any).admin);
    return getPosts(isAdmin);
  });

  app.get('/api/posts/:slug', (req, reply) => {
    const { slug } = req.params as { slug: string };
    const post = get<any>('SELECT * FROM posts WHERE slug = ?', slug);
    if (!post || (!post.published && !(req as any).admin)) {
      return reply.code(404).send({ error: 'not_found' });
    }
    return post;
  });

  app.post('/api/posts', { preHandler: requireAuth }, (req, reply) => {
    const parsed = postSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'invalid_input', issues: parsed.error.flatten() });
    const { title, excerpt, bodyMd, cover, published } = parsed.data;
    let slug = slugify(title);
    while (get('SELECT id FROM posts WHERE slug = ?', slug)) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    run(
      `INSERT INTO posts (title, slug, excerpt, body_md, cover, published) VALUES (?, ?, ?, ?, ?, ?)`,
      title, slug, excerpt, sanitizeMarkdown(bodyMd), cover ?? null, published ? 1 : 0,
    );
    return reply.code(201).send({ ok: true });
  });

  app.put('/api/posts/:id', { preHandler: requireAuth }, (req, reply) => {
    const id = Number((req.params as any).id);
    const parsed = postSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'invalid_input', issues: parsed.error.flatten() });
    const { title, excerpt, bodyMd, cover, published } = parsed.data;
    if (!get('SELECT id FROM posts WHERE id = ?', id)) return reply.code(404).send({ error: 'not_found' });
    run(
      `UPDATE posts SET title=?, excerpt=?, body_md=?, cover=?, published=?, updated_at=datetime('now') WHERE id=?`,
      title, excerpt, sanitizeMarkdown(bodyMd), cover ?? null, published ? 1 : 0, id,
    );
    return { ok: true };
  });

  app.delete('/api/posts/:id', { preHandler: requireAuth }, (req, reply) => {
    run('DELETE FROM posts WHERE id = ?', Number((req.params as any).id));
    return { ok: true };
  });
}

function getPosts(includeUnpublished: boolean) {
  return all<any[]>(
    `SELECT id, title, slug, excerpt, cover, published, created_at, updated_at
     FROM posts
     ${includeUnpublished ? '' : 'WHERE published = 1'}
     ORDER BY created_at DESC`,
  );
}
