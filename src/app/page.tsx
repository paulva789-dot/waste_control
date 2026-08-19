"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Truck,
  MapPinned,
  MessageSquareWarning,
  BarChart3,
  BellRing,
  ShieldCheck,
  Recycle,
  CheckCircle2,
  ClipboardList,
  Route,
  Users,
  Landmark,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatusBadge from "@/components/StatusBadge";

const TAGLINE = "Track it. Report it. Fix it — together.";

const FEATURES = [
  {
    icon: Truck,
    title: "Live GPS Tracking",
    desc: "Know when the truck is 4 minutes away, live on the map — no more guessing when to put your bin out.",
  },
  {
    icon: MapPinned,
    title: "Smart Pickup Requests",
    desc: "Request a pickup with your exact location attached — the council assigns a collector in one tap.",
  },
  {
    icon: MessageSquareWarning,
    title: "Complaint Reporting",
    desc: "Report illegal dumping or a missed pickup with a photo and GPS location — no account required.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reporting",
    desc: "Councils see collection efficiency, missed pickups and recycling rates at a glance, not in a spreadsheet.",
  },
  {
    icon: BellRing,
    title: "Real-time Notifications",
    desc: "Get notified the moment your pickup is scheduled, on the way, or completed.",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access",
    desc: "Residents, collectors, HYSACAM staff and council admins each see exactly what they need — nothing else.",
  },
];

const HOW_IT_WORKS = [
  {
    icon: MapPinned,
    title: "Request or report",
    desc: "Create a pickup request or report a problem — your exact location is attached automatically.",
  },
  {
    icon: Truck,
    title: "A vehicle gets assigned",
    desc: "The council or HYSACAM schedules a collector and dispatches them to your zone.",
  },
  {
    icon: CheckCircle2,
    title: "Track it to completion",
    desc: "Watch it arrive live on the map, then see it marked complete — no wondering if it happened.",
  },
];

const AUDIENCES = [
  {
    id: "resident",
    label: "Residents",
    icon: Users,
    benefits: [
      "Report dumping, missed pickups or bin problems — no account needed",
      "See the weekly collection schedule for free, always",
      "Track your collector live on the map once unlocked",
    ],
    cta: { label: "Get started free", href: "/register" },
  },
  {
    id: "field",
    label: "Collectors & drivers",
    icon: Route,
    benefits: [
      "Today's assigned pickups in one ordered list",
      "Update status with one tap — start, complete, or flag as missed",
      "Your location shows live to your supervisor while a job is active",
    ],
    cta: { label: "Ask your admin for an account", href: "/about" },
  },
  {
    id: "council",
    label: "Councils & HYSACAM",
    icon: Landmark,
    benefits: [
      "One map showing every vehicle, pending pickup and open complaint",
      "Assign a collector to a pending pickup in a couple of clicks",
      "Analytics on collection efficiency, recycling and complaint resolution",
    ],
    cta: { label: "Talk to us", href: "/pricing" },
  },
];

const FAQS = [
  {
    q: "Is CleanCity free?",
    a: "Yes, for residents. Reporting, the weekly collection schedule and standard pickup requests are free. Live vehicle tracking and on-demand pickups are optional paid add-ons. Businesses and councils pay for the operations tools they use — see the pricing page.",
  },
  {
    q: "Do I need an account to report a problem?",
    a: "No. You can report illegal dumping, a missed pickup or a damaged bin without creating an account — just leave a phone number so we can send you status updates.",
  },
  {
    q: "Who can see my location?",
    a: "Only the coordinates you attach to a specific pickup or complaint are shared, with the collector or council handling it. We don't sell or share individual location data.",
  },
  {
    q: "How do collectors and council staff get access?",
    a: "Staff accounts (collector, driver, supervisor, council admin, inspector) are created by an existing administrator, not self-registered — this keeps privileged roles out of public sign-up.",
  },
  {
    q: "What happens if a pickup is missed?",
    a: "It's marked missed on your dashboard and you get a notification. You can report it as a complaint to flag it to the council directly.",
  },
  {
    q: "Which areas does this cover?",
    a: "The platform supports any town or commune that's been set up with a collection schedule and vehicles — check with your local council about coverage in your area.",
  },
  {
    q: "How do I pay for premium features?",
    a: "Via Mobile Money (MTN or Orange), confirmed directly in the app.",
  },
  {
    q: "Can my business get a compliance record of pickups?",
    a: "That's part of the business waste plans — see the pricing page for what's included at each tier.",
  },
];

