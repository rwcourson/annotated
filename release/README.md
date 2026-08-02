# Annotated release bundle

Prepared August 1, 2026.

## Extension

- `annotated-extension-v0.1.0.zip`
- Production service: `https://annotated-social.vercel.app`
- SHA-256: `6f4528dea20513fd93e7b43c93678d2e32e211c8a64a95efac2a66dd49ab2b86`

The unpacked equivalent is in `annotated-extension-v0.1.0/`.

## Real release screenshots

- `screenshots/annotated-home-1280x800.png`
- `screenshots/annotated-feed-1280x800.png`

Both screenshots were captured from the running application in Chrome and cropped to the Chrome Web Store's 1280×800 listing size. They are not reconstructed UI mockups.

## Still required

Do not upload or submit this bundle until OAuth is verified on the live domain, the privacy and claim path is verified publicly, and the staged extension completes the physical Chrome journey in `SUBMISSION_CHECKLIST.md`.

Run `node scripts/release-preflight.mjs` from the repository root for the authoritative machine-readable gate. A failing exit code is expected while hosted services, physical E2E, the demo video, or 240p evidence are missing.
