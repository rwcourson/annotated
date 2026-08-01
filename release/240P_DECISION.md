Status: unresolved

# YouTube 240p delivery gate

The contest explicitly requires video clips to be delivered at 240p, below 480p. The current implementation guarantees a 426×240 player and a maximum 90-second playback window, but the supported YouTube iframe API does not guarantee the adaptive stream rendition selected by YouTube.

Do not change the status to `verified` until one of these is true:

1. The contest organizer confirms in writing that a 426×240 embedded player satisfies the requirement; attach or link that confirmation here.
2. A production transcoding pipeline creates a genuine 240p derivative, stores it durably, and network/media inspection proves the delivered asset is 240p. This path also requires a documented source-rights and YouTube-policy decision.

Evidence:

- Pending.
