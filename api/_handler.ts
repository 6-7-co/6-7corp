import type { IncomingMessage, ServerResponse } from 'node:http';
import { buildApp } from '../server/src/app';

/**
 * Vercel serverless entry point.
 *
 * The Fastify instance is created once per lambda container and reused across
 * invocations (`await app.ready()` is idempotent). Bundled by
 * `scripts/build-api.mjs` into `api/[...path].js`.
 */
let appPromise: ReturnType<typeof buildApp> | null = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!appPromise) appPromise = buildApp();
  const app = await appPromise;
  await app.ready();
  app.server.emit('request', req, res);
}