export default function Home() {
  const [audience, setAudience] = useState(AUDIENCES[0].id);
  const active = AUDIENCES.find((a) => a.id === audience)!;

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-b from-brand-light to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="badge bg-white text-brand-dark border border-brand/20 mb-5">
              <Recycle size={14} /> Waste management platform
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight text-[var(--foreground)]">
              Know exactly when your <span className="text-brand">waste gets collected</span>
            </h1>
            <p className="mt-3 text-brand-dark font-semibold italic">&ldquo;{TAGLINE}&rdquo;</p>
            <p className="mt-5 text-lg text-neutral-600 max-w-xl">
              One platform connecting residents, waste collectors, HYSACAM, and municipal councils —
              live vehicle tracking, pickup scheduling, complaint resolution, and analytics in a single dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="btn-primary text-base px-6 py-3">
                Get started free
              </Link>
              <Link href="/login" className="btn-secondary text-base px-6 py-3">
                See a live demo
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-[var(--muted)]">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-brand" /> Built for residents, collectors &amp; councils
              </div>
              <div className="flex items-center gap-2">
                <MapPinned size={16} className="text-brand" /> Live GPS tracking
              </div>
            </div>
          </div>

          {/* Honest in-app preview — built from the same live components as the product, not a stock photo. */}
          <div className="card p-3 shadow-xl">
            <div className="rounded-xl bg-neutral-900 p-5 space-y-3">
              <div className="flex items-center justify-between text-white/60 text-xs font-medium px-1">
                <span>Next pickup</span>
                <span>Bastos, Yaoundé</span>
              </div>
              <div className="rounded-lg bg-white p-4 flex items-center gap-3">
                <span className="p-2.5 rounded-lg bg-brand-light text-brand-dark shrink-0">
                  <Truck size={20} />
                </span>
                <div className="text-sm flex-1 min-w-0">
                  <p className="font-semibold">Collector en route</p>
                  <p className="text-[var(--muted)]">4 min away · General waste</p>
                </div>
                <StatusBadge status="IN_PROGRESS" />
              </div>
              <div className="rounded-lg bg-white/95 p-3 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-[var(--muted)]">
                  <ClipboardList size={15} /> Last pickup
                </span>
                <StatusBadge status="COMPLETED" />
              </div>
              <div className="rounded-lg bg-white/95 p-3 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-[var(--muted)]">
                  <MessageSquareWarning size={15} /> Open report
                </span>
                <StatusBadge status="IN_REVIEW" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold">How it works</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="text-center">
              <div className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center mx-auto mb-4 font-bold">
                {i + 1}
              </div>
              <div className="w-10 h-10 rounded-xl bg-brand-light text-brand-dark flex items-center justify-center mx-auto mb-3">
                <Icon size={20} />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-neutral-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-neutral-50 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold">Built for every side of the system</h2>
          </div>
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            {AUDIENCES.map((a) => (
              <button
                key={a.id}
                onClick={() => setAudience(a.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition ${
                  audience === a.id ? "bg-brand text-white" : "bg-white text-neutral-600 border border-neutral-200"
                }`}
              >
                <a.icon size={15} /> {a.label}
              </button>
            ))}
          </div>
          <div className="card p-8 max-w-2xl mx-auto animate-fade-up" key={active.id}>
            <ul className="space-y-3">
              {active.benefits.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 size={17} className="text-brand mt-0.5 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <Link href={active.cta.href} className="btn-primary inline-block mt-6 text-sm">
              {active.cta.label}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold">Everything the platform needs, connected</h2>
          <p className="mt-3 text-neutral-600">
            Built for real-time coordination between residents, field staff, and administrators.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6 hover:shadow-md transition">
              <div className="w-11 h-11 rounded-xl bg-brand-light text-brand-dark flex items-center justify-center mb-4">
                <Icon size={22} />
              </div>
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="mt-2 text-sm text-neutral-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand-dark text-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14 text-center">
          <h2 className="text-2xl font-bold">Free for residents. Priced for the people with budgets.</h2>
          <p className="mt-3 text-white/80">
            Businesses get scheduled pickups and compliance records. Councils and HYSACAM get the full
            operations platform.
          </p>
          <Link href="/pricing" className="btn-primary inline-block mt-6 bg-white text-brand-dark hover:bg-white/90">
            See pricing
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">Frequently asked questions</h2>
        <div className="space-y-3">
          {FAQS.map(({ q, a }) => (
            <details key={q} className="card p-5 group">
              <summary className="font-semibold cursor-pointer list-none flex items-center justify-between gap-4">
                {q}
                <span className="text-brand shrink-0 transition group-open:rotate-45 text-xl leading-none">+</span>
              </summary>
              <p className="mt-3 text-sm text-neutral-600">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
