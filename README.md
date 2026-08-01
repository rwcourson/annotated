# annotated

Clip the web. Annotate reality.

A Chrome sidebar extension + web app for clipping and annotating media from anywhere on the web — YouTube videos (≤90s), news article passages, and podcast audio (≤90s) — with your commentary attached, always linking back to the original source. Annotations live on public landing pages and a social feed where people follow each other and comment. Built to the [annotated.com bounty spec](https://annotated.lovable.app/).

## Repo layout

- `web/` — Next.js 15 app (App Router, TypeScript, Tailwind, Prisma, Auth.js). SQLite is the local default; a prepared Postgres schema targets Neon in production, and recorded audio switches to Vercel Blob. See `web/README.md`.
- `extension/` — Manifest V3 Chrome extension (no build step). The side panel is the primary surface: capture clips/highlights from any tab, record audio commentary, publish, and browse the feed. See `extension/README.md`.

## Quick start

1. **Web app**

   ```bash
   cd web
   npm install
   npx prisma migrate dev   # creates prisma/dev.db
   npm run seed             # demo users + annotations (prints a demo API token)
   npm run dev              # http://localhost:3000
   ```

   Sign in with the dev **Demo sign in** on `/signin` (no OAuth keys needed locally), or set `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` / `AUTH_TWITTER_ID` / `AUTH_TWITTER_SECRET` in `web/.env` for real X/Google OAuth (see `web/.env.example`).

2. **Extension**

   - `chrome://extensions` → Developer mode → **Load unpacked** → select `extension/`. The extension defaults to `https://annotated-web-2026.vercel.app`; change the service URL under Settings when developing locally.
   - Click the toolbar icon to open the side panel → **Connect account**. Sign in on the web page; the one-time, nonce-protected handoff reconnects the sidebar automatically. Manual token entry remains available under **Manual setup** for recovery.
   - On any page: select text → right-click → "Annotate selection with annotated", or open the panel and use the Clip tab. On YouTube, use the "Now" buttons to set clip start/end (90s max is enforced).

## Contest readiness

The implemented behavior and the remaining deployment/submission gates are tracked in [`ACCEPTANCE.md`](./ACCEPTANCE.md). Local acceptance covers the sidebar capture flow, source attribution, 90-second enforcement, public social surfaces, comments, follows, claims, commentary, and account handoff. Production OAuth credentials and callbacks are configured. Durable hosted storage, deployed OAuth verification, and a physical unpacked-extension pass remain open until Neon and Blob are provisioned and the final environment exists.

## Design

Light editorial system shared by web and extension: PP Mori variable type, warm-white canvas, crisp black typography, and a restrained family of generated coral, peach, butter, lilac, and ultramarine raster fields. Product controls remain quiet and functional; the color fields are reserved for major narrative moments.
