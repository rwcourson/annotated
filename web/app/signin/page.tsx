import { redirect } from "next/navigation";
import type { Metadata } from "next";
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
    <div className="mx-auto flex min-h-[82vh] max-w-md flex-col items-center justify-center px-4 py-16">
      <Orb size={34} />
      <h1 className="serif-display mt-7 text-center text-5xl leading-[.92] text-[var(--ink)] sm:text-6xl">
        Join the annotation.
      </h1>
      <p className="mt-5 text-center text-[15px] text-[var(--muted-ink)]">
        Sign in to publish clips, follow annotators, and comment.
      </p>

      <div className="mt-12 w-full space-y-3">
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
          <div className="rounded-2xl bg-zinc-50 p-4 text-center text-xs text-zinc-400">
            Google sign-in — set AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET to enable
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
          <div className="rounded-2xl bg-zinc-50 p-4 text-center text-xs text-zinc-400">
            X sign-in — set AUTH_TWITTER_ID / AUTH_TWITTER_SECRET to enable
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
    </div>
  );
}
