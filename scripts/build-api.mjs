/**
 * Bundles the server into Vercel serverless functions.
 *
 * We bundle ourselves (instead of letting Vercel compile the TS sources) so the
 * output is deterministic and `import './x.js'` specifiers — which TypeScript
 * emits for ESM sources — are resolved back to their `.ts` files.
 */
import { build } from 'esbuild';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Maps `./foo.js` to `./foo.ts` when only the TypeScript file exists. */
const tsResolver = {
  name: 'ts-resolver',
  setup(b) {
    b.onResolve({ filter: /^\.{1,2}\/.*\.js$/ }, (args) => {
      const candidate = resolve(args.resolveDir, args.path);
      const ts = candidate.replace(/\.js$/, '.ts');
      if (!existsSync(candidate) && existsSync(ts)) return { path: ts };
      return null;
    });
  },
};

const shared = {
  entryPoints: [resolve(root, 'api/_handler.ts')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node20',
  sourcemap: false,
  minify: true,
  legalComments: 'none',
  logLevel: 'info',
  plugins: [tsResolver],
  // Vercel's runtime resolves these from node_modules at deploy time.
  external: [],
  footer: {
    // Some runtimes look for a CommonJS function export, others for `.default`.
    js: 'if (module.exports && module.exports.default) module.exports = module.exports.default;',
  },
};

// `api/[...path].js` catches every /api/* request; `api/index.js` covers /api.
for (const out of ['api/[...path].js', 'api/index.js']) {
  await build({ ...shared, outfile: resolve(root, out) });
}

console.log('Built api/[...path].js and api/index.js');
