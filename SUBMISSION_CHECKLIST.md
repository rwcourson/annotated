# Annotated contest submission checklist

Run `node scripts/release-preflight.mjs` before any deployment review or submission. It intentionally exits nonzero until every production gate has real evidence.

## Production

- [x] Neon/Postgres Prisma schema and provider switch prepared (`web/prisma/schema.neon.prisma`)
- [x] Production audio route prepared for Vercel Blob with an explicit failure when storage is absent
- [x] Neon project created and `DATABASE_PROVIDER` / `DATABASE_URL` set
- [x] Vercel Blob store created and `BLOB_READ_WRITE_TOKEN` set
- [x] `AUTH_SECRET`, Google OAuth, and X OAuth production credentials set on the Vercel project
- [x] Add Google and X production callbacks for `https://annotated-social.vercel.app`
- [x] Complete one successful Google and X sign-in on the canonical production domain
- [x] Canonical HTTPS site deployed at `https://annotated-social.vercel.app`
- [x] Database initialized with the Postgres Prisma schema
- [x] Redeploy and confirm Neon annotations plus Blob-hosted recorded audio persist

## Extension

- [x] Build final ZIP with `node scripts/release-extension.mjs --site-url=https://...`
- [x] Set the extension source and packaged default to `https://annotated-social.vercel.app`
- [x] Prepare real 1280×800 homepage and feed screenshots in `release/screenshots/`
- [ ] Load the staged release directory unpacked in Chrome
- [ ] Complete article, YouTube, and podcast journeys
- [ ] Record commentary and confirm reconnect after restarting Chrome
- [x] Publish the privacy disclosure with the annotation-specific claim and removal-request path
- [ ] Obtain organizer confirmation that a policy-compliant 426×240 YouTube embed satisfies the “under 480p” requirement; the official iframe API cannot force stream rendition quality

## Contest entry

- [ ] Record and upload the public demo video using `DEMO_SCRIPT.md`
- [x] Entrant name
- [x] X handle
- [x] Production site link
- [ ] Public demo video link
- [ ] Submit at https://annotated.lovable.app/enter
