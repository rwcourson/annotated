"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ClaimButton({
  annotationId,
  claimCount,
}: {
  annotationId: string;
  claimCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [contact, setContact] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) return;
    setState("sending");
    try {
      const res = await fetch(`/api/annotations/${annotationId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: reason.trim(),
          contact: contact.trim() || undefined,
        }),
      });
      if (res.ok) {
        setState("done");
        toast.success("Claim filed — we'll review this annotation");
      } else {
        toast.error("Couldn't file the claim — try again");
        setState("idle");
      }
    } catch {
      toast.error("Couldn't file the claim — try again");
      setState("idle");
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next && state === "done") {
      setReason("");
      setContact("");
      setState("idle");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
        >
          File a claim
          {claimCount > 0 && (
            <span className="rounded-full bg-red-100 px-1.5 text-[10px] font-semibold">
              {claimCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        {state === "done" ? (
          <div className="py-4 text-center">
            <p className="serif-display text-3xl text-zinc-900">Claim filed.</p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              Thanks — we&apos;ve recorded your dispute and will review this
              annotation against our fair-use policy.
            </p>
            <DialogFooter className="mt-6 justify-center">
              <Button variant="secondary" onClick={() => handleOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={submit}>
            <DialogHeader>
              <DialogTitle className="serif-display text-2xl font-normal">
                File a claim
              </DialogTitle>
              <DialogDescription>
                If you believe this clip infringes your rights, tell us why.
                Every clip is ≤90 seconds, links back to its source, and is
                shared under fair-use commentary norms.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-2 space-y-4">
              <div>
                <label className="label" htmlFor="claim-reason">
                  Reason
                </label>
                <Textarea
                  id="claim-reason"
                  required
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="I own the rights to this material and…"
                />
              </div>
              <div>
                <label className="label" htmlFor="claim-contact">
                  Contact (optional)
                </label>
                <Input
                  id="claim-contact"
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={state === "sending" || !reason.trim()}
              >
                {state === "sending" ? "Filing…" : "Submit claim"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
