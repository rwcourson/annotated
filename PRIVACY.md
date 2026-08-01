# Annotated privacy disclosure

Last updated: August 1, 2026

Annotated is a Chrome side-panel extension and public web application for saving a selected article passage or a short media moment with the user's own commentary.

## Information Annotated processes

- Account profile information supplied by Google or X when a user chooses that sign-in method.
- The page URL, title, site name, selected passage, author, publication date, and media timestamps a user chooses to publish.
- Text comments and optional recorded-audio commentary submitted by the user.
- Follows, comments, fair-use claims, and other actions the user takes in the public product.
- A locally stored extension connection token and the configured Annotated site URL.

## Why permissions are requested

- `sidePanel`: shows Annotated beside the current page.
- `activeTab`, `tabs`, and `scripting`: reads the current page only when needed to identify its URL, metadata, selected text, and media state.
- `contextMenus`: adds “Annotate selection with annotated” to the page context menu.
- `storage`: keeps the user's account connection and extension settings on their device.
- `audioCapture`: lets the user record optional spoken commentary after they press the recording control.
- Host access: lets the extension work on pages the user chooses across the web and communicate with the configured Annotated service.

## Storage and sharing

Published annotations, profiles, comments, and follows are public by design. Recorded commentary is stored in managed object storage. Account and application data are stored in the production database. Annotated does not sell personal information or use browsing history for advertising. It does not collect page contents in the background; capture is initiated by the user.

## Retention and deletion

Content remains available until it is deleted or the service is discontinued. Before public launch, the production deployment must provide a support address for deletion and privacy requests. Fair-use disputes can be submitted from the visible “File a claim” action on every annotation page.

## Contact

Replace this section with the production support email before publishing the extension or submitting the contest entry.
