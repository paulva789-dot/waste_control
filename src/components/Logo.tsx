import { Recycle } from "lucide-react";

export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2 font-bold text-lg text-brand-dark">
      <span
        className="flex items-center justify-center rounded-xl bg-brand text-white"
        style={{ width: size + 12, height: size + 12 }}
      >
        <Recycle size={size * 0.62} />
      </span>
      <span>
        Clean<span className="text-brand">City</span>
      </span>
    </div>
  );
}
