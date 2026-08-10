import Link from "next/link";
import {
  Truck,
  MapPinned,
  MessageSquareWarning,
  BarChart3,
  BellRing,
  ShieldCheck,
  Recycle,
  Users,
} from "lucide-react";
import Navbar from "@/components/Navbar";

const FEATURES = [
  {
    icon: Truck,
    title: "Live GPS Tracking",
    desc: "Track HYSACAM and collector vehicles in real time on an interactive map, powered by Socket.IO.",
  },
  {
    icon: MapPinned,
    title: "Smart Pickup Requests",
    desc: "Residents request pickups with precise geolocation; councils assign vehicles and schedules instantly.",
  },
  {
    icon: MessageSquareWarning,
    title: "Complaint Reporting",
    desc: "Report illegal dumping, missed pickups, or overflowing bins with photos and GPS coordinates.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reporting",
    desc: "Track collection efficiency, missed pickups, recycling rates, and area cleanliness scores.",
  },
  {
    icon: BellRing,
    title: "Real-time Notifications",
    desc: "Automatic alerts for pickup reminders, arriving collectors, and complaint status updates.",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access",
    desc: "Dedicated experiences for residents, collectors, HYSACAM staff, councils, and inspectors.",
  },
];

const SLOGANS = [
  "Cleaner streets, one pickup at a time.",
  "Track it. Report it. Fix it — together.",
  "Your town, your waste, your problem — solved.",
  "Smart waste. Smarter cities.",
];

const ROLES = [
  "Resident",
  "Local Waste Collector",
  "HYSACAM Driver",
  "HYSACAM Supervisor",
  "Municipal Council Admin",
  "Recycling Company",
  "Environmental Inspector",
  "System Administrator",
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-b from-brand-light to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="badge bg-white text-brand-dark border border-brand/20 mb-5">
              <Recycle size={14} /> Digital Waste Management System
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight text-[var(--foreground)]">
              Cleaner cities, powered by <span className="text-brand">real-time data</span>
            </h1>
            <p className="mt-3 text-brand-dark font-semibold italic animate-fade-up">
              &ldquo;{SLOGANS[0]}&rdquo;
            </p>
            <p className="mt-5 text-lg text-neutral-600 max-w-xl">
              One platform connecting residents, waste collectors, HYSACAM, and municipal councils —
              live vehicle tracking, pickup scheduling, complaint resolution, and analytics in a single dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="btn-primary text-base px-6 py-3">
                Get started free
              </Link>
              <Link href="/login" className="btn-secondary text-base px-6 py-3">
                Log in
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-[var(--muted)]">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-brand" /> 8 user roles supported
              </div>
              <div className="flex items-center gap-2">
                <MapPinned size={16} className="text-brand" /> Live GPS tracking
              </div>
            </div>
          </div>

          <div className="card p-3 shadow-xl">
            <div className="rounded-xl overflow-hidden bg-neutral-900 aspect-[4/3] flex items-center justify-center relative">
              <img
                src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=900&q=60"
                alt="Waste collection truck on a city street"
                className="absolute inset-0 h-full w-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 card bg-white/95 p-3 flex items-center gap-3">
                <span className="p-2 rounded-lg bg-brand-light text-brand-dark">
                  <Truck size={18} />
                </span>
                <div className="text-sm">
                  <p className="font-semibold">CE-4521-YA en route</p>
                  <p className="text-[var(--muted)]">Bastos collection zone · 4 min away</p>
                </div>
              </div>
            </div>
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 flex flex-wrap justify-center gap-x-10 gap-y-3 text-sm font-semibold italic stagger">
          {SLOGANS.map((s) => (
            <span key={s}>&ldquo;{s}&rdquo;</span>
          ))}
        </div>
      </section>

      <section className="bg-neutral-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <h2 className="text-2xl font-bold mb-8">Built for every role in the system</h2>
          <div className="flex flex-wrap gap-3">
            {ROLES.map((role) => (
              <span
                key={role}
                className="badge bg-white/10 text-white border border-white/10 px-4 py-2 text-sm"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-4 sm:px-6 py-10 text-sm text-[var(--muted)] flex flex-col sm:flex-row justify-between gap-3">
        <p>© {new Date().getFullYear()} CleanCity DWMS. Built for cleaner, smarter cities.</p>
        <p>Next.js · Express · PostgreSQL · Flutter</p>
      </footer>
    </div>
  );
}
