"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Crown, Sparkles, Clock3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import DriverCard from "@/components/DriverCard";
import UnlockGate from "@/components/UnlockGate";
import PaymentModal from "@/components/PaymentModal";
import { useAuth } from "@/lib/auth-context";
import { api, Schedule, Vehicle, PriceQuote } from "@/lib/api";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function SchedulePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showPremiumPay, setShowPremiumPay] = useState(false);
  const [showPickupPay, setShowPickupPay] = useState(false);
  const [pickupId, setPickupId] = useState<string | null>(null);
  const [form, setForm] = useState({ wasteType: "General", address: "", when: "" });
  const [quote, setQuote] = useState<PriceQuote | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    api.get("/schedules").then((r) => setSchedules(r.data));
    api.get("/vehicles").then((r) => setVehicles(r.data));
  }, [user]);

  useEffect(() => {
    if (!user?.isPremium) return;
    const when = form.when ? new Date(form.when).toISOString() : undefined;
    api.get("/pickups/quote", { params: when ? { scheduledFor: when } : {} }).then((r) => setQuote(r.data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.when, user?.isPremium]);

  async function requestSpecialPickup(e: React.FormEvent) {
    e.preventDefault();
    setRequestError("");
    setSubmitting(true);
    try {
      const lat = user?.latitude ?? 3.848 + (Math.random() - 0.5) * 0.02;
      const lng = user?.longitude ?? 11.502 + (Math.random() - 0.5) * 0.02;
      const { data: pickup } = await api.post("/pickups", {
        wasteType: form.wasteType,
        address: form.address,
        latitude: lat,
        longitude: lng,
        scheduledFor: form.when ? new Date(form.when).toISOString() : undefined,
      });
      setPickupId(pickup.id);
      setShowPickupPay(true);
    } catch (err: any) {
      setRequestError(err?.response?.data?.error || "Could not create request");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user) return null;

  const grouped = DAYS.map((label, idx) => ({
    label,
    items: schedules.filter((s) => s.dayOfWeek === idx),
  }));

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
        <div className="flex items-center gap-2 animate-fade-up">
          <CalendarDays className="text-brand" size={22} />
          <h1 className="text-2xl font-bold">Monthly collection schedule</h1>
        </div>
        <p className="text-sm text-[var(--muted)] -mt-6">
          Free for everyone — check which day and time waste collectors pass through your area.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
          {grouped.map((d) => (
            <div key={d.label} className="card card-hover p-4">
              <p className="font-semibold text-sm mb-3">{d.label}</p>
              {d.items.length === 0 ? (
                <p className="text-xs text-[var(--muted)]">No collection scheduled</p>
              ) : (
                <div className="space-y-2">
                  {d.items.map((s) => (
                    <div key={s.id} className="text-xs bg-brand-light text-brand-dark rounded-lg px-2 py-1.5">
                      <p className="font-semibold">{s.area}</p>
                      <p className="flex items-center gap-1">
                        <Clock3 size={11} /> {s.startTime} – {s.endTime}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <section className="space-y-3">
          <h2 className="font-semibold flex items-center gap-2">Waste collectors &amp; live tracking</h2>
          {!user.hasUnlockedTracking ? (
            <UnlockGate onUnlocked={() => api.get("/vehicles").then((r) => setVehicles(r.data))} />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger">
              {vehicles.filter((v) => !v.locked).map((v) => (
                <DriverCard key={v.id} vehicle={v} />
              ))}
            </div>
          )}
        </section>

        <section className="card p-6 animate-fade-up">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="text-brand" size={18} />
            <h2 className="font-bold text-lg">Request a special pickup</h2>
          </div>

          {!user.isPremium ? (
            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-brand-light rounded-xl p-4">
              <div>
                <p className="font-semibold text-sm flex items-center gap-1.5 text-brand-dark">
                  <Crown size={15} /> Premium members only
                </p>
                <p className="text-xs text-[var(--muted)] mt-1">
                  Upgrade to request on-demand pickups outside the schedule. Weekend and evening
                  requests cost more.
                </p>
              </div>
              <button onClick={() => setShowPremiumPay(true)} className="btn-primary whitespace-nowrap">
                Become premium
              </button>
            </div>
          ) : (
            <form onSubmit={requestSpecialPickup} className="mt-4 grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Waste type</label>
                <select
                  value={form.wasteType}
                  onChange={(e) => setForm({ ...form, wasteType: e.target.value })}
                  className="input mt-1"
                >
                  <option>General</option>
                  <option>Recyclable</option>
                  <option>Organic</option>
                  <option>Hazardous</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <input
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="input mt-1"
                  placeholder="Street, neighborhood"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Preferred date &amp; time</label>
                <input
                  type="datetime-local"
                  value={form.when}
                  onChange={(e) => setForm({ ...form, when: e.target.value })}
                  className="input mt-1"
                />
              </div>

              {quote && (
                <div className="sm:col-span-2 rounded-xl border border-brand/30 bg-brand-light p-4 animate-fade-up">
                  <p className="text-sm font-semibold text-brand-dark">Estimated price: {quote.priceXAF} XAF</p>
                  {quote.surcharges.length > 0 ? (
                    <ul className="text-xs text-[var(--muted)] mt-1 space-y-0.5">
                      {quote.surcharges.map((s) => (
                        <li key={s.label}>
                          + {s.percent}% {s.label}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-[var(--muted)] mt-1">Standard weekday rate</p>
                  )}
                </div>
              )}

              {requestError && <p className="sm:col-span-2 text-sm text-red-600">{requestError}</p>}

              <div className="sm:col-span-2">
                <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
                  {submitting ? "Submitting..." : "Request & pay"}
                </button>
              </div>
            </form>
          )}
        </section>
      </main>

      {showPremiumPay && (
        <PaymentModal
          type="PREMIUM_MEMBERSHIP"
          amountLabel="5000 XAF · 1 month premium membership"
          onClose={() => setShowPremiumPay(false)}
          onSuccess={() => setShowPremiumPay(false)}
        />
      )}

      {showPickupPay && pickupId && (
        <PaymentModal
          type="SPECIAL_PICKUP"
          pickupId={pickupId}
          amountLabel={quote ? `${quote.priceXAF} XAF · special pickup` : "Special pickup"}
          onClose={() => setShowPickupPay(false)}
          onSuccess={() => {
            setShowPickupPay(false);
            setForm({ wasteType: "General", address: "", when: "" });
          }}
        />
      )}
    </div>
  );
}
