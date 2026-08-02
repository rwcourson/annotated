"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  FileText,
  Highlighter,
  MessageSquareText,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    id: "source",
    label: "Open a source",
    title: "Stay on the page you are already reading or watching.",
    body: "Annotated opens in Chrome’s side panel, so the article, video, or podcast never leaves view.",
    detail: "Article · YouTube · Podcast",
    icon: FileText,
    marker: "Source found",
  },
  {
    id: "moment",
    label: "Choose the moment",
    title: "Keep the exact passage or timestamp, not a vague bookmark.",
    body: "Highlight article text or set the beginning and end of a media clip. Video and audio stay inside the 90-second limit.",
    detail: "Passage or ≤90 second clip",
    icon: Highlighter,
    marker: "Moment selected",
  },
  {
    id: "note",
    label: "Add your take",
    title: "Say why it matters in text, in your voice, or both.",
    body: "Your commentary sits beside the saved moment instead of getting separated in a notes app or group chat.",
    detail: "Text + recorded audio",
    icon: MessageSquareText,
    marker: "Context added",
  },
  {
    id: "publish",
    label: "Publish with context",
    title: "Share one clean page with the original source still attached.",
    body: "Every annotation gets a public page for conversation, follows, comments, sharing, and a visible fair-use claim path.",
    detail: "Public · source-linked · discussable",
    icon: Radio,
    marker: "Ready to share",
  },
] as const;

export default function HowItWorks() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = STEPS[activeIndex];

  return (
    <section id="how-it-works" className="scroll-mt-24 bg-[var(--ink)] py-16 text-white sm:py-24">
      <div className="page-wrap">
        <div className="grid gap-8 border-b border-white/15 pb-10 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/52">How it works</p>
            <h2 className="mt-5 max-w-[9ch] text-[clamp(3rem,7vw,6.8rem)] font-medium leading-[.88] tracking-[-0.075em]">
              From source to shared thought.
            </h2>
          </div>
          <div className="max-w-xl lg:justify-self-end">
            <p className="text-lg leading-[1.45] tracking-[-0.025em] text-white/74 sm:text-xl">
              Four small moves. One continuous trail back to the thing that made you stop.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/48">
              {['No tab switching', 'No lost timestamps', 'No source-less screenshots'].map((item) => (
                <span key={item} className="inline-flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#ff806b]" />{item}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:gap-12">
          <div role="tablist" aria-label="Annotation workflow" className="grid content-start gap-2">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const selected = index === activeIndex;
              return (
                <button
                  key={step.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls="workflow-panel"
                  onClick={() => setActiveIndex(index)}
                  className={`group grid min-h-[74px] w-full grid-cols-[40px_1fr_auto] items-center gap-3 rounded-[16px] px-3 text-left transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff806b] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ink)] sm:px-4 ${selected ? "bg-white text-[var(--ink)]" : "text-white/62 hover:bg-white/[.07] hover:text-white"}`}
                >
                  <span className={`grid h-10 w-10 place-items-center rounded-full ${selected ? "bg-[#f2eeeb] text-[var(--action-dark)]" : "bg-white/[.08] text-white/70"}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{step.label}</span>
                    <span className={`mt-1 block text-xs ${selected ? "text-[var(--muted-ink)]" : "text-white/38"}`}>{step.detail}</span>
                  </span>
                  <span className={`h-2 w-2 rounded-full transition ${selected ? "bg-[var(--action)]" : "bg-white/15 group-hover:bg-white/35"}`} />
                </button>
              );
            })}
          </div>

          <div id="workflow-panel" role="tabpanel" className="relative min-h-[570px] overflow-hidden rounded-[28px] bg-[#f3efff] text-[var(--ink)] sm:min-h-[620px]">
            <Image
              src="/art/pixel-depth-hq.webp"
              alt=""
              fill
              unoptimized
              sizes="(min-width: 1024px) 700px, calc(100vw - 3rem)"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.06),rgba(16,22,45,.12))]" />

            <div className="absolute inset-x-4 top-4 overflow-hidden rounded-[22px] bg-white shadow-[0_34px_80px_-40px_rgba(24,25,62,.7)] ring-1 ring-black/[.06] sm:inset-x-8 sm:top-8">
              <div className="flex h-10 items-center gap-2 border-b border-black/[.07] px-4">
                <span className="h-2 w-2 rounded-full bg-[#ff8f79]" />
                <span className="h-2 w-2 rounded-full bg-[#f2ca70]" />
                <span className="h-2 w-2 rounded-full bg-[#86cfac]" />
                <span className="ml-auto rounded-full bg-[var(--soft)] px-3 py-1 text-[8px] font-semibold uppercase tracking-[.12em] text-[var(--muted-ink)]">Chrome side panel</span>
              </div>
              <div className="relative aspect-[1.64/1] min-h-[220px] bg-[#f8f7f5]">
                <Image
                  key={active.id}
                  src={activeIndex < 2 ? "/screenshots/annotated-sidebar.png" : "/screenshots/annotated-annotation.png"}
                  alt={activeIndex < 2 ? "Annotated Chrome sidebar capture interface" : "A published Annotated page with commentary and source context"}
                  fill
                  unoptimized
                  sizes="(min-width: 1024px) 620px, calc(100vw - 5rem)"
                  className="object-cover object-top"
                />
                <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-[var(--ink)] px-3 py-2 text-[10px] font-semibold text-white shadow-lg sm:bottom-4 sm:left-4">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ff806b]" />
                  {active.marker}
                </div>
              </div>
            </div>

            <div className="absolute inset-x-4 bottom-4 rounded-[22px] bg-white/94 p-6 shadow-[0_25px_60px_-35px_rgba(19,20,46,.72)] backdrop-blur-sm sm:inset-x-8 sm:bottom-8 sm:p-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--action-dark)]">{active.label}</p>
              <h3 className="mt-3 max-w-[19ch] text-[clamp(1.65rem,3vw,2.65rem)] font-medium leading-[1] tracking-[-0.055em]">{active.title}</h3>
              <p className="mt-4 max-w-[58ch] text-sm leading-[1.6] text-[var(--muted-ink)]">{active.body}</p>
              <div className="mt-6 flex items-center justify-between gap-4">
                <div className="flex gap-1.5" aria-label={`Step ${activeIndex + 1} of ${STEPS.length}`}>
                  {STEPS.map((step, index) => <span key={step.id} className={`h-1.5 rounded-full transition-all ${index === activeIndex ? "w-7 bg-[var(--action)]" : "w-1.5 bg-black/15"}`} />)}
                </div>
                {activeIndex < STEPS.length - 1 ? (
                  <button type="button" onClick={() => setActiveIndex((current) => current + 1)} className="text-action text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--action)] focus-visible:ring-offset-4">
                    Next step <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <Button size="sm" asChild><Link href="/connect">Open the sidebar <ArrowRight /></Link></Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
