"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserAvatar from "./Avatar";
import { timeAgo } from "@/lib/utils";

type ThreadComment = {
  id: string;
  text: string;
  createdAt: string;
  author: {
    id: string;
    username: string | null;
    name: string | null;
    image: string | null;
  };
};

export default function CommentThread({
  annotationId,
  initialComments,
  isAuthed,
}: {
  annotationId: string;
  initialComments: ThreadComment[];
  isAuthed: boolean;
}) {
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!text.trim()) return;
    setPending(true);
    try {
      const response = await fetch(`/api/annotations/${annotationId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      if (response.ok) {
        const data = await response.json();
        setComments((current) => [...current, data.comment]);
        setText("");
      } else {
        toast.error("Couldn’t post — try again");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <section id="comments" className="scroll-mt-28">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-[var(--action-dark)]" />
        <h2 className="text-sm font-semibold tracking-[-0.02em] text-[var(--ink)]">Conversation</h2>
        <span className="rounded-full bg-[var(--soft)] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[var(--muted-ink)]">{comments.length}</span>
      </div>

      <ul className="mt-6 space-y-0">
        {comments.map((comment, index) => (
          <li key={comment.id} className="relative flex gap-3 pb-6 last:pb-0">
            {index < comments.length - 1 && <span aria-hidden className="absolute bottom-0 left-[17px] top-9 w-px bg-[var(--line)]" />}
            <UserAvatar name={comment.author.name} image={comment.author.image} size={34} />
            <div className="min-w-0 flex-1 rounded-[16px] bg-[#f8f6f4] px-4 py-3">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <Link href={comment.author.username ? `/u/${comment.author.username}` : "#"} className="text-sm font-semibold text-[var(--ink)] hover:underline hover:underline-offset-4">
                  {comment.author.name ?? "anon"}
                </Link>
                {comment.author.username && <span className="text-[11px] text-[var(--muted-ink)]">@{comment.author.username}</span>}
                <span className="ml-auto text-[11px] text-[var(--muted-ink)]">{timeAgo(comment.createdAt)}</span>
              </div>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-[var(--ink)]">{comment.text}</p>
            </div>
          </li>
        ))}
        {comments.length === 0 && (
          <li className="rounded-[16px] border border-dashed hairline px-5 py-9 text-center">
            <p className="text-sm font-medium text-[var(--ink)]">Start the conversation.</p>
            <p className="mt-1 text-xs text-[var(--muted-ink)]">Respond to the annotation, not just the headline.</p>
          </li>
        )}
      </ul>

      {isAuthed ? (
        <form onSubmit={submit} className="mt-6 flex gap-2 border-t hairline pt-5">
          <Input value={text} onChange={(event) => setText(event.target.value)} placeholder="Add to the conversation…" maxLength={2000} />
          <Button type="submit" disabled={pending || !text.trim()} className="min-w-[76px]">{pending ? "…" : "Post"}</Button>
        </form>
      ) : (
        <p className="mt-6 border-t hairline pt-5 text-sm text-[var(--muted-ink)]">
          <Link href="/signin" className="font-semibold text-[var(--action-dark)] transition-colors duration-150 hover:text-[var(--ink)]">Sign in</Link>{" "}
          to join the conversation.
        </p>
      )}
    </section>
  );
}
