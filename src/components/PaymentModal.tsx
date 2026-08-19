"use client";

import { useState } from "react";
import { X, Smartphone, Loader2, CheckCircle2 } from "lucide-react";
import { api, PaymentType, Provider } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const PROVIDERS: { id: Provider; label: string; color: string }[] = [
  { id: "MTN", label: "MTN Mobile Money", color: "#FFCB05" },
  { id: "ORANGE", label: "Orange Money", color: "#FF7900" },
];

export default function PaymentModal({
  type,
  amountLabel,
  pickupId,
  onClose,
  onSuccess,
}: {
  type: PaymentType;
  amountLabel: string;
  pickupId?: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { updateSession } = useAuth();
  const [provider, setProvider] = useState<Provider>("MTN");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"form" | "processing" | "done" | "error">("form");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStep("processing");
    try {
      const { data: payment } = await api.post("/payments/initiate", { type, provider, phone, pickupId });
      // Real aggregators confirm async via webhook after the user approves the USSD prompt.
      // We simulate that short wait, then poll our own confirm endpoint (stubbed) to settle it.
      await new Promise((r) => setTimeout(r, 1600));
      const { data } = await api.post(`/payments/${payment.id}/confirm`);
      if (data.token && data.user) {
        updateSession(data.token, data.user);
      }
      setStep("done");
      setTimeout(() => {
        onSuccess();
      }, 900);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Payment failed. Please try again.");
      setStep("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="card w-full max-w-md p-6 animate-pop relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--foreground)] transition"
        >
          <X size={20} />
        </button>

        {step === "form" && (
          <>
            <h2 className="font-bold text-lg mb-1">Pay with Mobile Money</h2>
            <p className="text-sm text-[var(--muted)] mb-5">{amountLabel}</p>

            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {PROVIDERS.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setProvider(p.id)}
                    className={`rounded-xl border-2 p-3 text-left transition ${
                      provider === p.id ? "border-brand shadow-sm scale-[1.02]" : "border-[var(--border-soft)]"
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-full mb-2 flex items-center justify-center text-white font-bold text-xs"
                      style={{ background: p.color }}
                    >
                      {p.id === "MTN" ? "MTN" : "OM"}
                    </div>
                    <p className="text-sm font-semibold">{p.label}</p>
                  </button>
                ))}
              </div>

              <div>
                <label className="text-sm font-medium">Phone number</label>
                <div className="relative mt-1">
                  <Smartphone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    required
                    pattern="6[0-9]{8}"
                    title="9-digit Cameroon number starting with 6"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="6XXXXXXXX"
                    className="input pl-9"
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full">
                Confirm payment
              </button>
            </form>
          </>
        )}

        {step === "processing" && (
          <div className="py-10 flex flex-col items-center gap-4 text-center animate-fade-up">
            <Loader2 className="animate-spin text-brand" size={40} />
            <p className="font-semibold">Approve the prompt on your phone</p>
            <p className="text-sm text-[var(--muted)]">
              We sent a {provider === "MTN" ? "MTN MoMo" : "Orange Money"} request to {phone}
            </p>
          </div>
        )}

        {step === "done" && (
          <div className="py-10 flex flex-col items-center gap-4 text-center animate-pop">
            <CheckCircle2 className="text-brand" size={48} />
            <p className="font-semibold">Payment successful</p>
          </div>
        )}

        {step === "error" && (
          <div className="py-6 flex flex-col items-center gap-3 text-center animate-fade-up">
            <p className="text-red-600 font-medium text-sm">{error}</p>
            <button onClick={() => setStep("form")} className="btn-secondary">
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
