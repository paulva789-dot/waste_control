"use client";

import { useState } from "react";
import Link from "next/link";
import { LogIn, User, Truck, Building2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";

const DEMO_PERSONAS: { id: "RESIDENT" | "DRIVER" | "COUNCIL"; label: string; icon: typeof User }[] = [
  { id: "RESIDENT", label: "Resident", icon: User },
  { id: "DRIVER", label: "Driver", icon: Truck },
  { id: "COUNCIL", label: "Council", icon: Building2 },
];

export default function LoginPage() {
  const { login, demoLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  async function handleDemo(persona: "RESIDENT" | "DRIVER" | "COUNCIL") {
    setError(null);
    setDemoLoading(persona);
    try {
      await demoLogin(persona);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Demo login unavailable");
    } finally {
      setDemoLoading(null);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center bg-brand-light/40 px-4 py-12">
        <div className="card w-full max-w-md p-8">
          <div className="w-11 h-11 rounded-xl bg-brand-light text-brand-dark flex items-center justify-center mb-4">
            <LogIn size={20} />
          </div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Log in to your CleanCity account.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input mt-1"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <div className="mt-6">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-[var(--border-soft)]" />
              <span className="text-xs text-[var(--muted)]">or explore a demo</span>
              <div className="h-px flex-1 bg-[var(--border-soft)]" />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {DEMO_PERSONAS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleDemo(id)}
                  disabled={demoLoading !== null}
                  className="btn-secondary flex flex-col items-center gap-1.5 py-3 text-xs disabled:opacity-60"
                >
                  <Icon size={16} />
                  {demoLoading === id ? "..." : `As ${label}`}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-sm text-center text-[var(--muted)]">
            No account?{" "}
            <Link href="/register" className="text-brand-dark font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
