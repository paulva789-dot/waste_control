"use client";

import { useEffect, useState } from "react";
import { X, Truck, UserCheck } from "lucide-react";
import { api, PickupRequest } from "@/lib/api";

interface CollectorOption {
  id: string;
  name: string;
  role: string;
  area?: string | null;
  town?: string | null;
}

export default function AssignPickupModal({
  pickup,
  onClose,
  onAssigned,
}: {
  pickup: PickupRequest;
  onClose: () => void;
  onAssigned: () => void;
}) {
  const [collectors, setCollectors] = useState<CollectorOption[]>([]);
  const [collectorId, setCollectorId] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/users?role=COLLECTOR,HYSACAM_DRIVER").then((r) => {
      setCollectors(r.data);
      if (r.data.length > 0) setCollectorId(r.data[0].id);
    });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.patch(`/pickups/${pickup.id}/assign`, {
        collectorId,
        scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
      });
      onAssigned();
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="card w-full max-w-md p-6 animate-pop relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition">
          <X size={20} />
        </button>
        <div className="w-11 h-11 rounded-xl bg-brand-light text-brand-dark flex items-center justify-center mb-4">
          <UserCheck size={20} />
        </div>
        <h2 className="font-bold text-lg mb-1">Assign a collector</h2>
        <p className="text-sm text-[var(--muted)] mb-5">
          {pickup.wasteType} pickup at {pickup.address}
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Truck size={14} className="text-brand" /> Collector / driver
            </label>
            {collectors.length === 0 ? (
              <p className="text-sm text-[var(--muted)] mt-1">No collectors or drivers registered yet.</p>
            ) : (
              <select value={collectorId} onChange={(e) => setCollectorId(e.target.value)} className="input mt-1">
                {collectors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} · {c.role.replace(/_/g, " ")}
                    {c.town ? ` · ${c.town}` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">Scheduled for (optional)</label>
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="input mt-1"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || collectors.length === 0}
            className="btn-primary w-full disabled:opacity-60"
          >
            {submitting ? "Assigning..." : "Assign pickup"}
          </button>
        </form>
      </div>
    </div>
  );
}
