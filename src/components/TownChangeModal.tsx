"use client";

import { useEffect, useState } from "react";
import { X, MapPin, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function TownChangeModal({
  currentTown,
  onClose,
}: {
  currentTown?: string | null;
  onClose: () => void;
}) {
  const { token, updateSession } = useAuth();
  const [towns, setTowns] = useState<string[]>([]);
  const [town, setTown] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    api.get("/towns").then((r) => {
      setTowns(r.data);
      setTown(currentTown || r.data[0]);
    });
  }, [currentTown]);

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const { data: user } = await api.patch("/users/me/town", { town });
      updateSession(token!, user);
      setDone(true);
      setTimeout(onClose, 900);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Could not change town. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="card w-full max-w-sm p-6 animate-pop relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--foreground)] transition">
          <X size={20} />
        </button>

        {done ? (
          <div className="py-6 flex flex-col items-center gap-3 text-center animate-pop">
            <CheckCircle2 className="text-brand" size={40} />
            <p className="font-semibold">Town updated</p>
          </div>
        ) : (
          <>
            <div className="w-11 h-11 rounded-xl bg-brand-light text-brand-dark flex items-center justify-center mb-4">
              <MapPin size={20} />
            </div>
            <h2 className="font-bold text-lg mb-1">Change your town</h2>
            <p className="text-sm text-[var(--muted)] mb-5">
              Current: <strong>{currentTown || "not set"}</strong>. This is free — you can change it again after 30 days.
            </p>
            <select value={town} onChange={(e) => setTown(e.target.value)} className="input">
              {towns.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
            <button
              onClick={submit}
              disabled={town === currentTown || submitting}
              className="btn-primary w-full mt-4 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save town"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
