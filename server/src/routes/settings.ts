import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { all, get, run } from '../lib/db.js';
import { requireAuth } from '../lib/guards.js';

const SETTING_KEYS = [
  'company_name',
  'tagline',
  'description',
  'email',
  'established',
  'locale_default',
] as const;

const settingsSchema = z.object({
  company_name: z.string().min(1).max(80),
  tagline: z.string().max(200).default(''),
  description: z.string().max(5000).default(''),
  email: z.string().email().max(160).default(''),
  established: z.string().max(20).default(''),
  locale_default: z.enum(['en', 'ru']).default('en'),
});

export function registerSettingsRoutes(app: FastifyInstance) {
  app.get('/api/settings', () => {
    const rows = all<{ key: string; value: string }>('SELECT key, value FROM settings');
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    // Fill defaults for anything not yet set.
    const defaults: Record<string, string> = {
      company_name: '6-7 Corporation',
      tagline: '',
      description: '',
      email: '',
      established: '',
      locale_default: 'en',
    };
    return { ...defaults, ...map };
  });

  app.put('/api/settings', { preHandler: requireAuth }, (req, reply) => {
    const parsed = settingsSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'invalid_input', issues: parsed.error.flatten() });
    for (const [key, value] of Object.entries(parsed.data)) {
      run(
        `INSERT INTO settings (key, value) VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        key, String(value),
      );
    }
    return { ok: true };
  });

  app.get('/api/health', () => ({ ok: true, service: '6-7corp', time: new Date().toISOString() }));
}

export { SETTING_KEYS };
