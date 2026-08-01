# Annotated contest submission checklist

Run `node scripts/release-preflight.mjs` before any deployment review or submission. It intentionally exits nonzero until every production gate has real evidence.

## Production

- [x] Neon/Postgres Prisma schema and provider switch prepared (`web/prisma/schema.neon.prisma`)
- [x] Production audio route prepared for Vercel Blob with an explicit failure when storage is absent
- [ ] Neon project created and `DATABASE_PROVIDER` / `DATABASE_URL` set
- [ ] Vercel Blob store created and `BLOB_READ_WRITE_TOKEN` set
- [x] `AUTH_SECRET`, Google OAuth, and X OAuth production credentials set on the Vercel project
- [x] Google and X production callbacks registered for `https://annotated-web-2026.vercel.app`
- [ ] Complete one successful Google and X sign-in after provider callback changes propagate
- [ ] Canonical HTTPS site deployed (`NEXT_PUBLIC_SITE_URL` / `AUTH_URL` are already set)
- [ ] Database initialized with `npm run neon:push`
- [ ] Publish, redeploy, and confirm annotation plus recorded audio persist

## Extension

- [x] Build final ZIP with `node scripts/release-extension.mjs --site-url=https://...`
- [x] Set the extension source and packaged default to `https://annotated-web-2026.vercel.app`
- [x] Prepare real 1280×800 homepage and feed screenshots in `release/screenshots/`
- [ ] Load the staged release directory unpacked in Chrome
- [ ] Complete article, YouTube, and podcast journeys
- [ ] Record commentary and confirm reconnect after restarting Chrome
- [ ] Add production support email to `PRIVACY.md` and publish `/privacy`
- [ ] Obtain organizer confirmation that a policy-compliant 426×240 YouTube embed satisfies the “under 480p” requirement; the official iframe API cannot force stream rendition quality

## Contest entry

- [ ] Record and upload the public demo video using `DEMO_SCRIPT.md`
- [ ] Entrant name
- [ ] X handle
- [ ] Production site link
- [ ] Public demo video link
- [ ] Submit at https://annotated.lovable.app/enter
