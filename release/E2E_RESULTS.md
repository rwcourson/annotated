# Physical Chrome release journey

Run with the unpacked directory `release/annotated-extension-v0.1.0/` against the deployed production site.

- [ ] Google sign-in completes and reconnects the sidebar
- [ ] X sign-in completes and reconnects the sidebar
- [ ] Article selection captures passage, title, byline, date, and source URL
- [ ] Article annotation publishes and opens its original source
- [ ] YouTube start/end capture enforces a maximum 90-second window
- [ ] YouTube delivery satisfies the approved 240p evidence in `240P_DECISION.md`
- [ ] Podcast capture publishes a maximum 90-second audio window
- [ ] Text commentary publishes
- [ ] Recorded commentary uploads and plays after a page reload
- [ ] Public feed, profile, follow, and comment actions work
- [ ] File a claim is visible and submits on every annotation type
- [ ] Closing and reopening Chrome preserves the connected account

Record the browser version, extension version, production URL, date, and any evidence links below.

## Release environment

- Date: August 1, 2026
- Browser: Google Chrome 150.0.7871.188
- Extension: Annotated 0.1.0
- Staged directory: `release/annotated-extension-v0.1.0/`
- Production URL: `https://annotated-social.vercel.app`
- Google web login: verified; provider account persisted in Neon
- X web login: verified; provider account persisted in Neon
- Sidebar load/reconnect and capture journey: pending the manual `chrome://extensions` load step
