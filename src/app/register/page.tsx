"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserPlus, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

// Public sign-up is limited to non-privileged roles. Staff accounts
// (collectors, drivers, supervisors, council admins, inspectors) are created
// by an existing admin from the admin dashboard, not self-registered here.
const ROLES = [
  { value: "RESIDENT", label: "Resident" },
  { value: "RECYCLING_COMPANY", label: "Business / Recycling Company" },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "RESIDENT",
    area: "",
    town: "",
  });
  const [towns, setTowns] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/towns").then((r) => {
      setTowns(r.data);
      setForm((f) => (f.town ? f : { ...f, town: r.data[0] }));
    });
  }, []);

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(form);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center bg-brand-light/40 px-4 py-12">
        <div className="card w-full max-w-md p-8">
          <div className="w-11 h-11 rounded-xl bg-brand-light text-brand-dark flex items-center justify-center mb-4">
            <UserPlus size={20} />
          </div>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-brand-dark font-semibold mt-1 italic">
            &ldquo;Your town, your waste, your problem&mdash;solved.&rdquo;
          </p>
          <p className="text-sm text-[var(--muted)] mt-1">Join the CleanCity platform.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium">Full name</label>
              <input
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="input mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="input mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                className="input mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <select value={form.role} onChange={(e) => update("role", e.target.value)} className="input mt-1">
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium flex items-center gap-1.5">
                <MapPin size={14} className="text-brand" /> Town
              </label>
              <select value={form.town} onChange={(e) => update("town", e.target.value)} required className="input mt-1">
                {towns.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <p className="text-xs text-[var(--muted)] mt-1">
                You can update your town for free later from your profile.
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Area / Neighborhood</label>
              <input value={form.area} onChange={(e) => update("area", e.target.value)} className="input mt-1" />
            </div>
            {error && <p className="text-sm text-red-600">{String(error)}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-[var(--muted)]">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-dark font-semibold">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
