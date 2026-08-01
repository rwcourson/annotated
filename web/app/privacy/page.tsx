import Link from "next/link";

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
    <main className="page-wrap py-16 sm:py-24">
      <p className="eyebrow">Privacy</p>
      <h1 className="mt-5 max-w-[10ch] text-5xl font-medium leading-[.92] tracking-[-0.065em] text-[var(--ink)] sm:text-7xl">
        Capture is always your choice.
      </h1>
      <div className="mt-12 grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:gap-20">
        <p className="max-w-md text-lg leading-relaxed text-[var(--muted-ink)]">
          Annotated saves the source material and commentary you choose to publish. It does not collect page contents in the background or sell personal information.
        </p>
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
            <h2 className="text-2xl font-medium tracking-[-0.04em]">Questions or deletion</h2>
            <p className="mt-3 text-[var(--muted-ink)]">A production support email will be published here before launch. Fair-use disputes can be submitted through the visible “File a claim” action on every annotation.</p>
          </section>
          <Link href="/" className="text-action mt-2 w-fit font-semibold">Return home</Link>
        </div>
      </div>
    </main>
  );
}
