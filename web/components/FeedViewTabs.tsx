"use client";

import Link from "next/link";

export type FeedView = "discover" | "latest" | "following";

const VIEWS: { value: FeedView; label: string }[] = [
  { value: "discover", label: "Discover" },
  { value: "latest", label: "Latest" },
  { value: "following", label: "Following" },
];

export default function FeedViewTabs({
  value,
  isAuthed,
}: {
  value: FeedView;
  isAuthed: boolean;
}) {
  const activeIndex = VIEWS.findIndex((view) => view.value === value);

  return (
    <nav aria-label="Feed view" className="relative grid w-full grid-cols-3 overflow-hidden rounded-full bg-[var(--soft)] p-1 sm:w-[360px]">
      <span
        aria-hidden
        className="segment-thumb pointer-events-none absolute bottom-1 left-1 top-1 w-[calc((100%_-_0.5rem)/3)] rounded-full bg-white shadow-[0_6px_18px_-14px_rgba(35,29,26,.55)] transition-transform"
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      />
      {VIEWS.map((view) => (
        <Link
          key={view.value}
          href={view.value === "following" && !isAuthed ? "/signin" : `/feed?view=${view.value}`}
          aria-current={value === view.value ? "page" : undefined}
          className={`relative z-10 flex min-h-10 items-center justify-center rounded-full px-3 text-sm font-semibold transition-[color,background-color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cobalt)] focus-visible:ring-offset-1 active:scale-[0.96] ${value === view.value ? "text-[var(--ink)]" : "text-[var(--muted-ink)] hover:bg-black/[0.035] hover:text-[var(--ink)]"}`}
        >
          {view.label}
        </Link>
      ))}
    </nav>
  );
}
