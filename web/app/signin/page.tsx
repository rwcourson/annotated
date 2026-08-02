import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Orb from "@/components/Orb";

export const metadata: Metadata = { title: "Sign in" };

const googleConfigured = !!(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
);
const twitterConfigured = !!(
  process.env.AUTH_TWITTER_ID && process.env.AUTH_TWITTER_SECRET
);
const isDev = process.env.NODE_ENV === "development";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl: requestedCallback } = await searchParams;
  const callbackUrl =
    requestedCallback?.startsWith("/") && !requestedCallback.startsWith("//")
      ? requestedCallback
      : "/feed";
  const session = await auth();
  if (session?.user?.id) redirect(callbackUrl);

  return (
    <div className="page-wrap grid min-h-[calc(100vh-84px)] items-stretch gap-8 py-8 lg:grid-cols-[1.05fr_.95fr]">
      <div className="relative hidden min-h-[680px] overflow-hidden rounded-[28px] lg:block">
        <Image src="/art/pixel-bloom-hq.webp" alt="" fill priority unoptimized sizes="52vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/25" />
        <div className="absolute inset-x-8 bottom-8 rounded-[22px] bg-white/92 p-7 shadow-[0_30px_70px_-38px_rgba(27,25,55,.72)] backdrop-blur-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[var(--action-dark)]">One account, every source</p>
          <p className="mt-3 max-w-[18ch] text-3xl font-medium leading-[1] tracking-[-.055em] text-[var(--ink)]">Your annotations follow you from the sidebar to the public conversation.</p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--muted-ink)]">
            {['Publish clips', 'Follow people', 'Join comments'].map((item) => <span key={item} className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[var(--action-dark)]" />{item}</span>)}
          </div>
        </div>
      </div>

      <div className="flex min-h-[620px] flex-col justify-center px-2 py-10 sm:px-12 lg:px-16">
        <Link href="/" className="text-action mb-12 inline-flex w-fit items-center gap-2 text-xs font-semibold"><ArrowLeft className="h-3.5 w-3.5" /> Back home</Link>
        <Orb size={34} />
        <h1 className="serif-display mt-7 max-w-[9ch] text-5xl leading-[.92] text-[var(--ink)] sm:text-6xl">
          Join the annotation.
        </h1>
        <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-[var(--muted-ink)]">
          Sign in to publish clips, follow annotators, and comment. Your sidebar reconnects automatically.
        </p>

      <div className="mt-10 w-full max-w-md space-y-3">
        {googleConfigured ? (
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: callbackUrl });
            }}
          >
            <Button type="submit" size="lg" className="w-full">
              Continue with Google
            </Button>
          </form>
        ) : (
          <div className="rounded-2xl bg-white p-4 text-center text-xs text-[var(--muted-ink)]">
            Google sign-in is temporarily unavailable.
          </div>
        )}

        {twitterConfigured ? (
          <form
            action={async () => {
              "use server";
              await signIn("twitter", { redirectTo: callbackUrl });
            }}
          >
            <Button type="submit" size="lg" variant="outline" className="w-full">
              Continue with X
            </Button>
          </form>
        ) : (
          <div className="rounded-2xl bg-white p-4 text-center text-xs text-[var(--muted-ink)]">
            X sign-in is temporarily unavailable.
          </div>
        )}

        {isDev && (
          <div className="surface mt-8 p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Dev only — demo sign in
            </p>
            <form
              className="mt-3 flex gap-2"
              action={async (formData: FormData) => {
                "use server";
                const username = String(formData.get("username") ?? "");
                await signIn("demo", { username, redirectTo: callbackUrl });
              }}
            >
              <Input
                name="username"
                required
                minLength={3}
                maxLength={20}
                pattern="[a-z0-9_]+"
                placeholder="pick a username, e.g. ada"
              />
              <Button type="submit">Enter</Button>
            </form>
            <p className="mt-3 text-xs leading-relaxed text-zinc-400">
              Pick-or-create a local demo user. Disabled outside development;
              production is OAuth-only.
            </p>
          </div>
        )}
      </div>
      <p className="mt-8 max-w-md text-xs leading-relaxed text-[var(--muted-ink)]">By continuing, you create a public Annotated profile. We only publish material you explicitly choose to annotate.</p>
      </div>
    </div>
  );
}
