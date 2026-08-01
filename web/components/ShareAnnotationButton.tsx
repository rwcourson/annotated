"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

export default function ShareAnnotationButton({ annotationId }: { annotationId: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/a/${annotationId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Annotated moment", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // The user may cancel the native share sheet.
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="icon-action inline-flex min-h-10 items-center gap-1.5 rounded-full px-2 text-xs font-medium text-[var(--muted-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cobalt)]"
      aria-label="Share annotation"
    >
      {copied ? <Check className="h-4 w-4 text-[#4a8d55]" /> : <Share2 className="h-4 w-4" />}
      <span>{copied ? "Copied" : "Share"}</span>
    </button>
  );
}
