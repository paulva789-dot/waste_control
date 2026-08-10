"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Truck, MessageSquareWarning, PackageCheck, Clock, Crown, Sparkles, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import LiveMapClient from "@/components/LiveMapClient";
import TownChangeModal from "@/components/TownChangeModal";
import { useAuth } from "@/lib/auth-context";
import { api, PickupRequest, Vehicle, Complaint } from "@/lib/api";
import { getSocket } from "@/lib/socket";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showTownChange, setShowTownChange] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    loadData();

    const socket = getSocket();
    socket.on("pickup:created", () => loadData());
    socket.on("pickup:updated", () => loadData());
    socket.on("vehicle:location", (v: Vehicle) => {
      setVehicles((prev) => prev.map((x) => (x.id === v.id ? v : x)));
    });
    return () => {
      socket.off("pickup:created");
      socket.off("pickup:updated");
      socket.off("vehicle:location");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function loadData() {
    const [p, c, v] = await Promise.all([
      api.get("/pickups"),
      api.get("/complaints"),
      api.get("/vehicles"),
    ]);
    setPickups(p.data);
    setComplaints(c.data);
    setVehicles(v.data);
  }

  if (loading || !user) return null;

  const pending = pickups.filter((p) => p.status === "PENDING").length;
  const completed = pickups.filter((p) => p.status === "COMPLETED").length;
  const openComplaints = complaints.filter((c) => c.status === "OPEN").length;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 animate-fade-up">
          <div>
            <h1 className="text-2xl font-bold">Hi {user.name.split(" ")[0]}, welcome back</h1>
            <button
              onClick={() => setShowTownChange(true)}
              className="text-[var(--muted)] text-sm mt-1 flex items-center gap-1.5 hover:text-brand-dark transition"
            >
              <MapPin size={13} />
              {user.town || "No town set"} · {user.area || "No area set"}
              <span className="text-brand-dark font-semibold underline decoration-dotted">change</span>
            </button>
          </div>
          <Link
            href="/schedule"
            className="btn-primary flex items-center gap-2"
          >
            {user.isPremium ? <Sparkles size={18} /> : <Crown size={18} />}
            {user.isPremium ? "Request special pickup" : "Go premium to request pickup"}
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
          <StatCard label="Pending pickups" value={pending} icon={Clock} tone="warn" />
          <StatCard label="Completed pickups" value={completed} icon={PackageCheck} tone="brand" />
          <StatCard label="Open complaints" value={openComplaints} icon={MessageSquareWarning} tone="danger" />
          <StatCard label="Vehicles active" value={vehicles.length} icon={Truck} tone="accent" />
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 card p-0 overflow-hidden h-[420px] animate-fade-up">
            {user.hasUnlockedTracking ? (
              <LiveMapClient
                vehicles={vehicles}
                pickups={pickups}
                complaints={complaints}
                center={user.latitude && user.longitude ? [user.latitude, user.longitude] : undefined}
                zoom={user.latitude && user.longitude ? 13 : undefined}
              />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center gap-3 text-center p-6">
                <p className="text-sm text-[var(--muted)] max-w-xs">
                  Unlock the live map to see waste collector locations in real time.
                </p>
                <Link href="/map" className="btn-primary text-sm">
                  Unlock for 1500 XAF
                </Link>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 card p-5 animate-fade-up">
            <h2 className="font-semibold mb-4">My pickup requests</h2>
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {pickups.length === 0 && <p className="text-sm text-[var(--muted)]">No pickup requests yet.</p>}
              {pickups.map((p) => (
                <div key={p.id} className="flex items-center justify-between border-b border-[var(--border-soft)] pb-3 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{p.wasteType}</p>
                    <p className="text-xs text-[var(--muted)]">{p.address}</p>
                    {p.priceXAF != null && (
                      <p className="text-xs text-brand-dark font-semibold mt-0.5">{p.priceXAF} XAF</p>
                    )}
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-5 animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">My complaints</h2>
            <a href="/complaints" className="text-sm text-brand-dark font-semibold flex items-center gap-1">
              <MessageSquareWarning size={14} /> Report an issue
            </a>
          </div>
          <div className="space-y-3">
            {complaints.length === 0 && <p className="text-sm text-[var(--muted)]">No complaints reported.</p>}
            {complaints.map((c) => (
              <div key={c.id} className="flex items-center justify-between border-b border-[var(--border-soft)] pb-3 last:border-0">
                <div>
                  <p className="font-medium text-sm">{c.type.replace(/_/g, " ")}</p>
                  <p className="text-xs text-[var(--muted)]">{c.description}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        </div>
      </main>

      {showTownChange && <TownChangeModal currentTown={user.town} onClose={() => setShowTownChange(false)} />}
    </div>
  );
}
