"use client";

import { useEffect, useState } from "react";
import { X, UserPlus, Copy, Check } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const ALL_STAFF_ROLES = [
  { value: "COLLECTOR", label: "Local Waste Collector" },
  { value: "HYSACAM_DRIVER", label: "HYSACAM Driver" },
  { value: "HYSACAM_SUPERVISOR", label: "HYSACAM Supervisor" },
  { value: "INSPECTOR", label: "Environmental Inspector" },
  { value: "COUNCIL_ADMIN", label: "Municipal Council Administrator" },
  { value: "SYSTEM_ADMIN", label: "System Administrator" },
];
const ADMIN_ONLY_ROLES = ["COUNCIL_ADMIN", "SYSTEM_ADMIN"];

export default function InviteStaffModal({ onClose, onInvited }: { onClose: () => void; onInvited: () => void }) {
  const { user } = useAuth();
  const roleOptions = ALL_STAFF_ROLES.filter((r) => user?.role === "SYSTEM_ADMIN" || !ADMIN_ONLY_ROLES.includes(r.value));

  const [towns, setTowns] = useState<string[]>([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: roleOptions[0]?.value || "COLLECTOR", area: "", town: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ email: string; tempPassword: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get("/towns").then((r) => setTowns(r.data));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const { data } = await api.post("/users/invite", { ...form, town: form.town || undefined, area: form.area || undefined, phone: form.phone || undefined });
      setResult({ email: data.user.email, tempPassword: data.tempPassword });
      onInvited();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Could not create the account.");
    } finally {
      setSubmitting(false);
    }
  }

  function copyPassword() {
    if (!result) return;
    navigator.clipboard.writeText(result.tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="card w-full max-w-md p-6 animate-pop relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--foreground)] transition">
          <X size={20} />
        </button>

        {result ? (
          <>
            <div className="w-11 h-11 rounded-xl bg-brand-light text-brand-dark flex items-center justify-center mb-4">
              <Check size={20} />
            </div>
            <h2 className="font-bold text-lg mb-1">Account created</h2>
            <p className="text-sm text-[var(--muted)] mb-4">
              Share this temporary password with <strong>{result.email}</strong> directly — it will only be shown here once.
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-[var(--border-soft)] p-3 bg-[var(--background)]">
              <code className="text-sm font-mono flex-1 break-all">{result.tempPassword}</code>
              <button onClick={copyPassword} className="text-brand-dark hover:text-brand transition shrink-0" aria-label="Copy password">
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <button onClick={onClose} className="btn-primary w-full mt-5">
              Done
            </button>
          </>
        ) : (
          <>
            <div className="w-11 h-11 rounded-xl bg-brand-light text-brand-dark flex items-center justify-center mb-4">
              <UserPlus size={20} />
            </div>
            <h2 className="font-bold text-lg mb-1">Invite a staff member</h2>
            <p className="text-sm text-[var(--muted)] mb-5">
              Staff roles aren&apos;t self-registerable. Create the account here and hand the generated password
              to them directly.
            </p>
            <form onSubmit={submit} className="space-y-3">
              <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
              <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
              <input placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input">
                {roleOptions.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <select value={form.town} onChange={(e) => setForm({ ...form, town: e.target.value })} className="input">
                <option value="">Town (optional)</option>
                {towns.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <input placeholder="Area / zone (optional)" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="input" />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
                {submitting ? "Creating..." : "Create account"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
