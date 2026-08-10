import { LucideIcon } from "lucide-react";

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = "brand",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "brand" | "accent" | "warn" | "danger";
}) {
  const tones: Record<string, string> = {
    brand: "bg-brand-light text-brand-dark",
    accent: "bg-blue-50 text-blue-600",
    warn: "bg-amber-50 text-amber-600",
    danger: "bg-red-50 text-red-600",
  };

  return (
    <div className="card card-hover p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${tones[tone]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm text-[var(--muted)]">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
