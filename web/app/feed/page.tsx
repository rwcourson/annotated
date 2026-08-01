import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Plus } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import AnnotationCard from "@/components/AnnotationCard";
import FeedViewTabs, { type FeedView } from "@/components/FeedViewTabs";
import FollowButton from "@/components/FollowButton";
import UserAvatar from "@/components/Avatar";

export const metadata: Metadata = { title: "Discover" };

const VALID_VIEWS = new Set<FeedView>(["discover", "latest", "following"]);

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view: requestedView } = await searchParams;
  const view: FeedView = VALID_VIEWS.has(requestedView as FeedView)
    ? (requestedView as FeedView)
    : "discover";
  const session = await auth();
  const meId = session?.user?.id ?? null;

  const myFollows = meId
    ? await prisma.follow.findMany({
        where: { followerId: meId },
        select: { followeeId: true },
      })
    : [];
  const followedIds = myFollows.map((follow) => follow.followeeId);
  const followingAuthorIds = new Set(followedIds);

  const [annotationRows, peopleRows, typeGroups] = await Promise.all([
    prisma.annotation.findMany({
      where: view === "following" ? { userId: { in: followedIds } } : undefined,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { user: true, _count: { select: { comments: true } } },
    }),
    prisma.user.findMany({
      where: meId ? { id: { not: meId } } : undefined,
      take: 12,
      include: { _count: { select: { followers: true, annotations: true } } },
    }),
    prisma.annotation.groupBy({ by: ["type"], _count: { _all: true } }),
  ]);

  const annotations =
    view === "discover"
      ? [...annotationRows].sort(
          (a, b) => b._count.comments - a._count.comments || b.createdAt.getTime() - a.createdAt.getTime(),
        )
      : annotationRows;
  const people = [...peopleRows]
    .sort(
      (a, b) =>
        b._count.followers - a._count.followers ||
        b._count.annotations - a._count.annotations,
    )
    .slice(0, 4);
  const totalAnnotations = typeGroups.reduce((sum, group) => sum + group._count._all, 0);

  return (
    <div className="page-wrap py-10 sm:py-14">
      <header className="grid gap-7 border-b hairline pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="eyebrow">The public conversation</p>
          <h1 className="serif-display mt-3 max-w-[12ch] text-5xl leading-[.94] text-[var(--ink)] sm:text-6xl">
            Discover what people stopped to notice.
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[var(--muted-ink)]">
            Source-linked moments, reactions, and conversations from across the web.
          </p>
        </div>
        <Button asChild className="justify-self-start lg:justify-self-end">
          <Link href="/new"><Plus /> New annotation</Link>
        </Button>
      </header>

      <div className="mt-7">
        <FeedViewTabs value={view} isAuthed={!!meId} />
      </div>

      <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_290px] lg:items-start">
        <main aria-label={`${view} annotations`} className="space-y-5">
          {annotations.map((annotation) => (
            <AnnotationCard
              key={annotation.id}
              annotation={{
                id: annotation.id,
                type: annotation.type,
                sourceUrl: annotation.sourceUrl,
                title: annotation.title,
                siteName: annotation.siteName,
                quote: annotation.quote,
                startSec: annotation.startSec,
                endSec: annotation.endSec,
                comment: annotation.comment,
                commentAudioUrl: annotation.commentAudioUrl,
                createdAt: annotation.createdAt,
                user: annotation.user,
                commentCount: annotation._count.comments,
              }}
              isAuthed={!!meId}
              followingAuthorIds={followingAuthorIds}
              currentUserId={meId}
            />
          ))}

          {annotations.length === 0 && (
            <div className="rounded-[22px] border hairline bg-white px-6 py-16 text-center">
              <p className="text-2xl font-medium tracking-[-0.04em] text-[var(--ink)]">
                {view === "following" ? "Your following feed is quiet." : "Nothing annotated yet."}
              </p>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[var(--muted-ink)]">
                {view === "following"
                  ? "Follow a few people from Discover and their annotations will collect here."
                  : "Be the first to bring a source-linked moment into the conversation."}
              </p>
              <Button asChild className="mt-7">
                <Link href={view === "following" ? "/feed?view=discover" : "/new"}>
                  {view === "following" ? "Discover people" : "Create an annotation"} <ArrowRight />
                </Link>
              </Button>
            </div>
          )}
        </main>

        <aside className="space-y-5 lg:sticky lg:top-[104px]">
          <section className="rounded-[20px] border hairline bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-[-0.02em] text-[var(--ink)]">People to notice</h2>
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted-ink)]">Community</span>
            </div>
            <div className="mt-4 divide-y hairline">
              {people.map((person) => (
                <div key={person.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <Link href={person.username ? `/u/${person.username}` : "#"} className="avatar-action shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cobalt)]">
                    <UserAvatar name={person.name} image={person.image} size={38} />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={person.username ? `/u/${person.username}` : "#"} className="block truncate text-sm font-semibold text-[var(--ink)] hover:underline">
                      {person.name ?? person.username ?? "anon"}
                    </Link>
                    <p className="truncate text-[11px] text-[var(--muted-ink)]">
                      {person._count.annotations} posts · {person._count.followers} followers
                    </p>
                  </div>
                  <FollowButton userId={person.id} initialFollowing={followingAuthorIds.has(person.id)} isAuthed={!!meId} compact />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[20px] border hairline bg-[var(--ink)] p-5 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-white/50">What’s moving</p>
            <div className="mt-4 space-y-4">
              {typeGroups.map((group) => {
                const percent = totalAnnotations ? Math.round((group._count._all / totalAnnotations) * 100) : 0;
                return (
                  <div key={group.type}>
                    <div className="flex items-center justify-between text-xs"><span className="capitalize">{group.type}</span><span className="tabular-nums text-white/55">{group._count._all}</span></div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-[#ff806b]" style={{ width: `${percent}%` }} /></div>
                  </div>
                );
              })}
            </div>
            <p className="mt-5 border-t border-white/15 pt-4 text-xs leading-relaxed text-white/55">Real format mix across every public annotation.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
