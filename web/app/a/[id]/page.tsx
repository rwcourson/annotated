import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import UserAvatar from "@/components/Avatar";
import TypeBadge from "@/components/TypeBadge";
import ClipPlayer from "@/components/ClipPlayer";
import ClaimButton from "@/components/ClaimButton";
import CommentThread from "@/components/CommentThread";
import FollowButton from "@/components/FollowButton";
import DeleteAnnotationButton from "@/components/DeleteAnnotationButton";
import { Button } from "@/components/ui/button";
import { formatDate, formatSeconds, timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Annotation" };

export default async function AnnotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const annotation = await prisma.annotation.findUnique({
    where: { id },
    include: {
      user: true,
      comments: { orderBy: { createdAt: "asc" }, include: { user: true } },
      _count: { select: { claims: true } },
    },
  });
  if (!annotation) notFound();

  const session = await auth();
  const meId = session?.user?.id ?? null;
  const following = meId
    ? !!(await prisma.follow.findUnique({
        where: {
          followerId_followeeId: {
            followerId: meId,
            followeeId: annotation.userId,
          },
        },
      }))
    : false;
  const isOwn = meId === annotation.userId;

  const a = annotation;
  const hasClip =
    (a.type === "video" || a.type === "audio") &&
    a.startSec != null &&
    a.endSec != null;

  return (
    <div className="page-wrap max-w-4xl py-12 sm:py-16">
      <Link
        href="/feed"
        className="group inline-flex items-center gap-1.5 rounded-full text-sm font-medium text-[var(--muted-ink)] transition-colors duration-200 hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--action)] focus-visible:ring-offset-4 [&_svg]:transition-transform hover:[&_svg]:-translate-x-1"
      >
        <ArrowLeft className="h-4 w-4" /> Back to feed
      </Link>

      <div className="mt-8 flex items-center gap-3 border-b hairline pb-6">
        <Link href={a.user.username ? `/u/${a.user.username}` : "#"} className="avatar-action rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cobalt)]">
          <UserAvatar name={a.user.name} image={a.user.image} size={46} />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={a.user.username ? `/u/${a.user.username}` : "#"} className="block truncate text-sm font-semibold text-[var(--ink)] hover:underline hover:underline-offset-4">{a.user.name ?? "anon"}</Link>
          <p className="mt-0.5 text-xs text-[var(--muted-ink)]">{a.user.username ? `@${a.user.username} · ` : ""}Annotated {timeAgo(a.createdAt)}</p>
        </div>
        {isOwn ? (
          <DeleteAnnotationButton annotationId={a.id} redirectTo="/feed" />
        ) : (
          <FollowButton userId={a.userId} initialFollowing={following} isAuthed={!!meId} />
        )}
      </div>

      {/* header */}
      <div className="mt-8 flex flex-wrap items-center gap-2.5">
        <TypeBadge type={a.type} />
        {a.siteName && (
          <span className="text-xs font-medium text-zinc-400">
            {a.siteName}
          </span>
        )}
        <span className="ml-auto text-xs text-zinc-400">Public annotation</span>
      </div>
      <h1 className="serif-display mt-6 max-w-[18ch] text-4xl leading-[.96] text-[var(--ink)] sm:text-6xl">
        {a.title}
      </h1>

      {/* provenance strip for video/audio clips */}
      {hasClip && (
        <p className="mt-5 inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-full bg-[var(--soft)] px-4 py-2 text-xs font-medium text-[var(--muted-ink)]">
          <span className="text-zinc-800">
            {formatSeconds(a.startSec!)} → {formatSeconds(a.endSec!)} ·{" "}
            {a.endSec! - a.startSec!}s clip
          </span>
          {a.type === "video" && (
            <>
              <span aria-hidden className="text-zinc-300">·</span>
              <span>240px player</span>
            </>
          )}
          <span aria-hidden className="text-zinc-300">·</span>
          <span>≤90s</span>
          <span aria-hidden className="text-zinc-300">·</span>
              <span className="text-[#4a8d55]">fair use — commentary</span>
        </p>
      )}

      {/* media / quote */}
      <div className="mt-8">
        {hasClip && (
          <ClipPlayer
            type={a.type as "video" | "audio"}
            sourceUrl={a.sourceUrl}
            mediaUrl={a.mediaUrl}
            startSec={a.startSec!}
            endSec={a.endSec!}
          />
        )}

        {a.type === "article" && (
          <div className="surface p-8">
            {a.quote ? (
              <blockquote className="text-3xl font-medium leading-[1.16] tracking-[-0.045em] text-[var(--ink)]">
                &ldquo;{a.quote}&rdquo;
              </blockquote>
            ) : (
              <p className="text-sm text-zinc-400">
                No passage captured — see the original article.
              </p>
            )}
            <dl className="mt-8 grid grid-cols-2 gap-x-4 gap-y-5 text-sm sm:grid-cols-4">
              <div>
                <dt className="label !mb-1">Source</dt>
                <dd className="font-medium text-zinc-800">
                  {a.siteName ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="label !mb-1">Author</dt>
                <dd className="font-medium text-zinc-800">{a.author ?? "—"}</dd>
              </div>
              <div>
                <dt className="label !mb-1">Published</dt>
                <dd className="font-medium text-zinc-800">
                  {a.publishedAt ? formatDate(a.publishedAt) : "—"}
                </dd>
              </div>
              <div>
                <dt className="label !mb-1">Type</dt>
                <dd className="font-medium text-zinc-800">
                  Article highlight
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      {/* always-visible source link */}
      <Button variant="outline" asChild className="mt-6">
        <a href={a.sourceUrl} target="_blank" rel="noopener noreferrer">
          View original source <ArrowUpRight />
        </a>
      </Button>

      {/* commentary */}
      {(a.comment || a.commentAudioUrl) && (
        <section className="surface mt-10 p-7">
          <h2 className="text-sm font-semibold tracking-tight text-zinc-900">
            {a.user.name ?? "The annotator"}&apos;s take
          </h2>
          {a.comment && (
            <p className="mt-3 whitespace-pre-wrap leading-relaxed text-zinc-600">
              {a.comment}
            </p>
          )}
          {a.commentAudioUrl && (
            <audio
              src={a.commentAudioUrl}
              controls
              className="mt-4 h-10 w-full"
            />
          )}
        </section>
      )}

      {/* comments */}
      <div className="surface mt-6 p-7">
        <CommentThread
          annotationId={a.id}
          isAuthed={!!meId}
          initialComments={a.comments.map((c) => ({
            id: c.id,
            text: c.text,
            createdAt: c.createdAt.toISOString(),
            author: {
              id: c.user.id,
              username: c.user.username,
              name: c.user.name,
              image: c.user.image,
            },
          }))}
        />
      </div>

      {/* fair-use / claims */}
      <section className="mt-6 flex flex-wrap items-center gap-4 rounded-[20px] border border-[#f0cfc8] bg-[#fff2ee] p-6">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tracking-tight text-zinc-900">
            Rights holder? This clip is ≤90 seconds
            {a.type === "video" ? ", in a 240px player," : ""} and links back to you.
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            If you still believe it crosses the line, dispute it here.
          </p>
        </div>
        <ClaimButton annotationId={a.id} claimCount={a._count.claims} />
      </section>
    </div>
  );
}
