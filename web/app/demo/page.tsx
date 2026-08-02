import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const fallbackVideoUrl =
  "https://fczubz6n6ecakkyv.public.blob.vercel-storage.com/demo/annotated-bounty-demo.mp4";

export const metadata: Metadata = {
  title: "One-minute product demo",
  description:
    "See Annotated capture a moment from the web, add context, and publish it with the original source attached.",
  openGraph: {
    title: "Annotated in one minute",
    description:
      "A quick walkthrough of the Chrome sidebar for clipping and discussing the web.",
    url: "/demo",
  },
};

export default function DemoPage() {
  const videoUrl = process.env.DEMO_VIDEO_URL || fallbackVideoUrl;

  return (
    <div className="page-wrap py-10 sm:py-14">
      <Link
        href="/"
        className="text-action inline-flex items-center gap-2 text-sm font-semibold"
      >
        <ArrowLeft className="h-4 w-4" /> Back home
      </Link>

      <section className="relative mt-8 overflow-hidden rounded-[28px] bg-[#15131a] px-4 pb-5 pt-10 text-white shadow-[0_36px_90px_-48px_rgba(30,27,60,.72)] sm:px-8 sm:pb-8 sm:pt-14 lg:px-12 lg:pb-12">
        <div className="pointer-events-none absolute inset-0 opacity-55 [background:radial-gradient(circle_at_16%_8%,rgba(255,152,152,.62),transparent_32%),radial-gradient(circle_at_78%_4%,rgba(130,157,255,.68),transparent_36%),radial-gradient(circle_at_60%_72%,rgba(111,221,214,.3),transparent_36%)]" />
        <div className="relative mx-auto max-w-5xl">
          <p className="eyebrow !text-white/65">The complete product tour</p>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <h1 className="max-w-[10ch] text-[clamp(2.7rem,7vw,6.5rem)] font-medium leading-[.88] tracking-[-0.075em]">
              Annotated in one minute.
            </h1>
            <p className="max-w-sm pb-1 text-sm leading-relaxed text-white/68 sm:text-base">
              Watch the real Chrome sidebar keep a useful moment, add a note,
              and publish it without losing the original source.
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-[20px] bg-black shadow-[0_28px_80px_-34px_rgba(0,0,0,.9)] ring-1 ring-white/15 sm:rounded-[26px]">
            <video
              controls
              playsInline
              preload="metadata"
              poster="/demo/annotated-demo-poster.jpg"
              className="aspect-video w-full bg-black object-contain"
              aria-label="Annotated one-minute product demonstration"
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser cannot play this video. Open the original recording instead.
            </video>
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-white/55">59 seconds · Full-resolution product walkthrough</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" asChild>
                <a href={videoUrl} target="_blank" rel="noreferrer">
                  Open the video <ArrowUpRight />
                </a>
              </Button>
              <Button variant="outline" className="border-white/25 bg-white/5 text-white hover:bg-white hover:text-[var(--ink)]" asChild>
                <Link href="/connect">Get the Chrome sidebar</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
