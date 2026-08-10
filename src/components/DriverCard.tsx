import { Truck, User, Lock } from "lucide-react";
import { Vehicle } from "@/lib/api";

const COLOR_SWATCH: Record<string, string> = {
  "lime green": "#65a30d",
  green: "#16a34a",
  white: "#e5e7eb",
  blue: "#2563eb",
  yellow: "#facc15",
  red: "#dc2626",
  orange: "#ea580c",
};

export default function DriverCard({ vehicle }: { vehicle: Vehicle }) {
  if (vehicle.locked) {
    return (
      <div className="card p-4 flex items-center gap-3 opacity-70">
        <div className="w-11 h-11 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
          <Lock size={18} className="text-neutral-400" />
        </div>
        <div>
          <p className="text-sm font-semibold">{vehicle.type}</p>
          <p className="text-xs text-[var(--muted)]">Unlock tracking to see driver &amp; matricule</p>
        </div>
      </div>
    );
  }

  const swatch = COLOR_SWATCH[(vehicle.truckColor || "").toLowerCase()] || "#9ca3af";

  return (
    <div className="card card-hover p-4 flex items-center gap-3 animate-fade-up">
      <div className="w-11 h-11 rounded-full bg-brand-light flex items-center justify-center text-brand-dark">
        <User size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{vehicle.driver?.name || "Unassigned"}</p>
        <div className="flex items-center gap-2 text-xs text-[var(--muted)] mt-0.5">
          <Truck size={12} /> {vehicle.type}
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ background: swatch }} />
            {vehicle.truckColor}
          </span>
        </div>
      </div>
      <span className="badge bg-brand-light text-brand-dark font-mono">{vehicle.plateNumber}</span>
    </div>
  );
}
