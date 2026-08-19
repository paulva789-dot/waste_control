import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that apply when you use CleanCity.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <div className="w-11 h-11 rounded-xl bg-brand-light text-brand-dark flex items-center justify-center mb-4">
          <FileText size={20} />
        </div>
        <h1 className="text-3xl font-bold">Terms of service</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Last updated: [date]</p>

        <div className="mt-6 rounded-xl border-2 border-dashed border-[var(--border-soft)] p-4 bg-[var(--background)]">
          <p className="text-sm font-semibold text-brand-dark">Placeholder — have this reviewed before launch</p>
          <p className="text-sm text-[var(--muted)] mt-1">
            This is a structural draft, not legal advice. Replace the bracketed fields and have it reviewed
            before publishing.
          </p>
        </div>

        <div className="mt-8 space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="font-semibold text-lg">1. Using the service</h2>
            <p className="mt-2 text-[var(--muted)]">
              By creating an account you agree to these terms and to [legal company name]&apos;s privacy policy.
              You must provide accurate information and are responsible for activity on your account.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg">2. Pickups and complaints</h2>
            <p className="mt-2 text-[var(--muted)]">
              Requesting a pickup or filing a complaint does not guarantee a specific resolution time unless a
              service window is explicitly shown to you. False or abusive reports may result in account
              suspension.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg">3. Payments</h2>
            <p className="mt-2 text-[var(--muted)]">
              Paid features (premium membership, live-tracking unlock, on-demand pickups) are billed via Mobile
              Money at the price shown before you confirm. Refund requests go to [support email].
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg">4. Driver and collector accounts</h2>
            <p className="mt-2 text-[var(--muted)]">
              Staff accounts (collector, driver, supervisor, council admin, inspector) are issued by an
              administrator and may be revoked at any time for policy violations.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg">5. Limitation of liability</h2>
            <p className="mt-2 text-[var(--muted)]">
              The service is provided &ldquo;as is&rdquo;. [Legal company name] is not liable for missed
              pickups caused by factors outside its control (e.g. vehicle breakdown, weather, access issues).
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg">6. Contact</h2>
            <p className="mt-2 text-[var(--muted)]">Questions about these terms: [support email].</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
