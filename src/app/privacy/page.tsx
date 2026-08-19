import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What CleanCity collects, why, and how long it's kept.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <div className="w-11 h-11 rounded-xl bg-brand-light text-brand-dark flex items-center justify-center mb-4">
          <ShieldCheck size={20} />
        </div>
        <h1 className="text-3xl font-bold">Privacy policy</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Last updated: [date]</p>

        <div className="mt-6 rounded-xl border-2 border-dashed border-[var(--border-soft)] p-4 bg-[var(--background)]">
          <p className="text-sm font-semibold text-brand-dark">Placeholder — have this reviewed before launch</p>
          <p className="text-sm text-[var(--muted)] mt-1">
            This is a structural draft covering what the product actually collects. It is not legal advice —
            replace the bracketed fields and have it checked against Cameroonian data protection requirements
            before publishing.
          </p>
        </div>

        <div className="prose prose-sm max-w-none mt-8 space-y-6 text-sm leading-relaxed text-[var(--foreground)]">
          <section>
            <h2 className="font-semibold text-lg">1. Who we are</h2>
            <p className="mt-2 text-[var(--muted)]">
              CleanCity ([legal company name], [address]) operates this platform. Contact us about privacy at
              [privacy email].
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg">2. What we collect</h2>
            <ul className="mt-2 space-y-1 text-[var(--muted)] list-disc pl-5">
              <li>Account details: name, email, phone number, role, town and neighbourhood.</li>
              <li>Location data: the address and GPS coordinates of pickup requests and complaints you submit.</li>
              <li>
                Continuous GPS location while a collector or driver account is actively en route on a job, used to
                power the live tracking map.
              </li>
              <li>Photographs attached to complaint reports.</li>
              <li>Payment metadata (amount, provider, reference) for Mobile Money transactions — we do not store
                Mobile Money PINs or full account credentials.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-lg">3. How we use it</h2>
            <p className="mt-2 text-[var(--muted)]">
              To operate pickups and complaint handling, show live vehicle locations to authorised users, generate
              analytics for councils and operators, and send you status notifications.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg">4. Driver and collector location tracking</h2>
            <p className="mt-2 text-[var(--muted)]">
              Vehicle location is visible to council/HYSACAM staff at all times while a job is active, and to
              residents who have unlocked live tracking. We retain raw location history for [retention period —
              e.g. 90 days] before it is deleted or aggregated.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg">5. Who we share data with</h2>
            <p className="mt-2 text-[var(--muted)]">
              Only aggregated, anonymised, zone-level data is ever shared externally (e.g. with councils for
              reporting, or donors for impact data). We do not sell individual resident location data.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg">6. Your rights</h2>
            <p className="mt-2 text-[var(--muted)]">
              You can request a copy of your data, ask us to correct it, or ask us to delete your account by
              contacting [privacy email]. Some records may be retained where required for billing or legal
              reasons.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg">7. Contact</h2>
            <p className="mt-2 text-[var(--muted)]">
              Questions about this policy: [privacy email] / [WhatsApp number].
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
