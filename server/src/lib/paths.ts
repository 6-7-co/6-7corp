import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Directory of the currently executing module.
 *
 * Works in three setups: ESM sources run by `tsx`, the CommonJS bundle we emit
 * for Vercel (`api/index.js`) and any test runner. In a CommonJS bundle
 * `import.meta` is not available, so `__dirname` is preferred when present.
 */
export const MODULE_DIR: string = (() => {
  if (typeof __dirname !== 'undefined' && typeof __dirname === 'string' && __dirname) {
    return __dirname;
  }
  try {
    return dirname(fileURLToPath(import.meta.url));
  } catch {
    return process.cwd();
  }
})();
