import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AppWindow, Check, Highlighter, LockKeyhole } from "lucide-react";
import { auth } from "@/auth";
import ConnectClient from "@/components/ConnectClient";

export const metadata: Metadata = { title: "Connect the extension" };

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ extension_nonce?: string }>;
}) {
  const { extension_nonce: extensionNonce } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) {
    const returnTo = extensionNonce
      ? `/connect?extension_nonce=${encodeURIComponent(extensionNonce)}`
      : "/connect";
    redirect(`/signin?callbackUrl=${encodeURIComponent(returnTo)}`);
  }

  return (
    <div className="page-wrap max-w-3xl py-14 sm:py-20">
      <p className="eyebrow">Chrome side panel</p>
      <h1 className="serif-display mt-4 max-w-[11ch] text-5xl leading-[.92] text-[var(--ink)] sm:text-7xl">
        Connect the extension
      </h1>
      <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[var(--muted-ink)]">
        The Chrome extension clips pages straight into your annotated feed.
        Connect once, then clip articles, videos, and podcasts directly into
        your account. The sidebar will confirm your profile automatically.
      </p>

      <div className="mt-10">
        <ConnectClient extensionNonce={extensionNonce} />
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-[1.15fr_.85fr]">
      <section className="surface p-7">
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--soft)]"><AppWindow className="h-4 w-4 text-[var(--action-dark)]" /></span><div><p className="eyebrow">Local setup</p><h2 className="mt-1 text-lg font-semibold tracking-[-.035em] text-[var(--ink)]">Install in developer mode</h2></div></div>
        <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-[var(--muted-ink)] marker:font-semibold marker:text-[var(--action-dark)]">
          <li>
            Open{" "}
            <code className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-800">
              chrome://extensions
            </code>{" "}
            in Chrome.
          </li>
          <li>
            Toggle <span className="font-medium text-zinc-900">Developer mode</span>{" "}
            (top right).
          </li>
          <li>
            Click{" "}
            <span className="font-medium text-zinc-900">Load unpacked</span> and
            select the{" "}
            <code className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-800">
              extension/
            </code>{" "}
            folder from this repository.
          </li>
          <li>
            Click the annotated toolbar icon, then choose
            <span className="font-medium text-zinc-900"> Connect account</span>.
            Sign in here and the extension reconnects automatically.
          </li>
          <li>
            Highlight a passage on any page — or open a YouTube video or
            podcast — and clip it from the toolbar button.
          </li>
        </ol>
      </section>
      <aside className="rounded-[20px] bg-[var(--ink)] p-6 text-white">
        <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-white/48">After you connect</p>
        <div className="mt-6 space-y-5">
          <div className="flex gap-3"><Highlighter className="mt-0.5 h-4 w-4 shrink-0 text-[#ff806b]" /><div><p className="text-sm font-semibold">Clip without leaving the page</p><p className="mt-1 text-xs leading-relaxed text-white/52">Your source stays visible beside the side panel.</p></div></div>
          <div className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#ff806b]" /><div><p className="text-sm font-semibold">Publish to your profile</p><p className="mt-1 text-xs leading-relaxed text-white/52">New annotations appear in your public feed immediately.</p></div></div>
          <div className="flex gap-3"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[#ff806b]" /><div><p className="text-sm font-semibold">You stay in control</p><p className="mt-1 text-xs leading-relaxed text-white/52">Annotated reads a page only when you choose to capture it.</p></div></div>
        </div>
      </aside>
      </div>
    </div>
  );
}
