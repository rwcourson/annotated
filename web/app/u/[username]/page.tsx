import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CalendarDays, Link2 } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import UserAvatar from "@/components/Avatar";
import AnnotationCard from "@/components/AnnotationCard";
import FollowButton from "@/components/FollowButton";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    include: {
      annotations: {
        orderBy: { createdAt: "desc" },
        include: { user: true, _count: { select: { comments: true } } },
      },
      _count: { select: { followers: true, following: true } },
    },
  });
  if (!user) notFound();

  const session = await auth();
  const meId = session?.user?.id ?? null;
  const isOwn = meId === user.id;
  const [followingThisUser, myFollows] = await Promise.all([
    meId && !isOwn
      ? prisma.follow.findUnique({ where: { followerId_followeeId: { followerId: meId, followeeId: user.id } } })
      : null,
    meId
      ? prisma.follow.findMany({ where: { followerId: meId }, select: { followeeId: true } })
      : [],
  ]);
  const followingAuthorIds = new Set(myFollows.map((follow) => follow.followeeId));
  const formatCounts = user.annotations.reduce<Record<string, number>>((counts, annotation) => {
    counts[annotation.type] = (counts[annotation.type] ?? 0) + 1;
    return counts;
  }, {});

  return (
    <div className="page-wrap max-w-5xl py-10 sm:py-14">
      <section className="overflow-hidden rounded-[26px] border hairline bg-white">
        <div className="relative h-40 sm:h-52">
          <Image
            src="/art/pixel-depth-hq.webp"
            alt=""
            fill
            priority
            unoptimized
            sizes="(min-width: 1024px) 896px, (min-width: 640px) calc(100vw - 3rem), calc(100vw - 1.5rem)"
            className="object-cover object-[center_72%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/[0.08] to-transparent" />
        </div>
        <div className="px-5 pb-6 sm:px-8 sm:pb-8">
          <div className="flex items-end justify-between gap-4">
            <UserAvatar name={user.name} image={user.image} size={92} className="-mt-11 ring-4 ring-white" />
            {!isOwn ? (
              <FollowButton userId={user.id} initialFollowing={!!followingThisUser} isAuthed={!!meId} />
            ) : (
              <span className="rounded-full bg-[var(--soft)] px-4 py-2 text-xs font-semibold text-[var(--muted-ink)]">Your profile</span>
            )}
          </div>

          <div className="mt-5 grid gap-7 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <h1 className="text-3xl font-medium tracking-[-0.055em] text-[var(--ink)] sm:text-4xl">{user.name ?? user.username}</h1>
              <p className="mt-1 text-sm text-[var(--muted-ink)]">@{user.username}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--muted-ink)]">
                <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> Joined {user.createdAt.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                {Object.keys(formatCounts).length > 0 && <span className="inline-flex items-center gap-1.5"><Link2 className="h-3.5 w-3.5" /> Annotates {Object.keys(formatCounts).join(", ")}</span>}
              </div>
            </div>
            <dl className="grid grid-cols-3 gap-7 border-t hairline pt-5 md:border-l md:border-t-0 md:pl-8 md:pt-0">
              <div><dt className="text-[10px] font-semibold uppercase tracking-[0.11em] text-[var(--muted-ink)]">Annotations</dt><dd className="mt-1 text-xl font-semibold tabular-nums text-[var(--ink)]">{user.annotations.length}</dd></div>
              <div><dt className="text-[10px] font-semibold uppercase tracking-[0.11em] text-[var(--muted-ink)]">Followers</dt><dd className="mt-1 text-xl font-semibold tabular-nums text-[var(--ink)]">{user._count.followers}</dd></div>
              <div><dt className="text-[10px] font-semibold uppercase tracking-[0.11em] text-[var(--muted-ink)]">Following</dt><dd className="mt-1 text-xl font-semibold tabular-nums text-[var(--ink)]">{user._count.following}</dd></div>
            </dl>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_250px] lg:items-start">
        <main>
          <div className="mb-5 flex items-center justify-between border-b hairline pb-4">
            <h2 className="text-lg font-semibold tracking-[-0.035em] text-[var(--ink)]">Annotations</h2>
            <span className="text-xs text-[var(--muted-ink)]">Newest first</span>
          </div>
          <div className="space-y-5">
            {user.annotations.map((annotation) => (
              <AnnotationCard
                key={annotation.id}
                annotation={{ id: annotation.id, type: annotation.type, sourceUrl: annotation.sourceUrl, title: annotation.title, siteName: annotation.siteName, quote: annotation.quote, startSec: annotation.startSec, endSec: annotation.endSec, comment: annotation.comment, commentAudioUrl: annotation.commentAudioUrl, createdAt: annotation.createdAt, user: annotation.user, commentCount: annotation._count.comments }}
                isAuthed={!!meId}
                followingAuthorIds={followingAuthorIds}
                currentUserId={meId}
              />
            ))}
            {user.annotations.length === 0 && <div className="rounded-[22px] border hairline bg-white p-14 text-center text-sm text-[var(--muted-ink)]">No annotations yet.</div>}
          </div>
        </main>

        <aside className="rounded-[20px] border hairline bg-white p-5 lg:sticky lg:top-[104px]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--muted-ink)]">Source mix</p>
          <div className="mt-4 space-y-3">
            {Object.entries(formatCounts).map(([format, count]) => (
              <div key={format} className="flex items-center justify-between border-b hairline pb-3 last:border-0 last:pb-0">
                <span className="text-sm capitalize text-[var(--ink)]">{format}</span>
                <span className="rounded-full bg-[var(--soft)] px-2.5 py-1 text-xs font-semibold tabular-nums text-[var(--muted-ink)]">{count}</span>
              </div>
            ))}
            {Object.keys(formatCounts).length === 0 && <p className="text-sm text-[var(--muted-ink)]">No sources yet.</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}
