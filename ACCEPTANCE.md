# Acceptance Spec

> Reference: [annotated.com contest brief](https://annotated.lovable.app/)
> Last updated: 2026-08-01
> Status: ready-for-audit

## Summary

Annotated is a Chrome side-panel product for clipping an article passage, a YouTube moment, or a podcast segment; adding text or recorded-audio commentary; and publishing a source-linked public annotation into a social feed. Contest readiness means every official functional requirement works in a real browser, the extension and web account are joined safely, and production data survives deployment.

## Areas

- Chrome sidebar and source capture
- Account connection and OAuth
- Article, YouTube, and podcast clips
- Public annotations and provenance
- Social feed, profiles, follows, and comments
- Claims and commentary
- Visual system and responsive behavior
- Production deployment and submission

## Checklist

| ID | Priority | Area | Feature | Expected behavior | Verification | Status |
|----|----------|------|---------|-------------------|--------------|--------|
| A01 | P0 | Extension | Primary side-panel surface | Toolbar action opens the Manifest V3 side panel, with Clip, Feed, and Settings flows | `node extension/test/smoke.mjs` — manifest and referenced-file checks | pass |
| A02 | P0 | Capture | Article passage and metadata | Selected text, title, site, byline, publish date, and canonical source are captured | `extension/content.js`; `manual: select article text → Grab passage` | pass |
| A03 | P0 | Capture | YouTube clip | Start/end timestamps publish a clip no longer than 90 seconds and the delivered video is actually 240p (<480p) | `extension/test/smoke.mjs`; physical playback/network inspection or a real transcode probe | partial |
| A04 | P0 | Capture | Podcast/audio clip | Original page remains attributed while the detected audio stream plays only inside the chosen ≤90-second window | `curl: POST /api/annotations with sourceUrl + mediaUrl`; rendered annotation player check | pass |
| A05 | P0 | Provenance | Original source link | Every public annotation exposes a direct original-source link | `browser: /a/{id} → View original source` | pass |
| A06 | P0 | Claims | File a claim | Every annotation detail page exposes a working claim form | `curl: POST /api/annotations/{id}/claim` → 201; rendered-page check | pass |
| A07 | P0 | Commentary | Text and recorded audio | Publisher can attach text, recorded audio, or both | `web/components/MicRecorder.tsx`; `extension/sidepanel.js`; upload route validation | pass |
| A08 | P0 | Social | Public feed and profiles | Signed-out visitors can browse annotations and user profiles | `curl: GET /api/feed`; `browser: /feed and /u/{username}` | pass |
| A09 | P0 | Social | Follow and comment | Signed-in user can toggle a follow and publish a comment | `curl: POST /api/follows` toggle; `POST /api/annotations/{id}/comments` → 201 | pass |
| A10 | P0 | Account | Sidebar account handoff | Web sign-in returns to `/connect`, validates a one-time nonce, stores the token, and displays the connected user | `extension/test/smoke.mjs` — service-worker handoff VM; `curl: /connect redirect + /api/extension/me` | pass |
| A11 | P0 | Auth | Google/X-only production signup | Production has working Google and X credentials and redirect URLs; demo credentials remain development-only | `manual: deploy → sign in once with Google and once with X` | partial |
| A12 | P0 | Production | Durable database and audio storage | Accounts, annotations, follows, comments, claims, and recorded commentary persist across deploys/restarts | `manual: publish → redeploy → verify annotation and audio` | prepared |
| A13 | P0 | Extension | Physical Chrome end-to-end | Loaded-unpacked/sidebar build captures one real article, YouTube clip, and podcast segment, records commentary, publishes, and reconnects after restart | `manual: Chrome acceptance journey on release package` | missing |
| A14 | P1 | Design | Shared system | Web and extension use the established PP Mori, warm-white, coral/lilac/cobalt raster, rounded-control system | `browser: desktop homepage + 380px sidebar visual pass` | pass |
| A15 | P1 | Responsive | Desktop and mobile | Homepage and public social surfaces have no horizontal overflow and preserve hierarchy | `browser: 1440×960 and 390×844; mobile overflow = 0` | pass |
| A16 | P1 | Motion | Loading, navigation, tabs, and hovers | Logo loader resolves into hero; nav contracts on scroll; segmented controls slide; buttons have visible hover/focus/press states | `browser: nav 1216×64 → 1024×56; manual reduced-motion pass` | pass |
| A17 | P1 | Sharing | Favicon and link preview | Logo mark appears as favicon and generated social preview is declared for Open Graph and X | `web/app/layout.tsx`; `web/app/icon.*`; `web/public/social/annotated-link-preview.png` | pass |
| A18 | P1 | Product story | Homepage accurately explains tool | Hero identifies the Chrome sidebar and uses real Chrome captures of the side panel, feed, and annotation page rather than a reconstructed product mockup | `browser: homepage + web/public/screenshots/annotated-{sidebar,feed,annotation}.png` | pass |
| A19 | P2 | Distribution | Store/submission package | Release ZIP, privacy disclosure, screenshots, canonical production URL, demo video, entrant name, X handle, site link, and public contest entry are complete | `manual: Chrome Web Store checklist + annotated.lovable.app/enter` | partial |

## Audit log

| Date | Auditor | P0 pass | P1 pass | Notes |
|------|---------|---------|---------|-------|
| 2026-08-01 | Codex | 9/13 + 2 partial | 5/5 | Google and X apps, credentials, and production callbacks are configured; exact local callback checks are still propagating/failing and are not counted as pass. Neon/Postgres and Vercel Blob paths are prepared but deliberately unprovisioned. The production-stamped ZIP and real 1280×800 release screenshots are ready. Actual YouTube stream quality cannot be forced through the supported iframe API, so the 240px player remains partial pending organizer confirmation. |

## Sign-off

- [ ] All P0 rows are `pass`
- [x] No P0 row is `visual-only`
- [x] Verification commands were run (listed below)

**Commands run:**

```text
node extension/test/smoke.mjs                          # 77 passed, 0 failed
node scripts/release-extension.mjs --site-url=https://annotated-social.vercel.app
unzip -p release/annotated-extension-v0.1.0.zip ...   # production URL confirmed
node --check extension/{sidepanel,background,content}.js
cd web && npx prisma generate && npx prisma migrate deploy
cd web && npx tsc --noEmit
cd web && npm run build                               # production build passed
curl POST /api/annotations                            # sourceUrl + mediaUrl, 90s → 201
curl POST /api/annotations                            # 91s → 400
curl POST /api/annotations/{id}/comments              # 201
curl POST /api/annotations/{id}/claim                 # 201
curl POST /api/follows                                # toggle verified
browser: desktop/mobile homepage and annotation detail
Chrome: captured the real side panel, feed, and annotation detail for the homepage
Chrome: rechecked the live contest brief and /enter submission fields
Chrome: configured Google/X production callbacks; callback completion still pending
```
