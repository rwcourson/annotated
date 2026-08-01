"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MicRecorder from "./MicRecorder";
import { MAX_CLIP_SECONDS } from "@/lib/utils";

type AnnType = "article" | "video" | "audio";

export default function NewAnnotationForm() {
  const router = useRouter();
  const [type, setType] = useState<AnnType>("article");
  const [sourceUrl, setSourceUrl] = useState("");
  const [title, setTitle] = useState("");
  const [siteName, setSiteName] = useState("");
  const [author, setAuthor] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [quote, setQuote] = useState("");
  const [startSec, setStartSec] = useState("");
  const [endSec, setEndSec] = useState("");
  const [comment, setComment] = useState("");
  const [commentAudioUrl, setCommentAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const clipError = useMemo(() => {
    if (type === "article") return null;
    const s = parseInt(startSec, 10);
    const e = parseInt(endSec, 10);
    if (startSec === "" || endSec === "") return null; // not filled yet
    if (Number.isNaN(s) || Number.isNaN(e))
      return "Start and end must be whole seconds.";
    if (s < 0) return "Start must be 0 or greater.";
    if (e - s < 1) return "Clip must be at least 1 second.";
    if (e - s > MAX_CLIP_SECONDS)
      return `Clip is ${e - s}s — max is ${MAX_CLIP_SECONDS}s.`;
    return null;
  }, [type, startSec, endSec]);

  const clipLen = useMemo(() => {
    const s = parseInt(startSec, 10);
    const e = parseInt(endSec, 10);
    return Number.isNaN(s) || Number.isNaN(e) ? null : e - s;
  }, [startSec, endSec]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (type !== "article" && clipError) {
      setError(clipError);
      return;
    }
    setPending(true);
    try {
      const payload: Record<string, unknown> = {
        type,
        sourceUrl: sourceUrl.trim(),
        title: title.trim(),
        comment: comment.trim() || undefined,
        commentAudioUrl: commentAudioUrl ?? undefined,
      };
      if (siteName.trim()) payload.siteName = siteName.trim();
      if (author.trim()) payload.author = author.trim();
      if (publishedAt)
        payload.publishedAt = new Date(publishedAt).toISOString();
      if (type === "article") {
        if (quote.trim()) payload.quote = quote.trim();
      } else {
        payload.startSec = parseInt(startSec, 10);
        payload.endSec = parseInt(endSec, 10);
      }

      const res = await fetch("/api/annotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push(`/a/${data.annotation.id}`);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <span className="label">Source type</span>
        <Tabs value={type} onValueChange={(v) => setType(v as AnnType)}>
          <TabsList indicatorIndex={{ article: 0, video: 1, audio: 2 }[type]} className="w-full">
            <TabsTrigger value="article">Article</TabsTrigger>
            <TabsTrigger value="video">Video</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div>
        <label className="label" htmlFor="f-url">
          Source URL
        </label>
        <Input
          id="f-url"
          type="url"
          required
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder={
            type === "video"
              ? "https://www.youtube.com/watch?v=…"
              : type === "audio"
                ? "https://example.com/episode.mp3"
                : "https://example.com/story"
          }
        />
      </div>

      <div>
        <label className="label" htmlFor="f-title">
          Title
        </label>
        <Input
          id="f-title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What is this clip from?"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="f-site">
            Site name
          </label>
          <Input
            id="f-site"
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="The Verge"
          />
        </div>
        <div>
          <label className="label" htmlFor="f-author">
            Author
          </label>
          <Input
            id="f-author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Byline"
          />
        </div>
        <div>
          <label className="label" htmlFor="f-date">
            Published
          </label>
          <Input
            id="f-date"
            type="date"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
          />
        </div>
      </div>

      {type === "article" ? (
        <div>
          <label className="label" htmlFor="f-quote">
            Highlighted passage
          </label>
          <Textarea
            id="f-quote"
            rows={4}
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            placeholder="The exact passage you want to annotate…"
          />
        </div>
      ) : (
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="f-start">
                Clip start (seconds)
              </label>
              <Input
                id="f-start"
                type="number"
                min={0}
                required
                value={startSec}
                onChange={(e) => setStartSec(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <label className="label" htmlFor="f-end">
                Clip end (seconds)
              </label>
              <Input
                id="f-end"
                type="number"
                min={1}
                required
                value={endSec}
                onChange={(e) => setEndSec(e.target.value)}
                placeholder="60"
              />
            </div>
          </div>
          {clipError ? (
            <p className="mt-2 text-xs font-medium text-red-600">{clipError}</p>
          ) : clipLen != null && clipLen >= 1 ? (
            <p className="mt-2 text-xs font-medium text-[#4a8d55]">
              {clipLen}s clip — within the {MAX_CLIP_SECONDS}s limit
              {type === "video" ? " · 240px player · fair use" : ""}.
            </p>
          ) : null}
        </div>
      )}

      <div>
        <label className="label" htmlFor="f-comment">
          Your commentary (text)
        </label>
        <Textarea
          id="f-comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What should people take away from this?"
        />
      </div>

      <div>
        <span className="label">Your commentary (audio)</span>
        <MicRecorder
          onUploaded={(url) => setCommentAudioUrl(url)}
          onCleared={() => setCommentAudioUrl(null)}
        />
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <Button
        type="submit"
        size="lg"
        disabled={pending || (type !== "article" && !!clipError)}
        className="w-full"
      >
        {pending ? "Publishing…" : "Publish annotation"}
      </Button>
    </form>
  );
}
