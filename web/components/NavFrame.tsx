"use client";

import { useEffect, useState, type ReactNode } from "react";

export default function NavFrame({ children }: { children: ReactNode }) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setCompact(window.scrollY > 28));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
    };
  }, []);

  return (
    <header className="pointer-events-none sticky top-0 z-40 flex h-[84px] items-start justify-center pt-3">
      <nav
        aria-label="Primary navigation"
        data-compact={compact}
        className={`pointer-events-auto flex items-center justify-between rounded-full border bg-white/90 px-4 backdrop-blur-xl transition-[width,max-width,height,border-color,box-shadow,background-color] duration-200 ease-out sm:px-5 ${
          compact
            ? "h-[56px] w-[calc(100%_-_2rem)] max-w-[64rem] border-black/[0.1] shadow-[0_16px_38px_-28px_rgba(30,24,21,.5)]"
            : "h-[64px] w-[calc(100%_-_1.5rem)] max-w-[76rem] border-black/[0.07] shadow-[0_12px_32px_-28px_rgba(30,24,21,.36)]"
        }`}
      >
        {children}
      </nav>
    </header>
  );
}
