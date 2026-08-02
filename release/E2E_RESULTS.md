# Physical Chrome release journey

Run with the unpacked directory `release/annotated-extension-v0.1.0/` against the deployed production site.

- [x] Google sign-in completes and reconnects the sidebar
- [ ] X sign-in completes and reconnects the sidebar
- [x] Article selection captures passage, title, byline, date, and source URL
- [x] Article annotation publishes and opens its original source
- [x] YouTube start/end capture enforces a maximum 90-second window
- [x] YouTube delivery satisfies the approved 240p evidence in `240P_DECISION.md`
- [x] Podcast capture publishes a maximum 90-second audio window
- [x] Text commentary publishes
- [x] Recorded commentary uploads and plays after a page reload
- [x] Public feed, profile, follow, and comment actions work
- [ ] File a claim is visible and submits on every annotation type
- [x] Closing and reopening the sidebar preserves the connected account

Record the browser version, extension version, production URL, date, and any evidence links below.

## Release environment

- Date: August 1, 2026
- Browser: Google Chrome 150.0.7871.188
- Extension: Annotated 0.1.0
- Staged directory: `release/annotated-extension-v0.1.0/`
- Production URL: `https://annotated-social.vercel.app`
- Google web login: verified; provider account persisted in Neon
- X web login: verified; provider account persisted in Neon
- Sidebar load/reconnect and capture journey: verified with the unpacked staged extension (`gobodbhafgpjpcijabmilpdbgpnlpblj`)

## Evidence

- Article annotation: `https://annotated-social.vercel.app/a/cmsb3vjfj0003jn0444p3su95`
- YouTube annotation: `https://annotated-social.vercel.app/a/cmsb44r1e0005jn04jfir42pl`
- NASA audio annotation with recorded commentary: `https://annotated-social.vercel.app/a/cmsb56yy30001l904s2u9gixd`
- YouTube player measured in the live DOM at `426 × 240`; the extension rejected a two-minute selection and accepted the 90-second maximum.
- NASA source detected as audio despite Chrome rendering the standalone WAV with a video element. The published page loaded the 36-second source and 28.5-second recorded note to ready state.
- After a full page reload, both audio URLs were unchanged and ready. The recorded note is hosted in Vercel Blob.
- A production comment posted successfully and the conversation count updated from 0 to 1.
- File a claim is visibly present on article, video, and audio annotation pages. Submission remains intentionally unchecked until the claim workflow is exercised end to end.
- Google and X web sign-ins were verified against production and persisted in Neon. Google was also verified through the physical sidebar connection flow; X-through-sidebar remains unchecked.
