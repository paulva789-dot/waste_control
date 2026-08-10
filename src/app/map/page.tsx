"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import LiveMapClient from "@/components/LiveMapClient";
import DriverCard from "@/components/DriverCard";
import UnlockGate from "@/components/UnlockGate";
import { useAuth } from "@/lib/auth-context";
import { api, PickupRequest, Vehicle, Complaint } from "@/lib/api";
import { getSocket } from "@/lib/socket";

export default function MapPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    loadData();
    const socket = getSocket();
    socket.on("vehicle:location", (v: Vehicle) => {
      setVehicles((prev) => prev.map((x) => (x.id === v.id ? v : x)));
    });
    socket.on("pickup:created", loadData);
    socket.on("pickup:updated", loadData);
    return () => {
      socket.off("vehicle:location");
      socket.off("pickup:created");
      socket.off("pickup:updated");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function loadData() {
    const [p, c, v] = await Promise.all([api.get("/pickups"), api.get("/complaints"), api.get("/vehicles")]);
    setPickups(p.data);
    setComplaints(c.data);
    setVehicles(v.data);
  }

  if (loading || !user) return null;

  const unlocked = !!user.hasUnlockedTracking;
  const trackedVehicles = vehicles.filter((v) => !v.locked);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center gap-2 animate-fade-up">
          <MapPin className="text-brand" size={22} />
          <h1 className="text-2xl font-bold">Live map &amp; collector tracking</h1>
        </div>

        {!unlocked ? (
          <UnlockGate onUnlocked={loadData} />
        ) : (
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 card p-0 overflow-hidden h-[560px] animate-fade-up">
              <LiveMapClient vehicles={vehicles} pickups={pickups} complaints={complaints} />
            </div>

            <div className="lg:col-span-2 space-y-3">
              <h2 className="font-semibold">Waste collectors on duty</h2>
              <div className="space-y-3 stagger">
                {trackedVehicles.length === 0 && (
                  <p className="text-sm text-[var(--muted)]">No active vehicles right now.</p>
                )}
                {trackedVehicles.map((v) => (
                  <DriverCard key={v.id} vehicle={v} />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
