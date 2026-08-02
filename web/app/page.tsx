import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import AnnotationCard from "@/components/AnnotationCard";
import LandingEntrance from "@/components/LandingEntrance";
import SiteFooter from "@/components/SiteFooter";

const SOURCES = [
  {
    number: "01",
    title: "YouTube",
    kicker: "Video",
    body: "Set the start and end. Clips stop at 90 seconds and keep the original YouTube timestamp.",
    meta: "≤90 seconds · 240px player",
  },
  {
    number: "02",
    title: "The article",
    kicker: "Text",
    body: "Highlight the lines you care about. The headline, byline, date, and original URL come with them.",
    meta: "Passage · source metadata",
  },
  {
    number: "03",
    title: "The podcast",
    kicker: "Audio",
    body: "Mark up to 90 seconds, then say why it stuck with you in text or in your own voice.",
    meta: "≤90 seconds · inline player",
  },
] as const;

const REQUIREMENTS = [
  "Chrome side panel is the primary clipping surface",
  "Every annotation opens the original source",
  "Text and recorded-audio commentary",
  "Public pages, profiles, follows, and comments",
  "A visible File a claim action on every annotation",
  "Google and X account connection",
] as const;

export default async function Landing() {
  const session = await auth();
  const meId = session?.user?.id ?? null;
  const [latest, myFollows] = await Promise.all([
    prisma.annotation.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { user: true, _count: { select: { comments: true } } },
    }),
    meId
      ? prisma.follow.findMany({ where: { followerId: meId }, select: { followeeId: true } })
      : Promise.resolve([]),
  ]);
  const followingAuthorIds = new Set(myFollows.map((follow) => follow.followeeId));

  return (
    <div className="overflow-hidden">
      <LandingEntrance>
      <section className="page-wrap pb-12 pt-10 sm:pb-20 sm:pt-14">
        <div className="grid gap-8 lg:grid-cols-[1.18fr_.82fr] lg:items-end">
          <div>
            <p className="eyebrow">The Chrome sidebar for the web</p>
            <h1 className="display-xl mt-6 max-w-[8.5ch] text-[var(--ink)]">
              Clip the moment. Keep the source.
            </h1>
          </div>
          <div className="max-w-md pb-1 lg:ml-auto">
            <p className="text-[clamp(1.15rem,2vw,1.55rem)] leading-[1.22] tracking-[-0.035em] text-[var(--ink)]">
              Find the sentence or moment you want to keep. Annotated saves the clip, your note, and the original link on one public page.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/connect">Connect the Chrome sidebar <ArrowRight /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/feed">Explore the feed</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/demo">Watch the one-minute demo</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="relative mt-10 overflow-hidden rounded-[28px] bg-white p-3 shadow-[0_34px_80px_-62px_rgba(47,31,24,.5)] sm:p-5">
          <div className="art-grain absolute inset-0">
            <picture className="absolute inset-0">
              <source media="(max-width: 639px)" srcSet="/art/pixel-depth-hq.webp" />
              <img
                src="/art/pixel-horizon-hq.webp"
                alt="Pastel coral, lilac, blue, and green pixel horizon"
                fetchPriority="high"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </picture>
          </div>
          <div className="relative grid gap-10 p-5 sm:p-8 lg:grid-cols-[minmax(320px,.66fr)_minmax(0,1.34fr)] lg:items-center lg:gap-16 lg:px-12 lg:py-14 xl:grid-cols-[minmax(380px,.72fr)_minmax(0,1.28fr)] xl:gap-24 xl:px-16 xl:py-[4.5rem]">
            <div className="max-w-[30rem] self-start lg:self-center lg:pl-2 xl:pl-4">
              <span className="inline-flex rounded-full bg-white/75 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--ink)] backdrop-blur-sm">
                The real Chrome sidebar
              </span>
              <p className="mt-6 max-w-[9.5ch] text-[clamp(1.85rem,2.85vw,3rem)] font-medium leading-[.97] tracking-[-0.058em] text-[var(--ink)]">
                Your page stays open. Annotated sits right beside it.
              </p>
              <p className="mt-6 max-w-[23rem] text-sm leading-[1.65] text-[color:rgba(31,27,25,.66)] sm:text-[15px]">
                Clip an exact passage, timestamp, or audio moment without breaking your reading flow.
              </p>
            </div>
            <div className="w-full max-w-[900px] min-w-0 lg:justify-self-end">
              <div className="isolate overflow-hidden rounded-[24px] bg-[#f6f4f2] shadow-[0_38px_90px_-40px_rgba(20,26,58,.62)] ring-1 ring-inset ring-white/80 sm:rounded-[30px]">
                <div className="flex h-9 items-center gap-2 border-b border-black/[.06] bg-white/92 px-4 backdrop-blur sm:h-11 sm:px-5">
                  <span className="h-2 w-2 rounded-full bg-[#ff8f79]" />
                  <span className="h-2 w-2 rounded-full bg-[#f2ca70]" />
                  <span className="h-2 w-2 rounded-full bg-[#86cfac]" />
                  <div className="mx-auto flex h-5 w-[48%] items-center justify-center rounded-full bg-[#f4f2f0] text-[7px] font-medium text-black/40 sm:h-6 sm:text-[8px]">
                    annotated.app/feed
                  </div>
                </div>
                <div className="grid aspect-[1.54/1] w-full grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
                  <div className="relative min-w-0 overflow-hidden bg-[#f8f7f5]">
                  <Image
                    src="/screenshots/annotated-feed-desktop.png"
                    alt="The real Annotated discovery feed open in Chrome"
                    fill
                    priority
                    unoptimized
                    sizes="(min-width: 1280px) 650px, (min-width: 1024px) 52vw, 70vw"
                    className="object-cover object-left-top"
                  />
                  </div>
                  <div className="relative min-w-0 overflow-hidden border-l border-black/[.08] bg-[#f8f7f5]">
                    <Image
                      src="/screenshots/annotated-sidebar.png"
                      alt="The real Annotated Chrome side panel docked beside the feed"
                      fill
                      priority
                      unoptimized
                      sizes="(min-width: 1024px) 260px, 28vw"
                      className="object-cover object-top"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between px-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[color:rgba(31,27,25,.52)] sm:mt-4 sm:text-[10px]">
                <span>The page</span>
                <span className="flex items-center gap-2"><span className="h-px w-8 bg-black/20" /> The sidebar</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      </LandingEntrance>

      <section id="sources" className="bg-white">
        <div className="page-wrap grid gap-12 py-16 sm:py-20 lg:grid-cols-[.75fr_1.25fr] lg:gap-20">
          <div>
            <p className="eyebrow">What you can save</p>
            <h2 className="serif-display mt-5 max-w-[9ch] text-4xl leading-[.94] text-[var(--ink)] sm:text-6xl">
              Save the part you would send to a friend.
            </h2>
          </div>
          <div className="grid gap-3">
            {SOURCES.map((source) => (
              <article key={source.number} className="grid gap-5 rounded-[22px] bg-[#f7f4f2] p-6 sm:grid-cols-[3.5rem_1fr_auto] sm:gap-7">
                <span className="text-xs font-semibold text-[var(--action-dark)]">{source.number}</span>
                <div>
                  <p className="eyebrow">{source.kicker}</p>
                  <h3 className="mt-2 text-2xl font-medium tracking-[-0.045em] text-[var(--ink)]">{source.title}</h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted-ink)]">{source.body}</p>
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted-ink)] sm:pt-7">{source.meta}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="page-wrap scroll-mt-24 py-16 sm:py-20">
        <div className="grid overflow-hidden rounded-[28px] bg-[#ece9ff] lg:grid-cols-[1.03fr_.97fr]">
          <div className="relative min-h-[420px] lg:min-h-[560px]">
            <Image
              src="/art/pixel-depth-hq.webp"
              alt="Blue, cyan, green, and pastel pixel field"
              fill
              unoptimized
              sizes="(min-width: 1280px) 627px, (min-width: 1024px) 52vw, calc(100vw - 1.5rem)"
              className="object-cover"
            />
            <div className="absolute left-5 top-5 rounded-full bg-white/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] backdrop-blur">Source → signal</div>
          </div>
          <div className="flex flex-col justify-between bg-[linear-gradient(145deg,#fff9f7_0%,#f1ecff_50%,#e8f6ff_100%)] p-8 text-[var(--ink)] sm:p-12 lg:p-14">
            <div>
              <p className="eyebrow">How it works</p>
              <h2 className="mt-5 max-w-[10ch] text-4xl font-medium leading-[.94] tracking-[-0.06em] sm:text-6xl">Clip it without leaving the page.</h2>
            </div>
            <ol className="mt-12 grid gap-2">
              {["Pick the page or media", "Select the exact moment", "Add text or record your voice", "Publish a public, linked page"].map((step, index) => (
                <li key={step} className="flex items-center gap-5 rounded-2xl bg-white/62 px-4 py-3.5 text-sm shadow-[0_10px_35px_-30px_rgba(42,31,82,.55)] backdrop-blur-sm">
                  <span className="text-[var(--action-dark)]">0{index + 1}</span><span>{step}</span>
                </li>
              ))}
            </ol>
            <Button size="lg" variant="warm" asChild className="mt-10 self-start">
              <Link href="/connect">Get the Chrome sidebar <ArrowUpRight /></Link>
            </Button>
          </div>
        </div>
      </section>

      {latest.length > 0 && (
        <section className="border-y hairline bg-white py-16 sm:py-20">
          <div className="page-wrap">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div><p className="eyebrow">From the public feed</p><h2 className="serif-display mt-4 text-4xl leading-none text-[var(--ink)] sm:text-6xl">What people are saving.</h2></div>
              <Link href="/feed" className="text-action text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--action)] focus-visible:ring-offset-4">See everything <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {latest.map((a) => (
                <AnnotationCard
                  key={a.id}
                  annotation={{ id: a.id, type: a.type, sourceUrl: a.sourceUrl, title: a.title, siteName: a.siteName, quote: a.quote, startSec: a.startSec, endSec: a.endSec, comment: a.comment, commentAudioUrl: a.commentAudioUrl, createdAt: a.createdAt, user: a.user, commentCount: a._count.comments }}
                  isAuthed={!!meId}
                  followingAuthorIds={followingAuthorIds}
                  currentUserId={meId}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="requirements" className="page-wrap scroll-mt-24 py-16 sm:py-20">
        <div className="grid overflow-hidden rounded-[28px] border hairline bg-white lg:grid-cols-[1fr_1fr]">
          <div className="relative min-h-[380px] lg:min-h-[540px]">
            <Image
              src="/art/pixel-bloom-hq.webp"
              alt="Pastel pink and blue stepped pixel field"
              fill
              unoptimized
              sizes="(min-width: 1280px) 608px, (min-width: 1024px) 50vw, calc(100vw - 1.5rem)"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14">
            <p className="eyebrow">Built into every annotation</p>
            <h2 className="serif-display mt-5 max-w-[10ch] text-4xl leading-[.94] text-[var(--ink)] sm:text-6xl">The source never disappears.</h2>
            <ul className="mt-9 grid gap-4">
              {REQUIREMENTS.map((item) => <li key={item} className="flex items-start gap-3 rounded-2xl bg-[#f7f4f2] px-4 py-3.5 text-sm leading-relaxed text-[var(--ink)]"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--action-dark)]" />{item}</li>)}
            </ul>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button size="lg" asChild><Link href="/new">Make an annotation <ArrowRight /></Link></Button>
              <Button size="lg" variant="outline" asChild><Link href="/feed">Browse public pages</Link></Button>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
