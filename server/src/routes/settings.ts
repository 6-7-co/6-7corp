import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { all, run } from '../lib/db.js';
import { requireAuth } from '../lib/guards.js';

/**
 * Site settings live in the `settings` table as flat key/value strings so new
 * fields can be added without migrations. Localised fields simply get a
 * `_ru` / `_en` suffix. Structured values (clients, stats) are stored as JSON.
 */

/** Localised text keys — each stored as `<key>_ru` and `<key>_en`. */
const LOCALIZED_KEYS = [
  'tagline',
  'description',
  'location',
  'hero_eyebrow',
  'hero_line1',
  'hero_line2',
  'hero_line3',
  'hero_description',
  'hero_trusted',
] as const;

/** Plain string keys. */
const PLAIN_KEYS = ['company_name', 'email', 'established', 'locale_default', 'telegram', 'github'] as const;

/** JSON keys. */
const JSON_KEYS = ['clients', 'stats'] as const;

export const SETTING_KEYS = [
  ...PLAIN_KEYS,
  ...LOCALIZED_KEYS.flatMap((k) => [`${k}_ru`, `${k}_en`] as const),
  ...JSON_KEYS,
];

const emptyToUndefined = (v: unknown) => (v === '' ? undefined : v);

const settingsSchema = z.object({
  company_name: z.string().min(1).max(120).default('6-7 Corporation'),
  email: z.preprocess(emptyToUndefined, z.string().email().max(160).optional()).default(''),
  established: z.string().max(20).default(''),
  locale_default: z.enum(['ru', 'en']).default('ru'),
  telegram: z.string().max(300).default(''),
  github: z.string().max(300).default(''),
  clients: z.array(z.string().trim().min(1).max(60)).max(24).default([]),
  stats: z
    .array(
      z.object({
        value: z.string().trim().min(1).max(24),
        label_ru: z.string().trim().max(120).default(''),
        label_en: z.string().trim().max(120).default(''),
      }),
    )
    .max(6)
    .default([]),
  // Localised text (each field is a plain string; the pair lives in the DB).
  tagline_ru: z.string().max(300).default(''),
  tagline_en: z.string().max(300).default(''),
  description_ru: z.string().max(2000).default(''),
  description_en: z.string().max(2000).default(''),
  location_ru: z.string().max(160).default(''),
  location_en: z.string().max(160).default(''),
  hero_eyebrow_ru: z.string().max(160).default(''),
  hero_eyebrow_en: z.string().max(160).default(''),
  hero_line1_ru: z.string().max(80).default(''),
  hero_line1_en: z.string().max(80).default(''),
  hero_line2_ru: z.string().max(80).default(''),
  hero_line2_en: z.string().max(80).default(''),
  hero_line3_ru: z.string().max(80).default(''),
  hero_line3_en: z.string().max(80).default(''),
  hero_description_ru: z.string().max(600).default(''),
  hero_description_en: z.string().max(600).default(''),
  hero_trusted_ru: z.string().max(200).default(''),
  hero_trusted_en: z.string().max(200).default(''),
});

export type SiteSettings = z.infer<typeof settingsSchema>;

function parseJson<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function readSettings(): Record<string, unknown> {
  const rows = all<{ key: string; value: string }>('SELECT key, value FROM settings');
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;

  const out: Record<string, unknown> = {};
  for (const key of PLAIN_KEYS) out[key] = map[key] ?? '';
  for (const key of LOCALIZED_KEYS) {
    out[`${key}_ru`] = map[`${key}_ru`] ?? map[key] ?? '';
    out[`${key}_en`] = map[`${key}_en`] ?? '';
  }
  out.clients = parseJson<string[]>(map.clients, []);
  out.stats = parseJson<{ value: string; label_ru: string; label_en: string }[]>(map.stats, []);
  return out;
}

export function registerSettingsRoutes(app: FastifyInstance) {
  // Public: the site reads all of its editable copy from here.
  app.get('/api/settings', () => readSettings());

  // Admin: replace the whole settings blob.
  app.put('/api/settings', { preHandler: requireAuth }, (req, reply) => {
    const parsed = settingsSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_input', issues: parsed.error.flatten() });
    }

    const data = parsed.data;
    const entries: [string, string][] = [];

    for (const key of PLAIN_KEYS) entries.push([key, String(data[key])]);
    for (const key of LOCALIZED_KEYS) {
      entries.push([`${key}_ru`, String(data[`${key}_ru` as keyof SiteSettings])]);
      entries.push([`${key}_en`, String(data[`${key}_en` as keyof SiteSettings])]);
    }
    entries.push(['clients', JSON.stringify(data.clients)]);
    entries.push(['stats', JSON.stringify(data.stats)]);

    for (const [key, value] of entries) {
      run(
        `INSERT INTO settings (key, value) VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        key,
        value,
      );
    }
    return { ok: true };
  });

  app.get('/api/health', () => ({ ok: true, service: '6-7corp', time: new Date().toISOString() }));
}
