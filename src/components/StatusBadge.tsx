const STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  SCHEDULED: "bg-blue-50 text-blue-700",
  IN_PROGRESS: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-brand-light text-brand-dark",
  MISSED: "bg-red-50 text-red-700",
  CANCELLED: "bg-neutral-100 text-neutral-600",
  OPEN: "bg-amber-50 text-amber-700",
  IN_REVIEW: "bg-blue-50 text-blue-700",
  RESOLVED: "bg-brand-light text-brand-dark",
  REJECTED: "bg-red-50 text-red-700",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge ${STYLES[status] || "bg-neutral-100 text-neutral-600"}`}>
      {status.replace("_", " ")}
    </span>
  );
}
