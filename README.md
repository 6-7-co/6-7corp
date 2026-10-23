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
| Backend  | Fastify 5 · Node `node:sqlite` (parameterised queries) |
| Auth     | bcrypt password hashes · JWT sessions · CSRF double-submit cookies |
| Media    | Streamed, magic-byte-validated image uploads |

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
npm run seed                 # upsert by slug/name — keeps extra rows you added later
SEED_RESET=1 npm run seed    # wipe posts/projects/team first, then import the file
```

Matching rules: posts and projects by `slug`, team members by `name`. Settings
are overwritten by the file. `SEED_RESET=1` is what you want when the database
still holds old demo content.

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
uploads/   media library (gitignored, runtime data)
```

## Notes

- The Google Translate call happens **client-side** from the browser, so it
  needs outbound access to `translate.googleapis.com`. If it is blocked, the
  form still submits the original text (graceful fallback).
- `node:sqlite` is an experimental Node API (Node ≥ 22.5). It emits an
  experimental warning — that is expected.
