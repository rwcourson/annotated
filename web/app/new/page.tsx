import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { AppWindow, ArrowUpRight, Check, Link2, Mic } from "lucide-react";
import { auth } from "@/auth";
import NewAnnotationForm from "@/components/NewAnnotationForm";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "New annotation" };

export default async function NewPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  return (
    <div className="page-wrap py-12 sm:py-16">
      <header className="grid gap-7 border-b hairline pb-9 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="eyebrow">Put it on the record</p>
          <h1 className="serif-display mt-4 text-5xl leading-[.92] text-[var(--ink)] sm:text-7xl">New annotation</h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[var(--muted-ink)]">
            Paste a source, choose the exact moment, and add what you noticed. The published page keeps all three together.
          </p>
        </div>
        <Button variant="outline" asChild className="justify-self-start">
          <Link href="/connect"><AppWindow /> Use the Chrome sidebar <ArrowUpRight /></Link>
        </Button>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
        <div className="surface p-6 sm:p-10">
          <NewAnnotationForm />
        </div>
        <aside className="space-y-5 lg:sticky lg:top-[104px]">
          <section className="rounded-[20px] bg-[var(--ink)] p-5 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-white/48">What publishes</p>
            <ul className="mt-5 space-y-4 text-sm">
              <li className="flex gap-3"><Link2 className="mt-0.5 h-4 w-4 shrink-0 text-[#ff806b]" /><span><strong className="block font-semibold">The source</strong><span className="mt-1 block text-xs leading-relaxed text-white/52">Original link and useful metadata.</span></span></li>
              <li className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#ff806b]" /><span><strong className="block font-semibold">The moment</strong><span className="mt-1 block text-xs leading-relaxed text-white/52">A passage or a precise media clip.</span></span></li>
              <li className="flex gap-3"><Mic className="mt-0.5 h-4 w-4 shrink-0 text-[#ff806b]" /><span><strong className="block font-semibold">Your context</strong><span className="mt-1 block text-xs leading-relaxed text-white/52">Written or recorded commentary.</span></span></li>
            </ul>
          </section>
          <p className="px-2 text-xs leading-relaxed text-[var(--muted-ink)]">For the fastest flow, open Annotated beside the source in Chrome. The sidebar fills source details for you.</p>
        </aside>
      </div>
    </div>
  );
}
