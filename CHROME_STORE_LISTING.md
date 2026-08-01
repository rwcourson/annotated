# Chrome Web Store listing draft

## Name

Annotated — clip the web with context

## Summary

Save an article passage or a short video or podcast moment, add your note, and publish it with the original source attached.

## Detailed description

Annotated opens beside the page you are already reading or watching. Highlight an article passage, mark a short media window, then add text or record a voice note. Your annotation becomes a public, source-linked page that others can discuss.

The sidebar supports:

- article passages with title, author, date, and source URL;
- YouTube and podcast windows up to 90 seconds;
- text and recorded-audio commentary;
- a public feed, profiles, follows, and comments;
- a visible fair-use claim process on every annotation.

Annotated only captures a page when you choose to use it. Published annotations always link back to the original source.

## Category

Productivity

## Required listing values before publication

- Production homepage URL
- Public privacy-policy URL (`/privacy`)
- Support email
- 128×128 extension icon
- At least one 1280×800 or 640×400 store screenshot
- Final ZIP from `node scripts/release-extension.mjs --site-url=https://...`

## Prepared assets

- ZIP: `release/annotated-extension-v0.1.0.zip`
- Homepage screenshot: `release/screenshots/annotated-home-1280x800.png`
- Feed screenshot: `release/screenshots/annotated-feed-1280x800.png`
- Icon: `extension/icons/icon128.png`

## Single purpose

Annotated lets a user deliberately clip a selected passage or short media moment from the current page, add commentary, and publish a source-linked annotation.

## Permission justifications

- `sidePanel`: keeps the clipping interface beside the source page.
- `activeTab`, `tabs`, and `scripting`: reads the active page's URL, metadata, selection, and media state when the user opens or invokes Annotated.
- `contextMenus`: exposes the “Annotate selection” action for highlighted text.
- `storage`: retains the selected service URL and the user's connected-account token locally.
- `audioCapture`: records optional spoken commentary only after the user presses Record and grants microphone access.
- `<all_urls>` host access: allows the same user-initiated capture workflow to work on articles and media sites across the web, and allows communication with the user-configured Annotated service.

Annotated does not collect browsing history, run advertising, or capture page contents in the background.
