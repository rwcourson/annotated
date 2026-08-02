"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function DeleteAnnotationButton({
  annotationId,
  redirectTo,
}: {
  annotationId: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setPending(true);
    try {
      const response = await fetch(`/api/annotations/${annotationId}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(data?.error ?? "Couldn’t delete the annotation — try again");
        return;
      }

      setOpen(false);
      toast.success("Annotation deleted");
      if (redirectTo) {
        router.replace(redirectTo);
      } else {
        router.refresh();
      }
    } catch {
      toast.error("Couldn’t delete the annotation — try again");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="min-h-10 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
          aria-label="Delete annotation"
        >
          <Trash2 />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="serif-display text-2xl font-normal">
            Delete this annotation?
          </DialogTitle>
          <DialogDescription>
            This permanently removes the annotation and its comments from your
            profile and the public feed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={pending}
          >
            {pending ? "Deleting…" : "Delete annotation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
