"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserCircle, Crown, MapPinned, Save, Receipt, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import PaymentModal from "@/components/PaymentModal";
import TownChangeModal from "@/components/TownChangeModal";
import { useAuth } from "@/lib/auth-context";
import { api, Payment, PaymentType, UNLOCK_FEE_XAF } from "@/lib/api";

const PREMIUM_FEE_XAF = 5000;

export default function ProfilePage() {
  const { user, token, loading, updateSession } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", area: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showTownChange, setShowTownChange] = useState(false);
  const [paymentType, setPaymentType] = useState<PaymentType | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    setForm({ name: user.name, phone: user.phone || "", area: user.area || "" });
    api.get("/payments").then((r) => setPayments(r.data));
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const { data } = await api.patch("/users/me", form);
      updateSession(token!, data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-8">
        <div className="flex items-center gap-4 animate-fade-up">
          <div className="w-16 h-16 rounded-2xl bg-brand-light text-brand-dark flex items-center justify-center">
            <UserCircle size={36} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-sm text-[var(--muted)]">{user.email} · {user.role.replace(/_/g, " ")}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 card p-6 animate-fade-up">
            <h2 className="font-semibold mb-4">Personal information</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Full name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="6XXXXXXXX"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Area / Neighborhood</label>
                <input
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-1.5 text-[var(--muted)]">
                  <MapPinned size={14} /> Town
                </label>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm">{user.town || "Not set"}</p>
                  <button
                    type="button"
                    onClick={() => setShowTownChange(true)}
                    className="text-xs font-semibold text-brand-dark hover:underline"
                  >
                    Change town
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                  <Save size={16} /> {saving ? "Saving..." : "Save changes"}
                </button>
                {saved && <span className="text-sm text-brand-dark font-medium">Saved!</span>}
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="card p-5 animate-fade-up">
              <div className="flex items-center gap-2 mb-2">
                <Crown size={18} className={user.isPremium ? "text-amber-500" : "text-[var(--muted)]"} />
                <h3 className="font-semibold text-sm">Premium membership</h3>
              </div>
              {user.isPremium ? (
                <p className="text-sm text-[var(--muted)]">
                  Active{user.premiumUntil ? ` until ${new Date(user.premiumUntil).toLocaleDateString()}` : ""}. You can
                  request special pickups anytime.
                </p>
              ) : (
                <>
                  <p className="text-sm text-[var(--muted)] mb-3">
                    Unlock special/on-demand pickup requests for {PREMIUM_FEE_XAF} XAF/month.
                  </p>
                  <button onClick={() => setPaymentType("PREMIUM_MEMBERSHIP")} className="btn-primary text-sm w-full">
                    Go premium
                  </button>
                </>
              )}
            </div>

            <div className="card p-5 animate-fade-up">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={18} className={user.hasUnlockedTracking ? "text-brand" : "text-[var(--muted)]"} />
                <h3 className="font-semibold text-sm">Live tracking</h3>
              </div>
              {user.hasUnlockedTracking ? (
                <p className="text-sm text-[var(--muted)]">Unlocked — you can see live vehicle locations on the map.</p>
              ) : (
                <>
                  <p className="text-sm text-[var(--muted)] mb-3">
                    Unlock the live map to see waste collector locations for {UNLOCK_FEE_XAF} XAF (one-time).
                  </p>
                  <button onClick={() => setPaymentType("UNLOCK_TRACKING")} className="btn-primary text-sm w-full">
                    Unlock tracking
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="card p-5 animate-fade-up">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Receipt size={18} className="text-brand" /> Payment history
          </h2>
          {payments.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No payments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[var(--muted)] border-b border-[var(--border-soft)]">
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">Provider</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2 pr-4">Reference</th>
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-neutral-50 last:border-0">
                      <td className="py-2.5 pr-4">{p.type.replace(/_/g, " ")}</td>
                      <td className="py-2.5 pr-4 text-[var(--muted)]">{p.provider}</td>
                      <td className="py-2.5 pr-4 font-medium">{p.amountXAF} XAF</td>
                      <td className="py-2.5 pr-4 text-[var(--muted)] font-mono text-xs">{p.reference}</td>
                      <td className="py-2.5 pr-4 text-[var(--muted)]">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="py-2.5 pr-4">
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {showTownChange && <TownChangeModal currentTown={user.town} onClose={() => setShowTownChange(false)} />}
      {paymentType && (
        <PaymentModal
          type={paymentType}
          amountLabel={
            paymentType === "PREMIUM_MEMBERSHIP"
              ? `${PREMIUM_FEE_XAF} XAF · premium membership (1 month)`
              : `${UNLOCK_FEE_XAF} XAF · unlock live tracking`
          }
          onClose={() => setPaymentType(null)}
          onSuccess={() => {
            setPaymentType(null);
            api.get("/payments").then((r) => setPayments(r.data));
          }}
        />
      )}
    </div>
  );
}
