import Link from "next/link";
import { ArrowUpRight, MessageCircle, Play } from "lucide-react";
import UserAvatar from "./Avatar";
import TypeBadge from "./TypeBadge";
import FollowButton from "./FollowButton";
import ShareAnnotationButton from "./ShareAnnotationButton";
import { formatSeconds, timeAgo } from "@/lib/utils";

export type CardAnnotation = {
  id: string;
  type: string;
  sourceUrl: string;
  title: string;
  siteName: string | null;
  quote: string | null;
  startSec: number | null;
  endSec: number | null;
  comment: string | null;
  commentAudioUrl: string | null;
  createdAt: Date;
  user: {
    id: string;
    username: string | null;
    name: string | null;
    image: string | null;
  };
  commentCount: number;
};

export default function AnnotationCard({
  annotation: a,
  isAuthed,
  followingAuthorIds,
  currentUserId,
}: {
  annotation: CardAnnotation;
  isAuthed: boolean;
  followingAuthorIds: Set<string>;
  currentUserId?: string | null;
}) {
  const profileHref = a.user.username ? `/u/${a.user.username}` : "#";
  const isOwn = currentUserId === a.user.id;

  return (
    <article className="social-card overflow-hidden rounded-[22px] border border-black/[0.09] bg-white shadow-[0_18px_46px_-40px_rgba(35,27,23,.5)]">
      <header className="flex items-center gap-3 px-5 py-4 sm:px-6">
        <Link href={profileHref} className="avatar-action shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cobalt)] focus-visible:ring-offset-2">
          <UserAvatar name={a.user.name} image={a.user.image} size={42} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <Link href={profileHref} className="truncate text-sm font-semibold text-[var(--ink)] hover:underline hover:decoration-[var(--action)] hover:underline-offset-4">
              {a.user.name ?? "anon"}
            </Link>
            {a.user.username && <span className="truncate text-xs text-[var(--muted-ink)]">@{a.user.username}</span>}
          </div>
          <p className="mt-0.5 text-xs text-[var(--muted-ink)]">Annotated {timeAgo(a.createdAt)}</p>
        </div>
        {!isOwn && (
          <FollowButton userId={a.user.id} initialFollowing={followingAuthorIds.has(a.user.id)} isAuthed={isAuthed} compact />
        )}
      </header>

      <Link href={`/a/${a.id}`} className="group block border-y border-black/[0.07] bg-[#faf9f8] px-5 py-5 transition-colors duration-150 hover:bg-[#f7f4f2] sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <TypeBadge type={a.type} />
          {a.siteName && <span className="text-xs font-medium text-[var(--muted-ink)]">{a.siteName}</span>}
        </div>
        <h2 className="mt-4 text-[clamp(1.3rem,2.4vw,1.75rem)] font-medium leading-[1.08] tracking-[-0.05em] text-[var(--ink)] transition-colors duration-150 group-hover:text-[var(--action-dark)]">
          {a.title}
        </h2>

        {a.type === "article" && a.quote && (
          <blockquote className="mt-4 max-w-[55ch] text-[15px] leading-[1.62] text-[var(--muted-ink)]">
            “{a.quote}”
          </blockquote>
        )}

        {(a.type === "video" || a.type === "audio") && a.startSec != null && a.endSec != null && (
          <div className="mt-5 flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--ink)] text-white"><Play className="ml-0.5 h-3.5 w-3.5 fill-current" /></span>
            <div>
              <p className="text-xs font-semibold text-[var(--ink)]">{formatSeconds(a.startSec)} → {formatSeconds(a.endSec)}</p>
              <p className="mt-0.5 text-[11px] text-[var(--muted-ink)]">{a.endSec - a.startSec} second {a.type} clip</p>
            </div>
          </div>
        )}
      </Link>

      {(a.comment || a.commentAudioUrl) && (
        <div className="px-5 pt-4 sm:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted-ink)]">{a.user.name?.split(" ")[0] ?? "Their"}’s note</p>
          {a.comment && <p className="mt-2 whitespace-pre-wrap text-[15px] leading-[1.55] text-[var(--ink)]">{a.comment}</p>}
          {a.commentAudioUrl && <audio src={a.commentAudioUrl} controls className="mt-3 h-9 w-full" />}
        </div>
      )}

      <footer className="mt-2 flex items-center gap-1 px-3 py-2 sm:px-4">
        <Link href={`/a/${a.id}#comments`} className="icon-action inline-flex min-h-10 items-center gap-1.5 rounded-full px-2 text-xs font-medium text-[var(--muted-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cobalt)]">
          <MessageCircle className="h-4 w-4" />
          <span>{a.commentCount} {a.commentCount === 1 ? "comment" : "comments"}</span>
        </Link>
        <ShareAnnotationButton annotationId={a.id} />
        <a href={a.sourceUrl} target="_blank" rel="noopener noreferrer" className="icon-action ml-auto inline-flex min-h-10 items-center gap-1 rounded-full px-2 text-xs font-semibold text-[var(--action-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cobalt)] hover:[&_svg]:translate-x-0.5 hover:[&_svg]:-translate-y-0.5 [&_svg]:transition-transform">
          Original <ArrowUpRight className="h-4 w-4" />
        </a>
      </footer>
    </article>
  );
}
