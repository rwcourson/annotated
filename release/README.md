# Annotated release bundle

Prepared August 1, 2026.

## Extension

- `annotated-extension-v0.1.0.zip`
- Production service: `https://annotated-web-2026.vercel.app`
- SHA-256: `c23de7466ff4dedf0805474acd50d1be3c6f5814f2fe8af5959d83d0bfa4e51d`

The unpacked equivalent is in `annotated-extension-v0.1.0/`.

## Real release screenshots

- `screenshots/annotated-home-1280x800.png`
- `screenshots/annotated-feed-1280x800.png`

Both screenshots were captured from the running application in Chrome and cropped to the Chrome Web Store's 1280×800 listing size. They are not reconstructed UI mockups.

## Still required

Do not upload or submit this bundle until the production site is deployed, OAuth is verified on the live domain, the privacy contact is filled in, and the staged extension completes the physical Chrome journey in `SUBMISSION_CHECKLIST.md`.

Run `node scripts/release-preflight.mjs` from the repository root for the authoritative machine-readable gate. A failing exit code is expected while hosted services, physical E2E, the demo video, or 240p evidence are missing.
