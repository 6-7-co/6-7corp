# 6-7 Corporation

The website of **6-7 Corporation** — a warm, near-black corporate site built as a
React SPA on top of a small Fastify API, with bilingual (RU / EN) copy served
straight from the database.

Design language: soft geometric sans (Onest + Manrope, full Cyrillic support),
generous whitespace, large corner radii, thin organic line art in the background
and one restrained iridescent accent. Motion is calm and editorial — masked line
reveals, scroll-fades and a floating glass navigation pill — rather than glitchy
or busy.

---

## Tech stack

| Layer     | Choice |
|-----------|--------|
| Frontend  | React 19 · Vite 6 · TypeScript · Tailwind CSS v4 · Framer Motion |
| Markdown  | **[@ovelwe/z-md](https://github.com/ovelwe/z-md)** (XSS-safe rendering + custom image support) |
| Backend   | Fastify 5 · PostgreSQL/Neon in production, SQLite locally (same SQL, parameterised) |
| Security  | bcrypt password hashes · server-side sessions · CSRF double-submit cookies · CSP · rate limiting |
| Media     | Magic-byte-validated uploads → Vercel Blob in production, `server/uploads` locally |
| Hosting   | Vercel (Hobby) + Neon Free, or a single Docker container |

## Features

- **Homepage** — typographic hero with masked line reveals, iridescent accent
  word, slowly drifting organic line art, client wordmarks and a soft neutral
  statistics card. Plus about, capabilities, work, team, journal preview and a
  contact CTA.
- **Working section navigation** — every nav/footer/anchor link scrolls to its
  section (with header offset and retry-on-mount), including cross-page hashes
  such as `/#work`.
- **Theme switcher** — dark / light toggle; the whole UI is driven by themeable
  CSS variables.
- **Public pages** — project detail, journal list/detail, contact form.
- **Bilingual UI** — English / Русский with a language switcher.
- **Auto-translate** — contact messages are translated through Google Translate
  (public `gtx` endpoint, no API key) and stored next to the original.
- **Content from the API** — company info, hero copy, contacts, client list and
  the statistics card are read from `GET /api/settings`.

## Getting started

```bash
npm install          # installs client + server workspaces
npm run seed         # create the baseline content from server/src/seed-data.json
npm run dev:server   # API on http://localhost:3001
npm run dev:client   # site on http://localhost:5173 (proxies /api + /uploads)
```

Open <http://localhost:5173>. Without `DATABASE_URL` everything runs offline on
SQLite in `server/data/app.db`.

## Configuration

`.env.example` is the template — copy it to `.env` (git-ignored) or paste the
values into your host.

| Variable | Notes |
|----------|-------|
| `DATABASE_URL` | Postgres/Neon connection string. Empty → local SQLite. |
| `JWT_SECRET` | Session signing secret, ≥ 32 characters in production. |
| `SESSION_DAYS` | Session lifetime, default `14`. |
| `VITE_ADMIN_PATH` | Build-time path of the private content area. No default is shipped — set your own value and keep it out of the repository. |
| `HOST` / `PORT` | Server bind, default `0.0.0.0:3001` (ignored on Vercel). |
| `CLIENT_ORIGIN` | Allowed CORS origin; not needed when site and API share a domain. |
| `BLOB_READ_WRITE_TOKEN` | Added automatically by the Vercel Blob integration. |

`VITE_ADMIN_PATH` is baked into the bundle: change it and rebuild.

## Content

`server/src/seed-data.json` holds the baseline content (settings, posts,
projects, team) applied by `npm run seed` on a new machine or a fresh database.

```bash
npm run seed:dump            # export the current database → server/src/seed-data.json
npm run seed                 # apply the file — skips silently if content exists
SEED_FORCE=1 npm run seed    # overwrite settings + upsert content
SEED_RESET=1 npm run seed    # wipe posts/projects/team first, then import
```

Matching rules: posts and projects by `slug`, team members by `name`. Settings
are overwritten by the file. Nothing is deleted without `SEED_RESET=1`.

## Deploy to Vercel + Neon (free)

Static SPA on Vercel + one serverless function for `/api`, the database in Neon
Postgres and images in Vercel Blob. No CORS, no extra servers: the API lives on
the same domain.

### 1. Neon

1. <https://neon.tech> → sign up → **Create project**.
2. **Region: Frankfurt (eu-central-1)** — match the Vercel region (`fra1`).
3. Copy the **pooled** connection string
   (`postgresql://…?sslmode=require`).

```bash
export DATABASE_URL='postgresql://…'        # PowerShell: $env:DATABASE_URL='…'

npm run db:push                             # create the schema
npm run db:import:reset                     # import seed-data.json (wipes content in Neon only)
npm run admin:set -- <login> '<password>'   # credentials for the private area
```

### 2. Vercel

1. <https://vercel.com/new> → import the GitHub repo.
2. Framework preset: **Other**. Build settings come from `vercel.json`.
3. **Storage → Blob → Create** — `BLOB_READ_WRITE_TOKEN` is added automatically.
4. **Settings → Environment Variables** (Production + Preview):

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | Neon pooled connection string |
   | `JWT_SECRET` | `openssl rand -hex 32` |
   | `VITE_ADMIN_PATH` | your own unguessable path, no slashes |
   | `SESSION_DAYS` | `14` (optional) |

5. Deploy.

Content added through the site is stored in Neon and survives redeploys;
`seed` / `db:import` are never run on deploy and only overwrite on request.

### 3. Custom domain

Vercel → **Settings → Domains → Add**, then at the registrar set
`A @ → 76.76.21.21` (or the CNAME Vercel shows). TLS is issued automatically.

### 4. Existing local images

```bash
BLOB_READ_WRITE_TOKEN='vercel_blob_rw_…' DATABASE_URL='postgresql://…' npm run media:push
```

### Local development against Neon (optional)

```bash
DATABASE_URL='postgresql://…' npm run dev:server
```

## Docker (production)

A single process serves the built client, the API and `/uploads` from one port
with one CSP. SQLite data and uploads are persisted on bind mounts.

```bash
VITE_ADMIN_PATH=my-private-panel docker compose up --build -d   # http://localhost:3001
docker compose logs -f app
```

## Useful scripts

| Command | What it does |
|---------|--------------|
| `npm run db:push` | create/refresh the schema (SQLite or `DATABASE_URL`) |
| `npm run seed:dump` | export current DB content → `server/src/seed-data.json` |
| `npm run seed` | apply `seed-data.json` (safe: skips if content exists) |
| `SEED_RESET=1 npm run seed` | wipe content, then import the file |
| `npm run db:import:reset` | force import `seed-data.json` into `DATABASE_URL` |
| `npm run admin:set -- <login> <password> [old-login]` | set account credentials, drop all sessions |
| `npm run media:push` | copy `server/uploads` → Vercel Blob and rewrite URLs |
| `npm run build:api` | bundle the serverless function into `api/` |

## Security posture

- **SQL injection** — every query uses bound parameters (`?`); user input is
  never interpolated into SQL.
- **XSS** — markdown is rendered by z-md which escapes HTML; image `src` values
  are allowlisted; React escapes text by default; CSP via Helmet + a strict
  `<meta>` CSP.
- **CSRF** — double-submit cookie on every mutating request.
- **Auth** — bcrypt (cost 12) hashes, `HttpOnly` + `SameSite=strict` cookies,
  server-side session table with expiry.
- **Rate limiting** — global, plus a stricter limiter on the login route.
- **Uploads** — MIME allowlist + magic-byte sniff, 6 MB cap, randomised
  filenames, path-traversal-safe deletion.
- **No defaults in the repository** — no management route and no credentials are
  shipped; both must be supplied through environment variables.

## Project layout

```
client/    React SPA (pages, sections, components)
server/    Fastify API (routes, security, db, seed)
  src/lib/db.ts        SQLite ⇄ Postgres (Neon) driver switch
  src/lib/storage.ts   local uploads ⇄ Vercel Blob
  src/seed-data.json   baseline content for new installs
api/       Vercel serverless entry (`_handler.ts`, bundled to `[...path].js`)
scripts/   build helpers (serverless bundle)
uploads/   local media library (gitignored, runtime data)
```

## Notes

- The Google Translate call happens **client-side** from the browser, so it
  needs outbound access to `translate.googleapis.com`. If it is blocked, the
  form still submits the original text.
- `node:sqlite` is an experimental Node API (Node ≥ 22.5). It emits an
  experimental warning — that is expected.
