import { Badge } from "@/components/ui/badge";

const STYLES: Record<string, { dot: string; label: string }> = {
  article: { dot: "#2259a8", label: "Article" },
  video: { dot: "#e64d39", label: "Video clip" },
  audio: { dot: "#c88732", label: "Audio clip" },
};

export default function TypeBadge({ type }: { type: string }) {
  const s = STYLES[type] ?? { dot: "#71717a", label: type };
  return (
    <Badge variant="secondary">
      <span
        aria-hidden
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: s.dot }}
      />
      {s.label}
    </Badge>
  );
}
