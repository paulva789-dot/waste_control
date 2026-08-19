"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Truck, MapPin, PlayCircle, CheckCircle2, XCircle, ClipboardList, AlertTriangle, CloudUpload } from "lucide-react";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import LiveMapClient from "@/components/LiveMapClient";
import CompletePickupModal from "@/components/CompletePickupModal";
import { useAuth } from "@/lib/auth-context";
import { api, PickupRequest, Vehicle } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { getQueue, removeFromQueue, base64ToBlob } from "@/lib/offlineQueue";

const FIELD_ROLES = ["COLLECTOR", "HYSACAM_DRIVER"];

function overdueInfo(p: PickupRequest): { overdue: boolean; label: string } | null {
  if (!p.scheduledFor || ["COMPLETED", "CANCELLED"].includes(p.status)) return null;
  const due = new Date(p.scheduledFor).getTime();
  const diffMs = due - Date.now();
  if (diffMs < 0) return { overdue: true, label: "Overdue" };
  const hours = Math.round(diffMs / (1000 * 60 * 60));
  return { overdue: false, label: hours < 1 ? "Due soon" : `Due in ${hours}h` };
}

export default function JobsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [completingPickup, setCompletingPickup] = useState<PickupRequest | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [flushMessage, setFlushMessage] = useState("");

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

  async function flushQueue() {
    const queue = getQueue();
    if (queue.length === 0) {
      setPendingCount(0);
      return;
    }
    let synced = 0;
    for (const item of queue) {
      try {
        const form = new FormData();
        if (item.photoBase64) form.append("photo", base64ToBlob(item.photoBase64), "photo.jpg");
        if (item.latitude != null) form.append("latitude", String(item.latitude));
        if (item.longitude != null) form.append("longitude", String(item.longitude));
        if (item.binCount != null) form.append("binCount", String(item.binCount));
        await api.post(`/pickups/${item.pickupId}/complete`, form);
        removeFromQueue(item.pickupId);
        synced++;
      } catch {
        break; // still offline — stop and retry later
      }
    }
    setPendingCount(getQueue().length);
    if (synced > 0) {
      setFlushMessage(`Synced ${synced} pending completion${synced === 1 ? "" : "s"}`);
      setTimeout(() => setFlushMessage(""), 3000);
      loadData();
    }
  }

  useEffect(() => {
    if (!user || !FIELD_ROLES.includes(user.role)) return;
    loadData();
    setPendingCount(getQueue().length);
    flushQueue();

    const socket = getSocket();
    socket.on("pickup:created", loadData);
    socket.on("pickup:updated", loadData);
    window.addEventListener("online", flushQueue);
    return () => {
      socket.off("pickup:created", loadData);
      socket.off("pickup:updated", loadData);
      window.removeEventListener("online", flushQueue);
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

  const JobCard = ({ p }: { p: PickupRequest }) => {
    const overdue = overdueInfo(p);
    return (
      <div className="card p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-sm">{p.wasteType} waste</p>
            <p className="text-xs text-[var(--muted)] flex items-center gap-1 mt-0.5">
              <MapPin size={12} /> {p.address}
            </p>
            {p.resident?.name && <p className="text-xs text-[var(--muted)] mt-0.5">Resident: {p.resident.name}</p>}
          </div>
          <div className="flex flex-col items-end gap-1">
            <StatusBadge status={p.status} />
            {overdue && (
              <span
                className={`text-[10px] font-semibold flex items-center gap-1 ${
                  overdue.overdue ? "text-red-600" : "text-amber-600"
                }`}
              >
                {overdue.overdue && <AlertTriangle size={10} />} {overdue.label}
              </span>
            )}
          </div>
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
              onClick={() => setCompletingPickup(p)}
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
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Hi {user.name.split(" ")[0]}, here are your jobs</h1>
            <p className="text-[var(--muted)] text-sm mt-1">
              {vehicle ? `Driving ${vehicle.plateNumber} · ${vehicle.type}` : "No vehicle assigned yet"}
            </p>
          </div>
          {(pendingCount > 0 || flushMessage) && (
            <span className="badge bg-amber-50 text-amber-700 text-xs flex items-center gap-1.5">
              <CloudUpload size={13} />
              {flushMessage || `${pendingCount} completion${pendingCount === 1 ? "" : "s"} pending sync`}
            </span>
          )}
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

      {completingPickup && (
        <CompletePickupModal
          pickup={completingPickup}
          onClose={() => setCompletingPickup(null)}
          onDone={(queued) => {
            setCompletingPickup(null);
            if (queued) {
              setPendingCount(getQueue().length);
            } else {
              loadData();
            }
          }}
        />
      )}
    </div>
  );
}
