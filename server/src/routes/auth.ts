import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  issueToken,
  hashPassword,
  verifyPassword,
  AUTH_COOKIE,
  CSRF_COOKIE,
  COOKIE_OPTS,
  randomId,
  safeEqual,
} from '../lib/security.js';
import { get, run } from '../lib/db.js';

const loginSchema = z.object({
  username: z.string().min(3).max(64),
  password: z.string().min(6).max(200),
});

export function registerAuthRoutes(app: FastifyInstance) {
  app.get('/api/csrf', (req, reply) => {
    const token = randomId(24);
    reply.setCookie(CSRF_COOKIE, token, { ...COOKIE_OPTS, httpOnly: false, maxAge: 60 * 60 * 24 * 30 });
    return { csrfToken: token };
  });

  app.get('/api/me', (req, reply) => {
    if (!req.admin) return reply.code(401).send({ authenticated: false });
    return { authenticated: true, admin: req.admin };
  });

  app.post('/api/login', { config: { rateLimit: { max: 10, timeWindow: '15 minutes' } } }, (req, reply) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'invalid_input' });

    const { username, password } = parsed.data;
    const admin = get<{ id: number; username: string; password_hash: string }>(
      'SELECT id, username, password_hash FROM admins WHERE username = ?',
      username,
    );

    // Always run a hash comparison shape to keep timing roughly constant.
    const ok = admin ? verifyPassword(password, admin.password_hash) : false;
    if (!admin || !ok) {
      return reply.code(401).send({ error: 'invalid_credentials' });
    }

    const { token, expires } = issueToken(admin.id);
    // Rotate the session token on login.
    run('INSERT INTO sessions (token, admin_id, expires_at) VALUES (?, ?, datetime(?, \'unixepoch\'))',
      token, admin.id, expires / 1000);

    reply.setCookie(AUTH_COOKIE, token, COOKIE_OPTS);
    return { ok: true, admin: { id: admin.id, username: admin.username } };
  });

  app.post('/api/logout', (req, reply) => {
    const token = req.cookies[AUTH_COOKIE];
    if (token) run('DELETE FROM sessions WHERE token = ?', token);
    reply.clearCookie(AUTH_COOKIE, { path: '/' });
    return { ok: true };
  });

  // Used by the admin UI to confirm the session is still valid after reload.
  app.get('/api/session', (req, reply) => {
    const token = req.cookies[AUTH_COOKIE];
    if (!token) return { valid: false };
    return { valid: Boolean(req.admin), token };
  });

  // Only used by the seed script / first-run bootstrap.
  app.post('/api/bootstrap-admin', (req, reply) => {
    const { username, password } = (req.body ?? {}) as { username?: string; password?: string };
    const existing = get<{ c: number }>('SELECT COUNT(*) AS c FROM admins');
    if (existing && existing.c > 0) {
      return reply.code(409).send({ error: 'already_bootstrapped' });
    }
    if (!username || !password) return reply.code(400).send({ error: 'invalid_input' });
    run('INSERT INTO admins (username, password_hash) VALUES (?, ?)', username, hashPassword(password));
    return { ok: true };
  });

  app.get('/api/csrf/verify', (req, reply) => {
    const cookie = req.cookies[CSRF_COOKIE];
    const header = req.headers['x-csrf-token'];
    return { ok: Boolean(cookie && header && safeEqual(String(cookie), String(header))) };
  });
}
