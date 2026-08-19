"use client";

import { useState } from "react";
import { X, Camera, CheckCircle2, WifiOff } from "lucide-react";
import { api, PickupRequest } from "@/lib/api";
import { enqueueCompletion, fileToBase64, isNetworkError } from "@/lib/offlineQueue";

function getPosition(): Promise<{ latitude: number | null; longitude: number | null }> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !navigator.geolocation) return resolve({ latitude: null, longitude: null });
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => resolve({ latitude: null, longitude: null }),
      { timeout: 5000 }
    );
  });
}

export default function CompletePickupModal({
  pickup,
  onClose,
  onDone,
}: {
  pickup: PickupRequest;
  onClose: () => void;
  onDone: (queued: boolean) => void;
}) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [binCount, setBinCount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function pickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  }

  async function submit() {
    setSubmitting(true);
    setError("");
    const { latitude, longitude } = await getPosition();

    try {
      const form = new FormData();
      if (photo) form.append("photo", photo);
      if (latitude != null) form.append("latitude", String(latitude));
      if (longitude != null) form.append("longitude", String(longitude));
      if (binCount) form.append("binCount", binCount);
      await api.post(`/pickups/${pickup.id}/complete`, form);
      onDone(false);
    } catch (err) {
      if (isNetworkError(err)) {
        enqueueCompletion({
          pickupId: pickup.id,
          photoBase64: photo ? await fileToBase64(photo) : null,
          latitude,
          longitude,
          binCount: binCount ? Number(binCount) : null,
          queuedAt: new Date().toISOString(),
        });
        onDone(true);
      } else {
        setError("Could not submit completion. Please try again.");
        setSubmitting(false);
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="card w-full max-w-sm p-6 animate-pop relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition">
          <X size={20} />
        </button>
        <div className="w-11 h-11 rounded-xl bg-brand-light text-brand-dark flex items-center justify-center mb-4">
          <CheckCircle2 size={20} />
        </div>
        <h2 className="font-bold text-lg mb-1">Confirm completion</h2>
        <p className="text-sm text-[var(--muted)] mb-5">
          {pickup.wasteType} pickup at {pickup.address}
        </p>

        <label className="block">
          <div className="rounded-xl border-2 border-dashed border-[var(--border-soft)] aspect-video flex items-center justify-center overflow-hidden bg-[var(--background)] cursor-pointer">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Completion proof" className="h-full w-full object-cover" />
            ) : (
              <div className="text-center text-[var(--muted)]">
                <Camera size={22} className="mx-auto mb-1" />
                <p className="text-xs">Take a photo</p>
              </div>
            )}
          </div>
          <input type="file" accept="image/*" capture="environment" onChange={pickPhoto} className="hidden" />
        </label>

        <div className="mt-4">
          <label className="text-sm font-medium">Bins collected (optional)</label>
          <input
            type="number"
            min={0}
            value={binCount}
            onChange={(e) => setBinCount(e.target.value)}
            className="input mt-1"
          />
        </div>

        <p className="text-xs text-[var(--muted)] mt-3 flex items-center gap-1.5">
          <WifiOff size={12} /> No signal? This still saves — it&apos;ll sync automatically once you&apos;re back online.
        </p>

        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

        <button onClick={submit} disabled={submitting} className="btn-primary w-full mt-5 disabled:opacity-60">
          {submitting ? "Submitting..." : "Confirm completion"}
        </button>
      </div>
    </div>
  );
}
