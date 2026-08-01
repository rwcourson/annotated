"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

type Phase =
  | { kind: "idle" }
  | { kind: "recording"; startedAt: number }
  | { kind: "uploading" }
  | { kind: "done"; url: string }
  | { kind: "error"; message: string };

export default function MicRecorder({
  onUploaded,
  onCleared,
}: {
  onUploaded: (url: string) => void;
  onCleared: () => void;
}) {
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [elapsed, setElapsed] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (phase.kind !== "recording") return;
    const t = setInterval(
      () => setElapsed(Math.floor((Date.now() - phase.startedAt) / 1000)),
      500
    );
    return () => clearInterval(t);
  }, [phase]);

  async function start() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setPhase({
        kind: "error",
        message: "Microphone not available in this browser.",
      });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        await upload(blob);
      };
      recorderRef.current = recorder;
      recorder.start();
      setElapsed(0);
      setPhase({ kind: "recording", startedAt: Date.now() });
    } catch {
      setPhase({ kind: "error", message: "Microphone permission denied." });
    }
  }

  function stop() {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setPhase({ kind: "uploading" });
  }

  async function upload(blob: Blob) {
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Upload failed");
      }
      const data = await res.json();
      setPhase({ kind: "done", url: data.url });
      onUploaded(data.url);
    } catch (err) {
      setPhase({
        kind: "error",
        message: err instanceof Error ? err.message : "Upload failed",
      });
    }
  }

  function clear() {
    setPhase({ kind: "idle" });
    onCleared();
  }

  return (
    <div className="rounded-2xl bg-zinc-50 p-4">
      {phase.kind === "idle" && (
        <Button type="button" variant="outline" onClick={start}>
          <Mic className="text-red-500" />
          Record audio commentary
        </Button>
      )}
      {phase.kind === "recording" && (
        <div className="flex items-center gap-3">
          <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
          <span className="text-sm font-medium text-zinc-700">
            Recording… {Math.floor(elapsed / 60)}:
            {(elapsed % 60).toString().padStart(2, "0")}
          </span>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={stop}
            className="ml-auto"
          >
            <Square className="text-red-500" /> Stop
          </Button>
        </div>
      )}
      {phase.kind === "uploading" && (
        <p className="text-sm text-zinc-500">Uploading audio…</p>
      )}
      {phase.kind === "done" && (
        <div className="flex items-center gap-3">
          <audio src={phase.url} controls className="h-9 flex-1" />
          <button
            type="button"
            onClick={clear}
            className="icon-action min-h-10 rounded-full px-3 text-xs font-medium text-zinc-400 hover:text-zinc-700"
          >
            Remove
          </button>
        </div>
      )}
      {phase.kind === "error" && (
        <div className="flex items-center gap-3">
          <p className="text-sm text-red-600">{phase.message}</p>
          <button
            type="button"
            onClick={clear}
            className="icon-action ml-auto min-h-10 rounded-full px-3 text-xs font-medium text-zinc-400 hover:text-zinc-700"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
