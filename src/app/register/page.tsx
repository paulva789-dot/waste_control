"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";

const ROLES = [
  { value: "RESIDENT", label: "Resident" },
  { value: "COLLECTOR", label: "Local Waste Collector" },
  { value: "HYSACAM_DRIVER", label: "HYSACAM Driver" },
  { value: "HYSACAM_SUPERVISOR", label: "HYSACAM Supervisor" },
  { value: "COUNCIL_ADMIN", label: "Municipal Council Administrator" },
  { value: "RECYCLING_COMPANY", label: "Recycling Company" },
  { value: "INSPECTOR", label: "Environmental Inspector" },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "RESIDENT",
    area: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
