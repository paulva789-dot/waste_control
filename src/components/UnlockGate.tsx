"use client";

import { useState } from "react";
import { Lock, MapPin, Truck, Sparkles } from "lucide-react";
import PaymentModal from "./PaymentModal";
import { UNLOCK_FEE_XAF } from "@/lib/api";

export default function UnlockGate({ onUnlocked }: { onUnlocked: () => void }) {
  const [showPay, setShowPay] = useState(false);

  return (
    <div className="card p-10 text-center animate-fade-up relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.06] flex items-center justify-center text-[10rem]">
        🗺️
      </div>
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-brand-light text-brand-dark mx-auto flex items-center justify-center mb-4 pulse-brand">
          <Lock size={26} />
        </div>
        <h2 className="text-xl font-bold mb-2">Unlock live tracking</h2>
        <p className="text-sm text-[var(--muted)] max-w-md mx-auto mb-6">
          Pay a one-time {UNLOCK_FEE_XAF} XAF fee to see the live map, waste collector locations,
          and driver &amp; truck details for your area.
        </p>
        <div className="flex justify-center gap-6 text-xs text-[var(--muted)] mb-6">
          <span className="flex items-center gap-1.5">
            <MapPin size={14} className="text-brand" /> Live map
          </span>
          <span className="flex items-center gap-1.5">
            <Truck size={14} className="text-brand" /> Truck &amp; driver info
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-brand" /> One-time payment
          </span>
        </div>
        <button onClick={() => setShowPay(true)} className="btn-primary">
          Pay {UNLOCK_FEE_XAF} XAF to unlock
        </button>
      </div>

      {showPay && (
        <PaymentModal
          type="UNLOCK_TRACKING"
          amountLabel={`${UNLOCK_FEE_XAF} XAF · one-time map & tracking unlock`}
          onClose={() => setShowPay(false)}
          onSuccess={() => {
            setShowPay(false);
            onUnlocked();
          }}
        />
      )}
    </div>
  );
}
