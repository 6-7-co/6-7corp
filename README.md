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
  - Edit **company settings**
  - Read / delete **contact messages** (with translations)
  - **Media library** to browse, copy URLs and delete uploads

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
npm run seed         # create admin + sample content (idempotent)
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
