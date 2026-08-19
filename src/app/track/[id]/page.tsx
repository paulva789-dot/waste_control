"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Search, CheckCircle2, Circle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api, ComplaintTracking } from "@/lib/api";

const STEPS = ["OPEN", "IN_REVIEW", "RESOLVED"];
const STEP_LABELS: Record<string, string> = {
  OPEN: "Received",
  IN_REVIEW: "In review",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
};

export default function TrackReportPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<ComplaintTracking | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/complaints/${params.id}/track`)
      .then((r) => setData(r.data))
      .catch(() => setError("We couldn't find a report with that reference."))
      .finally(() => setLoading(false));
  }, [params.id]);

  const currentStepIndex = data ? STEPS.indexOf(data.status) : -1;
  const rejected = data?.status === "REJECTED";

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <Navbar />
      <main className="flex-1 mx-auto max-w-xl px-4 sm:px-6 py-16 w-full">
        <div className="w-11 h-11 rounded-xl bg-brand-light text-brand-dark flex items-center justify-center mb-4">
          <Search size={20} />
        </div>
        <h1 className="text-2xl font-bold">Track your report</h1>

        {loading && <p className="text-sm text-[var(--muted)] mt-4">Loading...</p>}
        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

        {data && (
          <div className="card p-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--muted)]">Reference</p>
                <p className="font-mono font-semibold">{data.reference}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[var(--muted)]">Reported</p>
                <p className="text-sm">{new Date(data.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <p className="mt-4 text-sm font-medium">{data.type.replace(/_/g, " ")}</p>
            <p className="text-sm text-[var(--muted)] mt-1">{data.description}</p>

            <div className="mt-8">
              {rejected ? (
                <div className="rounded-lg bg-red-50 text-red-700 text-sm p-3">
                  This report was reviewed and rejected.
                </div>
              ) : (
                <div className="space-y-4">
                  {STEPS.map((step, i) => {
                    const reached = i <= currentStepIndex;
                    const event = data.timeline.find((e) => e.status === step);
                    return (
                      <div key={step} className="flex items-start gap-3">
                        {reached ? (
                          <CheckCircle2 size={18} className="text-brand shrink-0 mt-0.5" />
                        ) : (
                          <Circle size={18} className="text-[var(--muted)] opacity-40 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className={`text-sm font-medium ${reached ? "" : "text-[var(--muted)]"}`}>
                            {STEP_LABELS[step]}
                          </p>
                          {event && (
                            <p className="text-xs text-[var(--muted)]">{new Date(event.at).toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
