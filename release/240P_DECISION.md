Status: blocked-platform-conflict

# YouTube 240p delivery gate

The contest explicitly requires video clips to be delivered at 240p, below 480p. The current implementation guarantees a 426×240 player and a maximum 90-second playback window, but the supported YouTube iframe API does not guarantee the adaptive stream rendition selected by YouTube.

Google's current IFrame Player API reference states that `getPlaybackQuality`, `setPlaybackQuality`, and `getAvailableQualityLevels` are no longer supported. Calls to `setPlaybackQuality` are no-ops and suggested quality values are ignored:

- https://developers.google.com/youtube/iframe_api_reference#october-24,-2019

Google's developer-policy guidance also says API clients must not let users download videos for offline playback or modify the audio or video portions of a YouTube video. That prevents Annotated from silently downloading and transcoding arbitrary third-party YouTube videos into its own 240p derivative:

- https://developers.google.com/youtube/terms/developer-policies-guide

Do not change the status to `verified` until one of these is true:

1. The contest organizer confirms in writing that a 426×240 embedded player satisfies the requirement; attach or link that confirmation here.
2. A production transcoding pipeline creates a genuine 240p derivative, stores it durably, and network/media inspection proves the delivered asset is 240p. This path also requires a documented source-rights and YouTube-policy decision.

Evidence:

- The production annotation player renders at 426×240 and enforces `endSeconds - startSeconds <= 90`.
- The supported YouTube player cannot force or report the adaptive rendition selected for a viewer.
- A server-side download/transcode path would conflict with the cited YouTube developer-policy guidance for arbitrary third-party videos.

Organizer question, ready to send:

> The official YouTube iframe API no longer supports forcing playback quality—`setPlaybackQuality` is a documented no-op—and YouTube policy prohibits downloading or modifying arbitrary videos into our own derivative. Annotated uses the official embed in a 426×240 player and enforces a hard 90-second start/end window. Does that satisfy the bounty's “240p (<480p)” requirement, or is the bounty intentionally requiring a separate rights-cleared transcoding pipeline?

## Organizer-contact status

- Recipient confirmed from LAUNCH's public privacy page: `contact@launch.co`
- Gmail draft prepared August 1, 2026: `r-970337874464916880`
- Send status: **not sent**; requires Robert's explicit approval
- Gate remains blocked until LAUNCH replies in writing or a compliant, rights-cleared transcoding path is implemented and verified
