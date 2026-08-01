import { redirect } from "next/navigation";
import type { Metadata } from "next";
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

      <section className="surface mt-5 p-7">
        <h2 className="text-sm font-semibold tracking-tight text-zinc-900">
          Install (developer mode)
        </h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-zinc-600">
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
    </div>
  );
}
