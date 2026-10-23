/**
 * The admin panel lives on a non-obvious, configurable path so it is not
 * discoverable from the public site (no nav link, no footer link, no sitemap).
 *
 * Override it per deployment with `VITE_ADMIN_PATH=/your-secret-path`.
 * Only share the URL with people who should be able to sign in.
 */
const RAW = (import.meta.env.VITE_ADMIN_PATH as string | undefined) || 'studio-6-7';

export const ADMIN_PATH = RAW.replace(/^\/+|\/+$/g, '').toLowerCase();

/** Absolute URL of the panel, handy for bookmarks. */
export const ADMIN_URL = `/${ADMIN_PATH}`;
