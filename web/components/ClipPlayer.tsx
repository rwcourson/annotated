"use client";

import { useRef } from "react";
import { formatSeconds, youtubeId } from "@/lib/utils";

/**
 * Renders a clip window-enforcing player.
 * - YouTube: iframe embed constrained via start/end params.
 * - Direct video/audio URLs: HTML5 player that seeks to startSec on load and
 *   pauses at endSec (enforced client-side via timeupdate).
 */
export default function ClipPlayer({
  type,
  sourceUrl,
  mediaUrl,
  startSec,
  endSec,
}: {
  type: "video" | "audio";
  sourceUrl: string;
  mediaUrl?: string | null;
  startSec: number;
  endSec: number;
}) {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);
  const playbackUrl = mediaUrl || sourceUrl;

  const ytId = type === "video" ? youtubeId(sourceUrl) : null;

  if (ytId) {
    // YouTube removed support for forcing stream quality in 2019. Keep the
    // official player policy-compliant and constrain the presentation to a
    // maximum 426×240 viewport instead of pretending `vq=small` is enforced.
    const src = `https://www.youtube.com/embed/${ytId}?start=${startSec}&end=${endSec}&rel=0&playsinline=1`;
    return (
      <div className="max-w-[426px] overflow-hidden rounded-[18px] bg-zinc-950 shadow-[0_18px_44px_-30px_rgba(0,0,0,.55)]">
        <div className="aspect-video w-full">
          <iframe
            src={src}
            title="YouTube clip"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  function handleLoadedMetadata() {
    const el = mediaRef.current;
    if (el && el.currentTime < startSec) el.currentTime = startSec;
  }

  function handlePlay() {
    const el = mediaRef.current;
    if (el && (el.currentTime < startSec || el.currentTime >= endSec - 0.25)) {
      el.currentTime = startSec;
    }
  }

  function handleTimeUpdate() {
    const el = mediaRef.current;
    if (el && el.currentTime >= endSec) {
      el.pause();
      el.currentTime = startSec;
    }
  }

  const handlers = {
    onLoadedMetadata: handleLoadedMetadata,
    onPlay: handlePlay,
    onTimeUpdate: handleTimeUpdate,
  };

  return (
    <div className={type === "video" ? "surface max-w-[426px] p-3" : "surface p-4"}>
      {type === "video" ? (
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          src={playbackUrl}
          controls
          preload="metadata"
          className="aspect-video w-full rounded-[13px] bg-zinc-950"
          {...handlers}
        />
      ) : (
        <audio
          ref={mediaRef as React.RefObject<HTMLAudioElement>}
          src={playbackUrl}
          controls
          preload="metadata"
          className="w-full"
          {...handlers}
        />
      )}
      <p className="mt-3 text-xs font-medium text-[var(--muted-ink)]">
        Playing clip {formatSeconds(startSec)} → {formatSeconds(endSec)} (
        {formatSeconds(endSec - startSec)})
      </p>
    </div>
  );
}
