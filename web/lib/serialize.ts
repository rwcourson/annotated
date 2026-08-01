import type { Annotation, Comment, User } from "@prisma/client";

export function serializeAuthor(user: User) {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    image: user.image,
  };
}

/**
 * API shape for an annotation. Note: `author` is the annotated user who
 * created the annotation (per the feed contract); the original article's
 * byline (DB column `author`) is exposed as `articleAuthor`.
 */
export function serializeAnnotation(
  a: Annotation & { user: User },
  extras?: {
    commentCount?: number;
    claimCount?: number;
    followers?: number;
    comments?: (Comment & { user: User })[];
  }
) {
  return {
    id: a.id,
    userId: a.userId,
    type: a.type,
    sourceUrl: a.sourceUrl,
    mediaUrl: a.mediaUrl,
    title: a.title,
    siteName: a.siteName,
    articleAuthor: a.author,
    publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
    quote: a.quote,
    startSec: a.startSec,
    endSec: a.endSec,
    comment: a.comment,
    commentAudioUrl: a.commentAudioUrl,
    createdAt: a.createdAt.toISOString(),
    author: serializeAuthor(a.user),
    counts: {
      comments: extras?.commentCount ?? 0,
      followers: extras?.followers ?? 0,
      claims: extras?.claimCount ?? 0,
    },
    ...(extras?.comments
      ? {
          comments: extras.comments.map((c) => ({
            id: c.id,
            text: c.text,
            createdAt: c.createdAt.toISOString(),
            author: serializeAuthor(c.user),
          })),
        }
      : {}),
  };
}
