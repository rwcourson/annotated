# annotated — web

A social annotation/clipping platform. Every annotation is a real clip from
the web — a YouTube moment (≤90s, policy-compliant 240px player), an article passage, or a podcast
segment — plus your commentary, always linked back to the original source.

Next.js (App Router) · TypeScript · Tailwind · shadcn/ui · Prisma (SQLite locally,
Neon Postgres prepared for production) · Auth.js v5. Light editorial design: warm-white canvas, PP Mori variable type,
crisp black typography, and restrained coral, lilac, butter, and ultramarine art fields.

## Setup

```bash
cd web
npm install          # also runs prisma generate
npx prisma migrate dev   # creates prisma/dev.db (first run: name it e.g. "init")
npm run seed         # demo users, annotations, comments, follows + demo token
npm run dev          # http://localhost:3000 (auto-picks a free port if taken)
npm run build        # production build / type check
```

Copy `.env.example` to `.env` (a working `.env` with a dev `AUTH_SECRET` is
already included for local use).

## Auth

Production sign-in is **OAuth only** — Google and X (Twitter), via Auth.js
v5 + Prisma adapter:

| Env var | Purpose |
| --- | --- |
| `AUTH_SECRET` | JWT/session secret (`openssl rand -base64 32`) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth client |
| `AUTH_TWITTER_ID` / `AUTH_TWITTER_SECRET` | X OAuth client |
| `DATABASE_URL` | `file:./dev.db` (SQLite) |

OAuth providers are registered only when their env keys are set. OAuth
redirect URIs for local dev:
`http://127.0.0.1:3000/api/auth/callback/google` and
`http://127.0.0.1:3000/api/auth/callback/twitter`. Start the app and open it on
that exact host; X does not accept `localhost` as a local callback hostname.

**Demo sign in (dev only):** when `NODE_ENV === "development"`, `/signin`
also offers a demo credentials provider — type any username (3–20 chars,
`a-z0-9_`) to pick-or-create a local user. No keys needed; the whole app is
usable end-to-end this way. The provider is not registered in production.

Sessions are JWT (so the credentials provider works); OAuth users still get
Prisma `Account` rows and an auto-generated `username` handle.

## Chrome extension auth

The sidebar opens `/connect` with a one-time nonce. After sign-in, `/connect`
lazily creates the personal API token and sends it to the extension through a
nonce-protected content-script handoff. The token can still be copied from the
manual recovery area when automatic pairing is unavailable.

Every mutating / "me"-scoped API route accepts **either** the Auth.js session
cookie **or** `Authorization: Bearer <token>` (shared helper:
`lib/auth-api.ts` → `getAuthUser(request)`).

**Demo Bearer token** (seeded, belongs to `@ada`, re-created by `npm run seed`):

```
annotated-demo-token-9f2c7a41e83b
```

```bash
curl -X POST http://localhost:3000/api/annotations \
  -H "Authorization: Bearer annotated-demo-token-9f2c7a41e83b" \
  -H "Content-Type: application/json" \
  -d '{"type":"video","sourceUrl":"https://www.youtube.com/watch?v=aircAruvnKk","title":"Great moment","startSec":612,"endSec":690,"comment":"watch this"}'
```

## API contract

- `GET /api/feed` → `{ annotations: [...] }` newest first; each item has all
  annotation fields plus `author {id, username, name, image}` and
  `counts {comments, followers, claims}`. Note: the article byline (DB column
  `author`) is serialized as `articleAuthor`; `author` is the annotating user.
- `POST /api/annotations` (auth) — body `{ type, sourceUrl, mediaUrl?, title, siteName?,
  author?, publishedAt?, quote?, startSec?, endSec?, comment?, commentAudioUrl? }`.
  Validates: `type` ∈ article|video|audio, `sourceUrl` is a valid http(s) URL,
  `title` non-empty; `mediaUrl`, when present, is the detected direct stream
  while `sourceUrl` remains the attributed original page. For video/audio,
  `startSec`/`endSec` are required ints
  with `1 ≤ endSec - startSec ≤ 90`. → `201 { annotation }`.
- `GET /api/annotations/[id]` → `{ annotation }` incl. author, comments (with
  authors), and claim count.
- `POST /api/annotations/[id]/comments` (auth) — `{ text }` → `{ comment }`.
- `POST /api/annotations/[id]/claim` (auth optional) — `{ reason, contact? }`,
  the "File a claim" fair-use dispute endpoint → `{ claim }`.
- `POST /api/follows` (auth) — `{ userId }`, toggles → `{ following }`.
- `POST /api/upload` (auth) — `{ dataUrl }` base64 audio (webm/ogg/mp3/wav/m4a),
  ≤5MB → `{ url }`. Development saves to `public/uploads/`. Production uploads
  to Vercel Blob and returns `503` if `BLOB_READ_WRITE_TOKEN` is absent, so it
  never pretends ephemeral filesystem storage is durable.
- `GET /api/extension/token` (session cookie only) → `{ token }`, creates one
  if missing. Backs the `/connect` page.

## Pages

- `/` — landing: product-first Chrome-sidebar hero, live capture preview,
  source types, workflow, social proof, contest requirements, and CTAs.
- `/feed` — public social feed (type badge, quote/clip meta, text+audio
  commentary, author row with follow, comment count, "View source ↗").
- `/a/[id]` — annotation detail: YouTube iframe constrained via start/end
  params; direct audio/video via an HTML5 player that seeks to `startSec` and
  pauses at `endSec`; article quote block + metadata card; provenance strip
  ("240px player · ≤90s clip · fair use") for video; always-visible source link;
  commentary; comments thread; author card with follow; **File a claim**
  button + modal.
- `/u/[username]` — profile with follow/unfollow and annotation grid.
- `/new` — create form mirroring the extension flow, ≤90s client+server
  validation, MediaRecorder mic → `/api/upload`.
- `/connect` — extension API token + copy button + install instructions.
- `/signin` — Google / X buttons (when configured) + dev demo sign in.

## Notes & decisions

- Clip enforcement: no server-side transcoding. YouTube clips are enforced
  via embed `start`/`end` params in a 426×240 maximum viewport. The supported
  YouTube iframe API does not guarantee stream rendition quality; direct media
  URLs are enforced client-side by the HTML5 player. The
  ≤90s rule is also enforced at the API.
- Seed data is fictional demo content (sample bylines/quotes) with two real,
  well-known YouTube videos so embeds actually play.
- `npm run seed` is idempotent: it wipes and recreates dev data, and prints
  the demo Bearer token.
