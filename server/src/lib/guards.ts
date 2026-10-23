import type { FastifyReply, FastifyRequest } from 'fastify';
import {
  AUTH_COOKIE,
  CSRF_COOKIE,
  verifyToken,
  safeEqual,
} from './security.js';
import { get, NOW } from './db.js';

declare module 'fastify' {
  interface FastifyRequest {
    admin?: { id: number; username: string };
  }
}

/** Resolves the admin session from the auth cookie, if present. */
export async function attachAdmin(req: FastifyRequest): Promise<void> {
  const token = req.cookies?.[AUTH_COOKIE];
  if (!token) return;
  const payload = verifyToken(token);
  if (!payload) return;
  const row = await get<{ id: number; username: string }>(
    `SELECT a.id, a.username FROM admins a
     JOIN sessions s ON s.admin_id = a.id
     WHERE s.token = ? AND s.expires_at > ${NOW}`,
    token,
  );
  if (row) req.admin = { id: row.id, username: row.username };
}

/** Fastify preHandler: require a valid admin session. */
export async function requireAuth(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (!req.admin) {
    reply.code(401).send({ error: 'authentication_required' });
  }
}

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * CSRF guard using the double-submit-cookie pattern. The cookie is readable by
 * JS (so the client can echo it in the `x-csrf-token` header) but the cookie
 * itself is `SameSite=strict`, and a cross-site attacker can neither read the
 * cookie nor set the custom header — so forged state-changing requests fail.
 */
export async function requireCsrf(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (!MUTATING.has(req.method)) return;
  const cookie = req.cookies?.[CSRF_COOKIE];
  const header = req.headers['x-csrf-token'];
  if (!cookie || !header || typeof header !== 'string' || !safeEqual(cookie, header)) {
    reply.code(403).send({ error: 'csrf_failed' });
  }
}
