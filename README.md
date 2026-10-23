# 6-7 Corporation

A black-and-white, motion-heavy corporate website for **6-7 Corporation** with a
full admin CMS, secure API and automatic Google Translate for messages.

Built to look deliberately *not* like a stock AI website: kinetic typography,
a live particle field, floating wireframe geometry, magnetic buttons, tilt
cards and a monochrome design system.

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

- **Homepage** — animated hero with a live **3D object** (React Three Fiber:
  wireframe icosahedron shell + crystal core + orbiting rings + sparkles,
  tilts toward the cursor), a canvas particle network, floating wireframe
  geometry, scramble text, glitch monogram, parallax, count-up stats and
  marquee. Plus about, services, projects, team, journal preview, contact CTA.
- **Theme switcher** — dark / light toggle; the whole UI is driven by
  themeable CSS variables (black/white in both directions).
- **Public pages** — project detail, journal list/detail, contact form.
- **Bilingual UI** — English / Русский with a language switcher.
- **Auto-translate** — contact messages are translated through Google Translate
  (public `gtx` endpoint, no API key) and stored alongside the original.
- **Admin CMS** (`/admin`, default `admin` / `admin12345`):
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

Then open `http://localhost:5173`. Sign in at `/admin` with
`admin` / `admin12345` (override via `ADMIN_USER` / `ADMIN_PASSWORD`).

For production, set a strong `JWT_SECRET` (≥ 32 chars) and
`CLIENT_ORIGIN`, see `.env.example`.

## Docker (production)

A single process serves the built client, the API and `/uploads` from one
port with one CSP. SQLite data and uploads are persisted on bind mounts.

```bash
docker compose up --build -d      # http://localhost:3001
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
