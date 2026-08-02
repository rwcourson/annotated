"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function UserAvatar({
  name,
  image,
  size = 32,
  className = "",
}: {
  name?: string | null;
  image?: string | null;
  size?: number;
  className?: string;
}) {
  const initial = (name ?? "?").trim().charAt(0).toUpperCase() || "?";
  const fallbackColors = ["#6253ed", "#e75b43", "#b67716", "#9d5bb7"];
  const fallbackColor = fallbackColors[initial.charCodeAt(0) % fallbackColors.length];
  return (
    <Avatar className={className} style={{ width: size, height: size }}>
      {/* A native image keeps the project artwork visible immediately instead of
          briefly collapsing to initials while Radix resolves its load state. */}
      <img
        src={image || "/avatars/default-profile.webp"}
        alt={image ? `${name ?? "User"} profile photo` : "Default Annotated profile artwork"}
        className="absolute inset-0 z-10 h-full w-full object-cover"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
      <AvatarFallback
        style={{
          background: fallbackColor,
          color: "#f8f4ed",
          fontSize: Math.round(size * 0.4),
          fontWeight: 600,
        }}
      >
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}
