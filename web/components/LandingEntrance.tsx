"use client";

import { useEffect, useState, type ReactNode } from "react";
import Orb from "@/components/Orb";

type Phase = "preparing" | "showing" | "exiting" | "done";

export default function LandingEntrance({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>("preparing");

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setPhase("done");
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    let cancelled = false;
    let firstFrame = 0;
    let secondFrame = 0;
    let exitTimer = 0;
    let doneTimer = 0;

    // Start only after the brand font is available (or a short safety timeout),
    // then wait for two paints so every animated element has a stable initial
    // frame. This prevents hydration/font swaps from shortening the sequence.
    const fontReady = document.fonts?.ready ?? Promise.resolve();
    const safetyDelay = new Promise<void>((resolve) => window.setTimeout(resolve, 280));

    Promise.race([fontReady, safetyDelay]).then(() => {
      if (cancelled) return;
      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => {
          if (cancelled) return;
          setPhase("showing");

          exitTimer = window.setTimeout(() => {
            setPhase("exiting");
            document.body.style.overflow = previousOverflow;
          }, 1650);
          doneTimer = window.setTimeout(() => setPhase("done"), 2350);
        });
      });
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const isReady = phase === "exiting" || phase === "done";

  return (
    <div className={`landing-entrance ${isReady ? "is-ready" : "is-waiting"}`}>
      <div className="landing-hero-reveal">{children}</div>

      {phase !== "done" ? (
        <div
          className={`intro-overlay ${phase === "showing" || phase === "exiting" ? "is-running" : ""} ${phase === "exiting" ? "is-exiting" : ""}`}
          aria-hidden="true"
        >
          <div className="intro-lockup">
            <div className="intro-mark-stage">
              <span className="intro-ring" />
              <Orb size={74} className="intro-mark" />
            </div>
            <div className="intro-copy">
              <p className="intro-wordmark">annotated</p>
              <p className="intro-tagline">Keep the source close.</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
