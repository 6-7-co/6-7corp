/**
 * Long-running server entry point (local dev, Docker, any VPS).
 * On Vercel the API is served by `api/index.ts` instead.
 */
import { buildApp } from './app.js';

const PORT = Number(process.env.PORT ?? 3001);
const HOST = process.env.HOST ?? '0.0.0.0';

const app = await buildApp();

await app.listen({ port: PORT, host: HOST });
app.log.info(`6-7corp API listening at ${HOST}:${PORT}`);

// Graceful shutdown so SQLite checkpoints and sockets close cleanly.
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    app.close().finally(() => process.exit(0));
  });
}
