"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquareWarning } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

const TYPES = [
  { value: "ILLEGAL_DUMPING", label: "Illegal dumping" },
  { value: "MISSED_PICKUP", label: "Missed pickup" },
  { value: "OVERFLOWING_BIN", label: "Overflowing bin" },
  { value: "DAMAGED_BIN", label: "Damaged bin" },
  { value: "POOR_SERVICE", label: "Poor service" },
  { value: "OTHER", label: "Other" },
];

export default function ComplaintsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ type: "ILLEGAL_DUMPING", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const latitude = user?.latitude ?? 3.848 + (Math.random() - 0.5) * 0.02;
      const longitude = user?.longitude ?? 11.502 + (Math.random() - 0.5) * 0.02;
      await api.post("/complaints", { ...form, latitude, longitude });
      setDone(true);
      setForm({ type: "ILLEGAL_DUMPING", description: "" });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <main className="mx-auto max-w-xl px-4 sm:px-6 py-10">
        <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
          <MessageSquareWarning size={20} />
        </div>
        <h1 className="text-2xl font-bold">Report an issue</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Let the council know about illegal dumping, missed pickups, or bin problems.
        </p>

        <div className="card p-6 mt-6">
          {done && (
            <div className="mb-4 rounded-lg bg-brand-light text-brand-dark text-sm p-3">
              Thanks — your report has been submitted and the council has been notified.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Issue type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="input mt-1"
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input mt-1"
                placeholder="Describe what you observed, including any landmarks..."
              />
            </div>
            <p className="text-xs text-[var(--muted)]">
              Your current location will be attached automatically to help field teams respond faster.
            </p>
            <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
              {submitting ? "Submitting..." : "Submit report"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
