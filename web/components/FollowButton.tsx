"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FollowButton({
  userId,
  initialFollowing,
  isAuthed,
  compact = false,
}: {
  userId: string;
  initialFollowing: boolean;
  isAuthed: boolean;
  compact?: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function toggle() {
    if (!isAuthed) {
      router.push("/signin");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const data = await res.json();
        setFollowing(data.following);
        toast.success(data.following ? "Following" : "Unfollowed");
      } else {
        toast.error("Couldn't update follow — try again");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      onClick={toggle}
      disabled={pending}
      size="sm"
      variant={following ? "secondary" : "default"}
      aria-pressed={following}
      className={compact ? "min-w-[82px] px-3" : "min-w-[96px]"}
    >
      {!pending && (following ? <Check /> : <UserPlus />)}
      {pending ? "…" : following ? "Following" : "Follow"}
    </Button>
  );
}
