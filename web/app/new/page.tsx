import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import NewAnnotationForm from "@/components/NewAnnotationForm";

export const metadata: Metadata = { title: "New annotation" };

export default async function NewPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  return (
    <div className="page-wrap max-w-3xl py-14 sm:py-20">
      <p className="eyebrow">Put it on the record</p>
      <h1 className="serif-display mt-4 text-5xl leading-[.92] text-[var(--ink)] sm:text-7xl">New annotation</h1>
      <p className="mt-5 text-[15px] text-[var(--muted-ink)]">
        Paste a source, pick your clip, say what it means. This mirrors the
        extension flow exactly.
      </p>
      <div className="surface mt-12 p-6 sm:p-10">
        <NewAnnotationForm />
      </div>
    </div>
  );
}
