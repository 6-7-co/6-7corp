import Fastify from 'fastify';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';

import { attachAdmin, requireAuth, requireCsrf } from './lib/guards.js';
import { registerAuthRoutes } from './routes/auth.js';
import { registerPostRoutes } from './routes/posts.js';
import { registerProjectRoutes } from './routes/projects.js';
import { registerTeamRoutes } from './routes/team.js';
import { registerSettingsRoutes } from './routes/settings.js';
import { registerMessageRoutes } from './routes/messages.js';
import { registerUploadRoutes, UPLOAD_DIR } from './routes/upload.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 3001);
const HOST = process.env.HOST ?? '0.0.0.0';
const CLIENT_DIST = path.resolve(__dirname, '../../client/dist');

const app = Fastify({
  logger: { level: process.env.LOG_LEVEL ?? 'info' },
  bodyLimit: 2 * 1024 * 1024,
  trustProxy: true,
});

// --- Security headers -----------------------------------------------------
app.register(helmet, {
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'blob:'],
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

app.register(cors, {
  origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : true,
  credentials: true,
});

// --- Rate limiting (global + stricter on auth) ----------------------------
app.register(rateLimit, { global: true, max: 600, timeWindow: '1 minute' });

app.register(multipart, {
  limits: { fileSize: 6 * 1024 * 1024, files: 5 },
});

// --- Cookies + request guards ---------------------------------------------
app.register(cookie, {});

// Resolve the admin session for every request.
app.addHook('onRequest', async (req) => {
  attachAdmin(req);
});

// CSRF for state-changing requests.
app.addHook('preHandler', async (req, reply) => {
  // Public endpoints that legitimately mutate (login/contact) still need CSRF
  // protection for state-changing behaviour — we issue the token cookie from
  // GET /api/csrf which the SPA calls before booting.
  await requireCsrf(req, reply);
});

// Serve uploaded media with a locked-down content type.
app.register(fastifyStatic, {
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

// --- Routes ----------------------------------------------------------------
app.register(registerAuthRoutes);
app.register(registerPostRoutes);
app.register(registerProjectRoutes);
app.register(registerTeamRoutes);
app.register(registerSettingsRoutes);
app.register(registerMessageRoutes);
app.register(registerUploadRoutes);

// --- Static frontend (production single-server mode) -----------------------
// When the client has been built (client/dist exists), serve it from the same
// origin as the API. This keeps one process, one port, one CSP in production.
if (fs.existsSync(CLIENT_DIST)) {
  app.register(fastifyStatic, {
    root: CLIENT_DIST,
    prefix: '/',
    index: ['index.html'],
    cacheControl: false,
    // Hashed Vite assets can be cached forever; HTML and the boot script must
    // revalidate so deploys take effect immediately.
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

await app.listen({ port: PORT, host: HOST });
app.log.info(`6-7corp API listening at ${HOST}:${PORT}`);
