import type { Metadata } from "next";
import Link from "next/link";
import { Check, Building2, Sparkles, Landmark } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Free for residents. Business waste plans and council licensing for CleanCity.",
};

const BUSINESS_TIERS = [
  {
    name: "Boutique",
    customer: "Kiosk, small shop, salon",
    price: "10,000",
    features: ["2 pickups / week", "Digital waste log", "SMS reminders"],
  },
  {
    name: "Restaurant",
    customer: "Restaurant, bar, bakery, small clinic",
    price: "25,000",
    features: ["Daily pickup", "Monthly compliance certificate", "2 staff accounts"],
    highlighted: true,
  },
  {
    name: "Business",
    customer: "Hotel, supermarket, school, larger clinic",
    price: "60,000",
    features: ["Daily + on-call pickup", "Container rental", "Waste-by-type analytics"],
  },
  {
    name: "Enterprise",
    customer: "Market association, factory, campus",
    price: "Custom",
    features: ["Dedicated schedule", "Full dashboard access", "Quarterly audit report"],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 sm:px-6 pt-16 pb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold">Simple pricing, built around who&apos;s paying</h1>
          <p className="mt-4 text-[var(--muted)]">
            Free for residents. Businesses pay a monthly plan for scheduled pickups and compliance
            certificates. Councils and HYSACAM get a full operations licence.
          </p>
          <div className="mt-4 inline-block rounded-full bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1.5 border border-amber-200">
            Illustrative pricing — figures shown here are planning assumptions, not final rates
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
          <div className="card p-6 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-brand-light text-brand-dark flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="font-semibold">Residents — always free</p>
              <p className="text-sm text-[var(--muted)] mt-0.5">
                Reporting, the collection schedule, standard pickup requests and notifications cost nothing.
                <Link href="/register" className="text-brand-dark font-semibold ml-1">Sign up free →</Link>
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
          <div className="flex items-center gap-2 justify-center mb-8">
            <Building2 size={20} className="text-brand" />
            <h2 className="text-2xl font-bold">Business waste plans</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BUSINESS_TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`card p-5 flex flex-col ${tier.highlighted ? "border-2 border-brand shadow-md" : ""}`}
              >
                <p className="font-bold">{tier.name}</p>
                <p className="text-xs text-[var(--muted)] mt-1">{tier.customer}</p>
                <p className="mt-4 text-2xl font-extrabold">
                  {tier.price === "Custom" ? "Custom" : `${tier.price} FCFA`}
                  {tier.price !== "Custom" && <span className="text-sm font-medium text-[var(--muted)]"> /month</span>}
                </p>
                <ul className="mt-4 space-y-2 text-sm flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check size={15} className="text-brand mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={`mailto:hello@example.com?subject=${encodeURIComponent(`CleanCity ${tier.name} plan enquiry`)}`}
                  className="btn-secondary text-center text-sm mt-5"
                >
                  Request a demo
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
          <div className="card p-8 text-center bg-brand-dark text-white">
            <Landmark size={26} className="mx-auto mb-3" />
            <h2 className="text-xl font-bold">For councils &amp; HYSACAM</h2>
            <p className="mt-2 text-sm text-white/80 max-w-xl mx-auto">
              Full platform access, analytics exports, the citizen reporting channel and a dedicated fleet
              module — priced per commune, tiered by population.
            </p>
            <a
              href={`mailto:hello@example.com?subject=${encodeURIComponent("CleanCity council licence enquiry")}`}
              className="btn-primary inline-block mt-5"
            >
              Talk to us
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
