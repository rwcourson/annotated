# annotated — Chrome extension

Clip and annotate media from any website — article passages, YouTube videos (≤90s), podcast audio (≤90s) — add text or recorded-audio commentary, and publish to your public annotated feed. Every annotation links back to its source.

Manifest V3, no build step: plain JS/HTML/CSS, loads unpacked directly. The primary surface is the **side panel**.

## Load it

1. Start the web app locally at `http://localhost:3000`, or use the production service at `https://annotated-social.vercel.app`.
2. Open `chrome://extensions` in Chrome.
3. Toggle **Developer mode** (top right).
4. Click **Load unpacked** and select this `extension/` directory.
5. Click the **annotated** toolbar icon — the side panel opens.

## Connect your account

1. In the panel, open the **Settings** tab.
2. Click **Connect or switch account**. The extension creates a one-time connection request and opens `{baseUrl}/connect`.
3. Sign in with Google or X. If sign-in is required, the callback returns to the same connection request.
4. The web page hands access back to the extension automatically. The panel verifies the token and shows the linked profile.

Manual URL/token entry remains available under **Manual setup** as a recovery path. The token is stored in `chrome.storage.local`; the public Feed tab remains available before connection.

## Demo flow

- **Article**: open any news article, highlight a passage → the panel (or right-click → *Annotate selection with annotated*) pre-fills the quote. Title/site/author/published are auto-detected from page metadata and editable. Add commentary, optionally record an audio note, hit **Publish annotation** → success screen with **View annotation ↗**.
- **YouTube**: open a watch URL — the panel detects `video` mode. Press **Now** next to Start/End while the video plays to stamp timestamps. The live indicator shows `Clip: Ns / 90s` and turns red (blocking submit) past 90 seconds; **90s max** clamps the range.
- **Podcast/audio**: any page with a prominent `<audio>` element is detected as `audio` mode, same 90-second flow.

The **Feed** tab shows the latest public annotations from `GET {baseUrl}/api/feed`.

## API contract

| Call | Purpose |
| --- | --- |
| `POST {baseUrl}/api/upload` `{ dataUrl }` → `{ url }` | audio commentary upload (base64 data URL) |
| `POST {baseUrl}/api/annotations` (Bearer token) | create annotation; body: `{ type, sourceUrl, mediaUrl?, title, siteName?, author?, publishedAt?, quote?, startSec?, endSec?, comment?, commentAudioUrl? }` → `{ annotation: { id, … } }`. `sourceUrl` always identifies the original page; `mediaUrl` optionally carries its detected direct audio/video stream. |
| `GET {baseUrl}/api/feed` | public feed |
| `GET {baseUrl}/api/extension/me` (Bearer token) | verify token + linked profile |
| `{baseUrl}/connect` | token page (opened in a tab) |
| `{baseUrl}/a/{id}` | public annotation page ("View annotation") |

## Files

- `manifest.json` — MV3, side panel + content script registration.
- `background.js` — service worker: panel-on-action-click, selection context menu, message relay.
- `content.js` — page capture: `GET_SELECTION`, `GET_PAGE_META`, `GET_MEDIA_STATE`.
- `sidepanel.html/css/js` — the panel UI (Clip / Feed / Settings).
- `shared.js` — pure logic shared with the tests: `mm:ss` parsing, 90s validation, type detection, API paths.
- `icons/` — glowing-orb PNGs (regenerate with `node scripts/make-icons.mjs`).
- `test/smoke.mjs` — manifest + logic + API-contract smoke test.

## Development checks

```sh
node --check background.js && node --check content.js && node --check sidepanel.js && node --check shared.js
node test/smoke.mjs
```

Note on permissions: `audioCapture` is declared in addition to the core set so the in-panel mic recorder (`getUserMedia` + `MediaRecorder`) works without a prompt Chrome can't render inside a side panel.
