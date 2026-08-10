"use client";

import { useState } from "react";
import Link from "next/link";
import { LogIn } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("resident@dwms.cm");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

          <div className="mt-6 text-xs text-[var(--muted)] bg-[var(--background)] border border-[var(--border-soft)] rounded-lg p-3">
            <p className="font-semibold mb-1">Demo accounts (password: password123)</p>
            <p>resident@dwms.cm · admin@dwms.cm · supervisor@hysacam.cm · driver@hysacam.cm</p>
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
