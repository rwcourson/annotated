"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, AudioLines, Link2, Play, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import Orb from "@/components/Orb";

const MODES = {
  article: {
    label: "Article",
    source: "The Signal / how ideas travel",
    title: "Highlight a passage",
    detail: "The context is not extra. It is the part that makes the annotation useful.",
  },
  video: {
    label: "Video",
    source: "YouTube / a conversation worth keeping",
    title: "Mark the exact window",
    detail: "00:48 → 01:32 · 44 seconds · 240px player",
  },
  audio: {
    label: "Podcast",
    source: "Signal FM / episode 42",
    title: "Pull out one thought",
    detail: "14:20 → 15:14 · 54 seconds",
  },
} as const;

type Mode = keyof typeof MODES;

export default function CapturePreview() {
  const [mode, setMode] = useState<Mode>("article");
  const item = MODES[mode];
  const activeIndex = (Object.keys(MODES) as Mode[]).indexOf(mode);

  return (
    <div className="self-end overflow-hidden rounded-[24px] border border-white/85 bg-white/90 shadow-[0_30px_80px_-48px_rgba(46,25,20,.55)] backdrop-blur-xl lg:self-center">
      <div className="flex items-center justify-between border-b hairline px-5 py-4 sm:px-7">
        <div className="flex items-center gap-2.5">
          <Orb size={22} />
          <div><p className="text-sm font-semibold tracking-[-0.035em]">annotated</p><p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.11em] text-[var(--muted-ink)]">Chrome side panel</p></div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border hairline bg-white px-2.5 py-1.5 text-[10px] font-medium text-[var(--muted-ink)]"><span className="h-1.5 w-1.5 rounded-full bg-[#67aa68]" /> Connected as @ada</span>
      </div>

      <div className="p-5 sm:p-7">
        <div className="mb-4 flex items-center gap-3 rounded-[14px] bg-[#f1efff] p-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-white text-xs font-bold text-[var(--action-dark)] shadow-sm">{item.source.charAt(0)}</span>
          <div className="min-w-0 flex-1"><p className="eyebrow">Current source</p><p className="mt-1 truncate text-xs font-semibold text-[var(--ink)]">{item.source}</p></div>
          <span className="hidden text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--cobalt)] sm:block">Source attached</span>
        </div>
        <div className="relative grid grid-cols-3 overflow-hidden rounded-full bg-[var(--soft)] p-1" role="tablist" aria-label="Annotation type">
          <span
            aria-hidden
            className="segment-thumb pointer-events-none absolute bottom-1 left-1 top-1 w-[calc((100%_-_0.5rem)/3)] rounded-full bg-white shadow-[0_6px_18px_-14px_rgba(35,29,26,.55)] transition-transform"
            style={{ transform: `translateX(${activeIndex * 100}%)` }}
          />
          {(Object.keys(MODES) as Mode[]).map((key) => (
            <button key={key} type="button" role="tab" aria-selected={mode === key} onClick={() => setMode(key)} className={`relative z-10 min-h-9 rounded-full px-3 py-2 text-xs font-semibold transition-[color,background-color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cobalt)] focus-visible:ring-offset-1 active:scale-[0.96] ${mode === key ? "text-[var(--ink)]" : "text-[var(--muted-ink)] hover:bg-black/[0.035] hover:text-[var(--ink)]"}`}>
              {MODES[key].label}
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-[16px] border hairline bg-[#faf9f8] p-4">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[var(--action-dark)] shadow-sm">{mode === "article" ? <Quote className="h-4 w-4" /> : mode === "video" ? <Play className="h-4 w-4 fill-current" /> : <AudioLines className="h-4 w-4" />}</span>
            <div className="min-w-0"><p className="truncate text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted-ink)]">{item.source}</p><h3 className="mt-2 text-xl font-medium tracking-[-0.045em] text-[var(--ink)]">{item.title}</h3><p className="mt-3 text-sm leading-relaxed text-[var(--muted-ink)]">{item.detail}</p></div>
          </div>
        </div>

        <div className="mt-5">
          <label className="eyebrow" htmlFor="hero-commentary">Your commentary</label>
          <textarea id="hero-commentary" defaultValue="This is the moment I want to bring into the conversation." className="mt-2 min-h-24 w-full resize-none rounded-[14px] border hairline bg-white p-4 text-sm leading-relaxed text-[var(--ink)] outline-none transition focus:border-[var(--cobalt)] focus:ring-2 focus:ring-[var(--lilac)]/40" />
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button size="lg" asChild className="flex-1">
            <Link href="/connect">Publish from the sidebar <ArrowRight /></Link>
          </Button>
          <span className="inline-flex items-center justify-center gap-1.5 text-[10px] text-[var(--muted-ink)]"><Link2 className="h-3.5 w-3.5" /> Original URL included</span>
        </div>
      </div>
    </div>
  );
}
