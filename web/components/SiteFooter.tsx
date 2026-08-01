import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Orb from "@/components/Orb";

const FOOTER_LINKS = [
  {
    title: "Use annotated",
    links: [
      { label: "Connect the sidebar", href: "/connect" },
      { label: "Make an annotation", href: "/new" },
      { label: "Public feed", href: "/feed" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Source formats", href: "/#sources" },
      { label: "Latest annotations", href: "/feed?view=latest" },
    ],
  },
  {
    title: "Principles",
    links: [
      { label: "Keep the source close", href: "/#requirements" },
      { label: "Fair-use claims", href: "/#requirements" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
] as const;

export default function SiteFooter() {
  return (
    <footer className="relative isolate -mt-px overflow-hidden bg-[#315d99] text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f7f6f4_0%,#f1dfe9_9%,#bb9fd1_24%,#6b73b2_45%,#315f99_68%,#174f7d_100%)]" />
        <Image
          src="/art/pixel-horizon-ultra.webp"
          alt=""
          fill
          unoptimized
          sizes="100vw"
          className="footer-pixel-field object-cover object-bottom"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_28%,rgba(255,116,139,.28),transparent_34%),radial-gradient(circle_at_82%_22%,rgba(128,152,255,.3),transparent_35%),linear-gradient(180deg,transparent_0%,rgba(26,47,105,.12)_45%,rgba(7,42,75,.42)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[var(--canvas)] via-[color:rgba(247,246,244,.7)] to-transparent" />
      </div>

      <div className="page-wrap grid gap-12 pb-12 pt-44 sm:pb-14 sm:pt-52 lg:grid-cols-[1.05fr_.95fr] lg:gap-20 lg:pb-16 lg:pt-56">
        <div className="max-w-lg">
          <Link href="/" className="group inline-flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[#5d70af]">
            <Orb size={32} className="transition-transform duration-300 ease-out group-hover:rotate-12 group-hover:scale-105" />
            <span className="text-xl font-semibold tracking-[-0.045em]">annotated</span>
          </Link>
          <h2 className="mt-8 max-w-[11ch] text-[clamp(2.25rem,4.5vw,4.5rem)] font-medium leading-[.94] tracking-[-0.065em]">
            Save the part worth coming back to.
          </h2>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-white/76 sm:text-base">
            Keep a moment, add your note, and share it with the original link attached.
          </p>
          <Link
            href="/connect"
            className="group mt-8 inline-flex min-h-12 items-center gap-4 rounded-full bg-white px-5 text-sm font-semibold text-[#33498f] shadow-[0_20px_55px_-28px_rgba(8,29,73,.75)] transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#fff7fb] hover:shadow-[0_24px_65px_-26px_rgba(8,29,73,.72)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[#5d70af] active:translate-y-0 active:scale-[.98]"
          >
            Open the Chrome sidebar
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3">
          {FOOTER_LINKS.map((column) => (
            <div key={column.title}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/55">{column.title}</p>
              <ul className="mt-5 space-y-3.5">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="group inline-flex min-h-7 items-center gap-2 text-sm text-white/72 transition-colors duration-200 hover:text-white focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <span>{link.label}</span>
                      <span className="grid h-4 w-4 translate-x-[-3px] place-items-center rounded-[5px] bg-white/14 opacity-0 transition duration-200 group-hover:translate-x-0 group-hover:opacity-100">
                        <ArrowUpRight className="h-2.5 w-2.5" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="relative h-[240px] overflow-hidden sm:h-[315px] lg:h-[380px]">
        <div className="absolute inset-x-0 bottom-[-0.07em] flex justify-center overflow-hidden px-3">
          <p className="footer-wordmark whitespace-nowrap text-[clamp(5rem,19vw,17rem)] font-semibold leading-[.72] tracking-[-0.095em] text-white/88">
            annotated
          </p>
        </div>
      </div>
    </footer>
  );
}
