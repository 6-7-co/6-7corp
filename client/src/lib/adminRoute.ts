/**
 * Path of the private content area.
 *
 * There is no built-in default on purpose: this repository is public, so a
 * hard-coded path would be public too. The value comes from `VITE_ADMIN_PATH`
 * at build time (your local `.env` or the host's environment variables) and is
 * baked into the bundle.
 *
 * When the variable is empty the private area is not mounted at all — a plain
 * clone of the repo exposes no management route.
 */
const RAW = (import.meta.env.VITE_ADMIN_PATH as string | undefined) ?? '';

export const ADMIN_PATH = RAW.trim().replace(/^\/+|\/+$/g, '').toLowerCase();

export const ADMIN_ENABLED = ADMIN_PATH.length > 0;

/** Absolute URL of the private area, handy for bookmarks. */
export const ADMIN_URL = `/${ADMIN_PATH}`;
