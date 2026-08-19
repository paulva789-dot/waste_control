import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: "Who's behind CleanCity and where the platform operates.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <div className="w-11 h-11 rounded-xl bg-brand-light text-brand-dark flex items-center justify-center mb-4">
          <Users size={20} />
        </div>
        <h1 className="text-3xl font-bold">About CleanCity</h1>
        <p className="mt-4 text-[var(--muted)]">
          CleanCity connects residents, waste collectors, HYSACAM and municipal councils around live pickup
          requests, GPS vehicle tracking, complaint reporting and analytics — one platform for everyone
          involved in getting waste off the street.
        </p>

        <div className="mt-10 rounded-xl border-2 border-dashed border-[var(--border-soft)] p-6 bg-[var(--background)]">
          <p className="text-sm font-semibold text-brand-dark">Placeholder content — replace before launch</p>
          <p className="text-sm text-[var(--muted)] mt-2">
            This page is a structural placeholder. Swap in the real company name, registration details,
            founder names and photos, and the town(s) you operate in.
          </p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="font-medium w-32 shrink-0">Company</dt>
              <dd className="text-[var(--muted)]">[Legal company name]</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium w-32 shrink-0">Operating in</dt>
              <dd className="text-[var(--muted)]">[Town / commune]</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium w-32 shrink-0">Founders</dt>
              <dd className="text-[var(--muted)]">[Name, role] · [Name, role]</dd>
            </div>
          </dl>
        </div>
      </main>
      <Footer />
    </div>
  );
}
