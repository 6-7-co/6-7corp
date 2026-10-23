import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes, timingSafeEqual } from 'node:crypto';

const DAY = 60 * 60 * 24;

const SECRET =
  process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32
    ? process.env.JWT_SECRET
    : 'dev-only-secret-change-me-6-7corp-please-rotate-me-now';

const SESSION_DAYS = Number(process.env.SESSION_DAYS ?? 14);

export const AUTH_COOKIE = 'corp_session';
export const CSRF_COOKIE = 'corp_csrf';
export const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: DAY * SESSION_DAYS,
};

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 12);
}

export function verifyPassword(plain: string, hash: string): boolean {
  try {
    return bcrypt.compareSync(plain, hash);
  } catch {
    return false;
  }
}

export function issueToken(adminId: number): { token: string; expires: number } {
  const expires = Date.now() + DAY * SESSION_DAYS * 1000;
  const token = jwt.sign({ sub: adminId, sid: randomBytes(16).toString('hex') }, SECRET, {
    expiresIn: DAY * SESSION_DAYS,
  });
  return { token, expires };
}

export function verifyToken(token: string): { sub: number; sid: string } | null {
  try {
    const payload = jwt.verify(token, SECRET) as jwt.JwtPayload;
    if (typeof payload.sub !== 'number') return null;
    return { sub: payload.sub, sid: String(payload.sid ?? '') };
  } catch {
    return null;
  }
}

/** Constant-time comparison helper. */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** Cryptographically random, URL-safe id for uploads / slugs. */
export function randomId(bytes = 12): string {
  return randomBytes(bytes).toString('base64url');
}

/** Slugify with a hard length cap and an ASCII-only whitelist. */
export function slugify(input: string): string {
  const s = input
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return s || randomId(6);
}

/**
 * Very small, dependency-free markdown sanitizer used for server-side
 * previews. It whitelists a tiny subset of tags and escapes everything else.
 * The client renders with z-md (which itself escapes HTML), so this is a
 * defence-in-depth layer for anything rendered server-side.
 */
const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'em', 'code', 'pre', 'blockquote', 'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'hr',
]);

export function sanitizeMarkdown(md: string): string {
  const escaped = md
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
  // Keep only whitelisted inline/block tags; drop everything else.
  return escaped.replace(/<\/?([a-zA-Z0-9]+)[^>]*>/g, (m, tag) => {
    const lower = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(lower)) return '';
    return m;
  });
}

/** Strict allowlist for uploaded images. */
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

export const MAX_UPLOAD_BYTES = 6 * 1024 * 1024; // 6 MB
