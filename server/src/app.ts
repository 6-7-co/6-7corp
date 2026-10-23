import Fastify, { type FastifyInstance } from 'fastify';
import path from 'node:path';
import fs from 'node:fs';
import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';

import { attachAdmin, requireCsrf } from './lib/guards.js';
import { USE_BLOB, UPLOAD_DIR } from './lib/storage.js';
import { USING_PG } from './lib/db.js';
import { registerAuthRoutes } from './routes/auth.js';
import { registerPostRoutes } from './routes/posts.js';
import { registerProjectRoutes } from './routes/projects.js';
import { registerTeamRoutes } from './routes/team.js';
import { registerSettingsRoutes } from './routes/settings.js';
import { registerMessageRoutes } from './routes/messages.js';
import { registerUploadRoutes } from './routes/upload.js';
import { MODULE_DIR } from './lib/paths.js';

const CLIENT_DIST = path.resolve(MODULE_DIR, '../../client/dist');

/** True when running inside a Vercel serverless function. */
export const ON_VERCEL = Boolean(process.env.VERCEL);

/**
 * Builds the Fastify instance. It never listens — `index.ts` does that for a
 * long-running server, while `api/index.ts` hands requests to it on Vercel.
 */
export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: ON_VERCEL ? { level: process.env.LOG_LEVEL ?? 'warn' } : { level: process.env.LOG_LEVEL ?? 'info' },
    bodyLimit: 2 * 1024 * 1024,
    trustProxy: true,
  });

  // --- Security headers ---------------------------------------------------
  await app.register(helmet, {
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https://*.public.blob.vercel-storage.com'],
        fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
        connectSrc: ["'self'", 'https://translate.googleapis.com', 'https://*.googleapis.com'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  });

  // Same-origin deployments (Vercel, Docker) need no CORS; a split deployment
  // can allowlist the frontend origin with CLIENT_ORIGIN.
  await app.register(cors, {
    origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : true,
    credentials: true,
  });

  await app.register(rateLimit, { global: true, max: 600, timeWindow: '1 minute' });

  await app.register(multipart, {
    limits: { fileSize: 6 * 1024 * 1024, files: 5 },
  });

  await app.register(cookie, {});

  // Resolve the admin session for every request.
  app.addHook('onRequest', async (req) => {
    await attachAdmin(req);
  });

  // CSRF for state-changing requests.
  app.addHook('preHandler', async (req, reply) => {
    await requireCsrf(req, reply);
  });

  // Locally stored media is served by the app; on Vercel it lives in Blob.
  if (!ON_VERCEL && !USE_BLOB) {
    await app.register(fastifyStatic, {
      root: UPLOAD_DIR,
      prefix: '/uploads/',
      decorateReply: false,
      cacheControl: false,
      setHeaders: (reply) => {
        reply.header('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data: blob:");
        reply.header('X-Content-Type-Options', 'nosniff');
        reply.header('Cache-Control', 'public, max-age=31536000, immutable');
      },
    });
  }

  // --- Routes -------------------------------------------------------------
  await app.register(registerAuthRoutes);
  await app.register(registerPostRoutes);
  await app.register(registerProjectRoutes);
  await app.register(registerTeamRoutes);
  await app.register(registerSettingsRoutes);
  await app.register(registerMessageRoutes);
  await app.register(registerUploadRoutes);

  // --- Static frontend (self-hosted mode only) ----------------------------
  if (!ON_VERCEL && fs.existsSync(CLIENT_DIST)) {
    await app.register(fastifyStatic, {
      root: CLIENT_DIST,
      prefix: '/',
      index: ['index.html'],
      cacheControl: false,
      setHeaders: (reply, filePath) => {
        reply.header('X-Content-Type-Options', 'nosniff');
        const base = path.basename(String(filePath));
        const noCache = base.endsWith('.html') || base === 'theme-boot.js';
        reply.header('Cache-Control', noCache ? 'no-cache' : 'public, max-age=31536000, immutable');
      },
    });

    // SPA fallback: non-API GETs that aren't real files get index.html.
    app.setNotFoundHandler((req, reply) => {
      if (req.method === 'GET' && !req.url.startsWith('/api/') && !req.url.startsWith('/uploads/')) {
        return reply.sendFile('index.html');
      }
      return reply.code(404).send({ error: 'not_found' });
    });
  }

  if (USING_PG && process.env.NODE_ENV !== 'test') {
    app.log.info('database: postgres (Neon)');
  }

  return app;
}
