"use client";

import { useEffect, useState } from "react";
import { X, MapPin } from "lucide-react";
import PaymentModal from "./PaymentModal";
import { api, TOWN_CHANGE_FEE_XAF } from "@/lib/api";

export default function TownChangeModal({
  currentTown,
  onClose,
}: {
  currentTown?: string | null;
  onClose: () => void;
}) {
  const [towns, setTowns] = useState<string[]>([]);
  const [town, setTown] = useState("");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    api.get("/towns").then((r) => {
      setTowns(r.data);
      setTown(currentTown || r.data[0]);
    });
  }, [currentTown]);

  if (confirming) {
    return (
      <PaymentModal
        type="TOWN_CHANGE"
        town={town}
        amountLabel={`${TOWN_CHANGE_FEE_XAF} XAF · change town to ${town}`}
        onClose={onClose}
        onSuccess={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="card w-full max-w-sm p-6 animate-pop relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition">
          <X size={20} />
        </button>
        <div className="w-11 h-11 rounded-xl bg-brand-light text-brand-dark flex items-center justify-center mb-4">
          <MapPin size={20} />
        </div>
        <h2 className="font-bold text-lg mb-1">Change your town</h2>
        <p className="text-sm text-[var(--muted)] mb-5">
          Current: <strong>{currentTown || "not set"}</strong>. Changing costs {TOWN_CHANGE_FEE_XAF} FCFA.
        </p>
        <select value={town} onChange={(e) => setTown(e.target.value)} className="input">
          {towns.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button
          onClick={() => setConfirming(true)}
          disabled={town === currentTown}
          className="btn-primary w-full mt-4 disabled:opacity-50"
        >
          Pay {TOWN_CHANGE_FEE_XAF} FCFA & change
        </button>
      </div>
    </div>
  );
}
