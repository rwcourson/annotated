import Link from "next/link";
import { ArrowRight, Check, LockKeyhole } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  title: "Privacy — annotated",
  description: "How the Annotated Chrome extension and web app handle data.",
};

const PERMISSIONS = [
  ["Side panel", "Shows Annotated beside the page you are using."],
  ["Current tab and scripting", "Reads the current page only when needed to capture the URL, metadata, selected passage, or media state."],
  ["Context menu", "Adds the Annotated action to selected text."],
  ["Local storage", "Keeps your account connection and extension settings on your device."],
  ["Audio capture", "Records spoken commentary only after you press the recording control."],
] as const;

export default function PrivacyPage() {
  return (
    <>
    <main className="page-wrap py-16 sm:py-24">
      <p className="eyebrow">Privacy</p>
      <h1 className="mt-5 max-w-[10ch] text-5xl font-medium leading-[.92] tracking-[-0.065em] text-[var(--ink)] sm:text-7xl">
        Capture is always your choice.
      </h1>
      <div className="mt-12 grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:gap-20">
        <aside className="lg:sticky lg:top-[104px] lg:self-start">
          <p className="max-w-md text-lg leading-relaxed text-[var(--muted-ink)]">
            Annotated saves the source material and commentary you choose to publish. It does not collect page contents in the background or sell personal information.
          </p>
          <div className="mt-8 rounded-[20px] bg-[var(--ink)] p-6 text-white">
            <LockKeyhole className="h-5 w-5 text-[#ff806b]" />
            <p className="mt-4 text-lg font-semibold tracking-[-.035em]">The short version</p>
            <ul className="mt-4 space-y-3 text-xs leading-relaxed text-white/62">
              {['Capture starts only when you act', 'Published annotations are public', 'Account tokens stay private'].map((item) => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ff806b]" />{item}</li>)}
            </ul>
          </div>
        </aside>
        <div className="grid gap-8 text-sm leading-relaxed text-[var(--ink)]">
          <section>
            <h2 className="text-2xl font-medium tracking-[-0.04em]">Information we process</h2>
            <p className="mt-3 text-[var(--muted-ink)]">Your Google or X profile, source details you choose to capture, text or recorded commentary, and public follows, comments, and fair-use claims.</p>
          </section>
          <section>
            <h2 className="text-2xl font-medium tracking-[-0.04em]">Extension permissions</h2>
            <dl className="mt-4 grid gap-3">
              {PERMISSIONS.map(([term, detail]) => (
                <div key={term} className="rounded-2xl bg-white p-4">
                  <dt className="font-semibold">{term}</dt>
                  <dd className="mt-1 text-[var(--muted-ink)]">{detail}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section>
            <h2 className="text-2xl font-medium tracking-[-0.04em]">Storage and sharing</h2>
            <p className="mt-3 text-[var(--muted-ink)]">Published annotations are public by design and always link to their original source. Account data is stored in the production database, and recorded commentary is stored in managed object storage.</p>
          </section>
          <section>
            <h2 className="text-2xl font-medium tracking-[-0.04em]">Requests and claims</h2>
            <p className="mt-3 text-[var(--muted-ink)]">Annotated does not publish a general support email. Fair-use disputes, removal requests, and privacy concerns about published content can be submitted through the visible “File a claim” action on the relevant annotation.</p>
          </section>
          <Link href="/" className="text-action mt-2 w-fit font-semibold">Return home <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </main>
    <SiteFooter />
    </>
  );
}
