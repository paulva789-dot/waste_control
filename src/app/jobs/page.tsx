"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Truck, MapPin, PlayCircle, CheckCircle2, XCircle, ClipboardList } from "lucide-react";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import LiveMapClient from "@/components/LiveMapClient";
import { useAuth } from "@/lib/auth-context";
import { api, PickupRequest, Vehicle } from "@/lib/api";
import { getSocket } from "@/lib/socket";

const FIELD_ROLES = ["COLLECTOR", "HYSACAM_DRIVER"];

export default function JobsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || !FIELD_ROLES.includes(user.role))) {
      router.push(user ? "/dashboard" : "/login");
    }
  }, [loading, user, router]);

  async function loadData() {
    const [p, v] = await Promise.all([api.get("/pickups"), api.get("/vehicles")]);
    setPickups(p.data.filter((x: PickupRequest) => x.collector?.id === user!.id));
    setVehicle(v.data.find((x: Vehicle) => x.driver?.id === user!.id) || null);
  }

  useEffect(() => {
    if (!user || !FIELD_ROLES.includes(user.role)) return;
    loadData();
    const socket = getSocket();
    socket.on("pickup:created", loadData);
    socket.on("pickup:updated", loadData);
    return () => {
      socket.off("pickup:created", loadData);
      socket.off("pickup:updated", loadData);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function updateStatus(id: string, status: string) {
    setBusyId(id);
    try {
      await api.patch(`/pickups/${id}/status`, { status });
      await loadData();
    } finally {
      setBusyId(null);
    }
  }

  if (loading || !user || !FIELD_ROLES.includes(user.role)) return null;

  const scheduled = pickups.filter((p) => p.status === "SCHEDULED");
  const inProgress = pickups.filter((p) => p.status === "IN_PROGRESS");
  const done = pickups.filter((p) => ["COMPLETED", "MISSED", "CANCELLED"].includes(p.status));

  const JobCard = ({ p }: { p: PickupRequest }) => (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-sm">{p.wasteType} waste</p>
          <p className="text-xs text-[var(--muted)] flex items-center gap-1 mt-0.5">
            <MapPin size={12} /> {p.address}
          </p>
          {p.resident?.name && <p className="text-xs text-[var(--muted)] mt-0.5">Resident: {p.resident.name}</p>}
        </div>
        <StatusBadge status={p.status} />
      </div>
      {p.status === "SCHEDULED" && (
        <button
          onClick={() => updateStatus(p.id, "IN_PROGRESS")}
          disabled={busyId === p.id}
          className="btn-primary text-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <PlayCircle size={16} /> Start pickup
        </button>
      )}
      {p.status === "IN_PROGRESS" && (
        <div className="flex gap-2">
          <button
            onClick={() => updateStatus(p.id, "COMPLETED")}
            disabled={busyId === p.id}
            className="btn-primary text-sm flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <CheckCircle2 size={16} /> Complete
          </button>
          <button
            onClick={() => updateStatus(p.id, "MISSED")}
            disabled={busyId === p.id}
            className="btn-secondary text-sm flex-1 flex items-center justify-center gap-2 disabled:opacity-60 !text-red-600 !border-red-200 hover:!bg-red-50"
          >
            <XCircle size={16} /> Mark missed
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Hi {user.name.split(" ")[0]}, here are your jobs</h1>
          <p className="text-[var(--muted)] text-sm mt-1">
            {vehicle ? `Driving ${vehicle.plateNumber} · ${vehicle.type}` : "No vehicle assigned yet"}
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <StatCard label="Scheduled" value={scheduled.length} icon={ClipboardList} tone="warn" />
          <StatCard label="In progress" value={inProgress.length} icon={Truck} tone="accent" />
          <StatCard label="Completed today" value={done.filter((p) => p.status === "COMPLETED").length} icon={CheckCircle2} tone="brand" />
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {inProgress.length > 0 && (
              <div>
                <h2 className="font-semibold mb-3 text-sm text-[var(--muted)] uppercase tracking-wide">In progress</h2>
                <div className="space-y-3">
                  {inProgress.map((p) => (
                    <JobCard key={p.id} p={p} />
                  ))}
                </div>
              </div>
            )}
            <div>
              <h2 className="font-semibold mb-3 text-sm text-[var(--muted)] uppercase tracking-wide">Scheduled</h2>
              {scheduled.length === 0 && <p className="text-sm text-[var(--muted)]">No scheduled pickups right now.</p>}
              <div className="space-y-3">
                {scheduled.map((p) => (
                  <JobCard key={p.id} p={p} />
                ))}
              </div>
            </div>
            {done.length > 0 && (
              <div>
                <h2 className="font-semibold mb-3 text-sm text-[var(--muted)] uppercase tracking-wide">Recent history</h2>
                <div className="space-y-3">
                  {done.slice(0, 6).map((p) => (
                    <JobCard key={p.id} p={p} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-3 card p-0 overflow-hidden h-[520px]">
            <LiveMapClient
              vehicles={vehicle ? [vehicle] : []}
              pickups={[...scheduled, ...inProgress]}
              center={vehicle?.latitude && vehicle?.longitude ? [vehicle.latitude, vehicle.longitude] : undefined}
              zoom={13}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
