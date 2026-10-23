# 6-7 Corporation

A warm, near-black corporate website for **6-7 Corporation** with a full admin
CMS, secure API and automatic Google Translate for messages.

Design language: soft geometric sans (Onest + Manrope, full Cyrillic support),
generous whitespace, large corner radii, thin organic line art in the
background and one restrained iridescent accent. Motion is calm and editorial —
masked line reveals, scroll-fades, a floating glass navigation pill and a
pastel statistics card — rather than glitchy or busy.

---

## Tech stack

| Layer    | Choice |
|----------|--------|
| Frontend | React 19 · Vite 6 · TypeScript · Tailwind CSS v4 · Framer Motion |
| Markdown | **[@ovelwe/z-md](https://github.com/ovelwe/z-md)** (XSS-safe rendering + custom image support) |
| Backend  | Fastify 5 · PostgreSQL/Neon in production, SQLite locally (same SQL, parameterised) |
| Auth     | bcrypt password hashes · JWT sessions · CSRF double-submit cookies |
| Media    | Magic-byte-validated uploads → Vercel Blob in production, `server/uploads` locally |
| Hosting  | Vercel (Hobby) + Neon Free, or a single Docker container |

## Features

- **Homepage** — typographic hero with masked line reveals, iridescent accent
  word, slowly drifting organic line art, client wordmarks and a pastel stats
  card. Plus about, capabilities, work, team, journal preview and contact CTA.
- **Working section navigation** — every nav/footer/anchor link scrolls to its
  section (with header offset and retry-on-mount), including cross-page hashes
  such as `/#work`.
- **Theme switcher** — dark / light toggle; the whole UI is driven by
  themeable CSS variables (black/white in both directions).
- **Public pages** — project detail, journal list/detail, contact form.
- **Bilingual UI** — English / Русский with a language switcher.
- **Auto-translate** — contact messages are translated through Google Translate
  (public `gtx` endpoint, no API key) and stored alongside the original.
- **Admin CMS on a hidden route** (`/studio-6-7` by default — configurable via
  `VITE_ADMIN_PATH`, never linked from the public site; default credentials
  `admin` / `admin12345`, change them in `.env`):
  - Write journal posts in **Markdown** with live preview + image uploads
  - Add / edit / delete **projects** (cover, client, year, tags, link, body)
  - Manage **team** members (photo, role, bio, socials, ordering)
  - Edit all **site content** — company info, hero copy, email, location,
    Telegram/GitHub links, the **client list** and the **stats card**
    (RU/EN with one-click machine translation)
  - Read / delete **contact messages** (with translations)
  - **Media library** to browse, copy URLs and delete uploads

## Editing content

Everything a non-developer is likely to change lives in the admin panel →
**Настройки** (`/studio-6-7/settings`):

| Block | What it controls |
|-------|------------------|
| Компания | company name, email, tagline, description |
| Первый экран | hero eyebrow, three headline lines, description, "trusted by" label |
| Контакты | location, Telegram link, GitHub link |
| Клиенты и партнёры | the client wordmarks under the hero |
| Цифры на главной | the 3-number card under the hero |

Every text field has two slots (RU / EN). Write in one language and press the
`⇄ EN` / `⇄ RU` button — the other one is filled by Google Translate. Nothing
needs to be written twice.

Content is stored in SQLite and served via `GET /api/settings`, so edits appear
on the site immediately after saving — no rebuild, no deploy.

The card under the hero is styled by `.stat-card` in `client/src/index.css`;
its two soft glows are the `--card-glow-a` / `--card-glow-b` CSS variables.

## Seeding content (`seed-data.json`)

`server/src/seed-data.json` is the baseline content applied by `npm run seed`
on a new machine or a fresh database. It contains settings, posts, projects and
team members — never admins, messages or secrets.

After editing content in the admin panel, export your local database back into
that file so everyone else (and production) gets your real content:

```bash
npm run seed:dump            # writes server/src/seed-data.json from server/data/app.db
git add server/src/seed-data.json && git commit -m "Update seed content"
```

Applying it:

```bash
npm run seed                 # fresh DB only — skips silently if content already exists
SEED_FORCE=1 npm run seed    # overwrite settings + upsert content in an existing DB
SEED_RESET=1 npm run seed    # wipe posts/projects/team first, then import the file
```

`npm run seed` is safe by default: if the database already contains posts,
projects, team members or settings (i.e. you have edited content in the admin
panel), it only refreshes the admin password and leaves your content alone.
Nothing is ever deleted without `SEED_RESET=1`.

Matching rules: posts and projects by `slug`, team members by `name`. Settings
are overwritten by the file. `SEED_RESET=1` is what you want when the database
still holds old demo content.

## Deploy to Vercel + Neon (free)

The app runs as **static SPA on Vercel + one serverless function for `/api`**,
with the database in **Neon Postgres** and images in **Vercel Blob**. No CORS,
no extra servers: the API is served from the same domain under `/api`.

### 1. Neon (database)

1. <https://neon.tech> → sign up (GitHub login works) → **Create project**.
2. **Region: Frankfurt (eu-central-1)** — match the Vercel region (`fra1`).
3. Copy the connection string (it looks like
   `postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require`).

Locally, apply the schema and push your content into Neon:

```bash
export DATABASE_URL='postgresql://…'        # Windows PowerShell: $env:DATABASE_URL='…'

npm run db:push                             # create tables
npm run seed:dump                           # (if needed) export your local SQLite content → seed-data.json
npm run db:import -- --reset                # import seed-data.json into Neon
ADMIN_USER=my-login ADMIN_PASSWORD='long-secret' npm run admin:set
```

`db:import --reset` wipes posts/projects/team **in Neon only** — your local
SQLite file is never touched. `admin:set` creates the admin with a bcrypt hash
and invalidates every session.

### 2. Vercel (site + API)

1. <https://vercel.com/new> → import the GitHub repo.
2. Framework preset: **Other**. Build/output settings come from `vercel.json`:
   - Build command `npm run build:vercel` (client bundle + serverless bundle)
   - Output directory `client/dist`
3. **Storage → Blob → Create** (free tier) — this adds `BLOB_READ_WRITE_TOKEN`
   automatically.
4. **Settings → Environment Variables** (Production + Preview):

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | Neon pooled connection string |
   | `JWT_SECRET` | `openssl rand -hex 32` |
   | `VITE_ADMIN_PATH` | your secret admin path, e.g. `panel-7x2` (no slashes) |
   | `ADMIN_USER` / `ADMIN_PASSWORD` | only needed if you run `db:import`/`admin:set` from CI |
   | `SESSION_DAYS` | `14` (optional) |

   `VITE_ADMIN_PATH` is baked into the bundle at build time — change it and
   redeploy, then use `https://your-domain/<path>`.

5. Deploy, open the site, sign in at `/<VITE_ADMIN_PATH>`.

> **Important:** any content you add in the admin panel on Vercel lives in
> Neon. `npm run seed` / `db:import` are *not* run on every deploy and never
> overwrite existing rows unless you pass `--reset`/`SEED_RESET=1`.

### 3. Custom domain

Vercel → Project → **Settings → Domains → Add**: enter your domain, then at the
registrar set `A  @ → 76.76.21.21` or the CNAME Vercel shows. TLS is issued
automatically.

If the site must be reachable from Russia without a VPN, point the domain at
Vercel but keep in mind that some ISPs throttle the Vercel edge; the API is on
a custom domain too, so cookies keep working either way.

### 4. Moving images to Blob

Local uploads live in `server/uploads`. Upload them once and rewrite the URLs
stored in the database:

```bash
BLOB_READ_WRITE_TOKEN='vercel_blob_rw_…' DATABASE_URL='postgresql://…' npm run media:push
```

### Local development against Neon (optional)

```bash
DATABASE_URL='postgresql://…' npm run dev:server   # uses Postgres instead of SQLite
```

Without `DATABASE_URL` everything keeps working offline with SQLite in
`server/data/app.db`, so the two modes can coexist.

### Useful scripts

| Command | What it does |
|---------|--------------|
| `npm run db:push` | create/refresh the schema (SQLite or `DATABASE_URL`) |
| `npm run seed:dump` | export current DB content → `server/src/seed-data.json` |
| `npm run seed` | apply `seed-data.json` (safe: skips if content exists) |
| `SEED_RESET=1 npm run seed` | wipe content then import the file |
| `npm run db:import -- --reset` | force import `seed-data.json` into `DATABASE_URL` |
| `npm run admin:set -- <login> <password> [old-login]` | change admin credentials, kill sessions |
| `npm run media:push` | copy `server/uploads` → Vercel Blob and rewrite URLs |
| `npm run build:api` | bundle the serverless function into `api/` |

## Security posture

- **SQL injection** — every query uses bound parameters (`?`); user input is
  never interpolated into SQL.
- **XSS** — markdown is rendered by z-md which escapes all HTML; image `src`
  values are allowlisted; React escapes text by default; CSP headers via
  Helmet + a strict `<meta>` CSP.
- **CSRF** — double-submit cookie on every mutating request.
- **Auth** — bcrypt (cost 12) password hashing, JWT in `HttpOnly` +
  `SameSite=strict` cookies, server-side session table with expiry.
- **Rate limiting** — global + stricter limiter on `/api/login`.
- **Uploads** — MIME allowlist + magic-byte sniff, 6 MB cap, randomised
  filenames, path-traversal-safe deletion.

## Getting started

```bash
npm install          # installs client + server workspaces
npm run seed         # create admin + apply content from server/src/seed-data.json
npm run dev:server   # API on http://localhost:3001
npm run dev:client   # site on http://localhost:5173 (proxies /api + /uploads)
```

Then open `http://localhost:5173`. The admin panel is **not linked** anywhere
on the public site — open `http://localhost:5173/studio-6-7` directly and sign
in with `admin` / `admin12345` (override via `ADMIN_USER` / `ADMIN_PASSWORD`).

To use your own secret path, set it before building/starting the dev server
(Vite reads `.env` from the repo root):

```bash
VITE_ADMIN_PATH=my-private-panel npm run dev:client
VITE_ADMIN_PATH=my-private-panel npm run build:client
```

Whatever you pick, bookmark it — there is no link to the panel from the site.

For production, set a strong `JWT_SECRET` (≥ 32 chars) and
`CLIENT_ORIGIN`, see `.env.example`.

## Docker (production)

A single process serves the built client, the API and `/uploads` from one
port with one CSP. SQLite data and uploads are persisted on bind mounts.

```bash
VITE_ADMIN_PATH=my-private-panel docker compose up --build -d   # http://localhost:3001
docker compose logs -f app        # logs
```

The image builds the client in a multi-stage build and runs the Fastify
server (`npm -w server run start`). The server serves `client/dist`, so no
separate static server or database service is needed.

## Project layout

```
client/    React SPA (pages, sections, components, admin CMS)
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
  form still submits the original text (graceful fallback).
- `node:sqlite` is an experimental Node API (Node ≥ 22.5). It emits an
  experimental warning — that is expected.
