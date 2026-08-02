Status: verified

# YouTube 240p delivery decision

Annotated delivers YouTube clips through the official YouTube iframe in an exact
426×240 viewport and enforces a hard maximum clip length of 90 seconds. This is
the strongest production implementation available through YouTube's supported
embed API without downloading or modifying a third party's video.

## Production evidence

- Physical Chrome test date: August 1, 2026
- Published annotation: `https://annotated-social.vercel.app/a/cmsb44r1e0005jn04jfir42pl`
- Measured iframe bounding box in the live DOM: `426×240`
- Delivered embed URL: `https://www.youtube.com/embed/aircAruvnKk?start=0&end=90&rel=0&playsinline=1`
- A `0:00`–`2:00` range was visibly rejected with `Clips are limited to 90 seconds.`
- The `90s max` control clamped the range to `0:00`–`1:30`, after which the annotation published successfully.
- The public annotation visibly labels the media as a `240px player` and links back to the original YouTube source.

## Platform constraint and interpretation

YouTube controls the adaptive stream rendition inside its player. Its current
IFrame Player API documents `setPlaybackQuality` as a no-op, so Annotated cannot
truthfully force or inspect the internal rendition selected for each viewer:

- https://developers.google.com/youtube/iframe_api_reference#october-24,-2019

YouTube's developer-policy guidance also prohibits downloading or modifying
arbitrary third-party videos into a separate derivative:

- https://developers.google.com/youtube/terms/developer-policies-guide

The implemented contest interpretation is therefore an exact 240-pixel-high
official player with a server-validated 90-second window. It is visually and
functionally verified in production while remaining inside YouTube's supported
delivery model.

## Organizer contact

Robert directed that the organizer question not be sent and that the best
working implementation be used. The previously prepared Gmail draft is
abandoned and must not be sent.
