import { Truck, User, Lock, Phone, Mail, Crown } from "lucide-react";
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
        <div className="w-11 h-11 rounded-full bg-[var(--border-soft)] flex items-center justify-center">
          <Lock size={18} className="text-[var(--muted)]" />
        </div>
        <div>
          <p className="text-sm font-semibold">{vehicle.type}</p>
          <p className="text-xs text-[var(--muted)]">Unlock tracking to see driver &amp; matricule</p>
        </div>
      </div>
    );
  }

  const swatch = COLOR_SWATCH[(vehicle.truckColor || "").toLowerCase()] || "#9ca3af";
  const hasContact = !!(vehicle.driver?.phone || vehicle.driver?.email);

  return (
    <div className="card card-hover p-4 flex flex-col gap-2 animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-brand-light flex items-center justify-center text-brand-dark shrink-0">
          <User size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{vehicle.driver?.name || "Unassigned"}</p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--muted)] mt-0.5">
            <span className="flex items-center gap-1">
              <Truck size={12} /> {vehicle.type}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ background: swatch }} />
              {vehicle.truckColor}
            </span>
            {vehicle.town && <span>· {vehicle.town}</span>}
          </div>
        </div>
        <span className="badge bg-brand-light text-brand-dark font-mono shrink-0">{vehicle.plateNumber}</span>
      </div>

      {vehicle.description && <p className="text-xs text-[var(--muted)] leading-snug">{vehicle.description}</p>}

      {hasContact ? (
        <div className="flex flex-wrap gap-3 text-xs text-brand-dark font-medium pt-1 border-t border-[var(--border-soft)] mt-1">
          {vehicle.driver?.phone && (
            <span className="flex items-center gap-1">
              <Phone size={12} /> {vehicle.driver.phone}
            </span>
          )}
          {vehicle.driver?.email && (
            <span className="flex items-center gap-1">
              <Mail size={12} /> {vehicle.driver.email}
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] pt-1 border-t border-[var(--border-soft)] mt-1">
          <Crown size={12} /> Premium members can see phone &amp; email
        </div>
      )}
    </div>
  );
}
