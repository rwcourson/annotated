import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MAX_CLIP_SECONDS = 90;

export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Extract a YouTube video id from watch / youtu.be / shorts / embed URLs. */
export function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") {
      return u.pathname.slice(1).split("/")[0] || null;
    }
    if (u.hostname.endsWith("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      const m = u.pathname.match(/^\/(shorts|embed|live)\/([^/?]+)/);
      if (m) return m[2];
    }
  } catch {
    /* fall through */
  }
  return null;
}

/**
 * Validate a clip window. Returns an error message, or null when valid.
 * Rule: endSec - startSec must be >= 1 and <= 90.
 */
export function clipWindowError(
  startSec: unknown,
  endSec: unknown
): string | null {
  if (
    typeof startSec !== "number" ||
    typeof endSec !== "number" ||
    !Number.isInteger(startSec) ||
    !Number.isInteger(endSec)
  ) {
    return "startSec and endSec are required integers for video/audio clips";
  }
  if (startSec < 0) return "startSec must be >= 0";
  const len = endSec - startSec;
  if (len < 1) return "clip must be at least 1 second (endSec > startSec)";
  if (len > MAX_CLIP_SECONDS)
    return `clip must be ${MAX_CLIP_SECONDS} seconds or less`;
  return null;
}

export function formatSeconds(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function timeAgo(date: Date | string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
}
