"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Truck,
  MessageSquareWarning,
  PackageCheck,
  Percent,
  Recycle,
  Search,
  UserPlus,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import LiveMapClient from "@/components/LiveMapClient";
import AssignPickupModal from "@/components/AssignPickupModal";
import InviteStaffModal from "@/components/InviteStaffModal";
import { useAuth } from "@/lib/auth-context";
import { api, AnalyticsOverview, PickupRequest, Complaint, Vehicle } from "@/lib/api";
import { getSocket } from "@/lib/socket";

const ADMIN_ROLES = ["COUNCIL_ADMIN", "SYSTEM_ADMIN", "HYSACAM_SUPERVISOR", "INSPECTOR"];
const CAN_ASSIGN_ROLES = ["COUNCIL_ADMIN", "SYSTEM_ADMIN", "HYSACAM_SUPERVISOR"];
const PIE_COLORS = ["#1a9e5c", "#2563eb", "#f59e0b", "#dc2626", "#7c3aed"];
const STATUS_FILTERS = ["ALL", "PENDING", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "MISSED", "CANCELLED"];

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [assignTarget, setAssignTarget] = useState<PickupRequest | null>(null);
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !ADMIN_ROLES.includes(user.role))) {
      router.push(user ? "/dashboard" : "/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || !ADMIN_ROLES.includes(user.role)) return;
    loadData();
    const socket = getSocket();
    socket.on("pickup:created", loadData);
    socket.on("pickup:updated", loadData);
    socket.on("complaint:created", loadData);
    socket.on("complaint:updated", loadData);
    socket.on("vehicle:location", (v: Vehicle) => {
      setVehicles((prev) => prev.map((x) => (x.id === v.id ? v : x)));
    });
    return () => {
      socket.off("pickup:created", loadData);
      socket.off("pickup:updated", loadData);
      socket.off("complaint:created", loadData);
      socket.off("complaint:updated", loadData);
      socket.off("vehicle:location");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function loadData() {
    const [a, p, c, v] = await Promise.all([
      api.get("/analytics/overview"),
      api.get("/pickups"),
      api.get("/complaints"),
      api.get("/vehicles"),
    ]);
    setOverview(a.data);
    setPickups(p.data);
    setComplaints(c.data);
    setVehicles(v.data);
  }

  async function resolveComplaint(id: string) {
    await api.patch(`/complaints/${id}/status`, { status: "RESOLVED" });
  }

  if (loading || !user || !ADMIN_ROLES.includes(user.role) || !overview) return null;

  const pickupStatusData = ["PENDING", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "MISSED"].map((status) => ({
    status,
    count: pickups.filter((p) => p.status === status).length,
  }));

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Council operations dashboard</h1>
            <p className="text-[var(--muted)] text-sm mt-1">Live overview across all collection zones</p>
          </div>
          {CAN_ASSIGN_ROLES.includes(user.role) && (
            <button onClick={() => setShowInvite(true)} className="btn-secondary flex items-center gap-2 text-sm">
              <UserPlus size={15} /> Invite staff
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Total pickups" value={overview.totalPickups} icon={PackageCheck} tone="brand" />
          <StatCard label="Collection efficiency" value={`${overview.collectionEfficiency}%`} icon={Percent} tone="accent" />
          <StatCard label="Missed pickups" value={overview.missedPickups} icon={Truck} tone="warn" />
          <StatCard label="Open complaints" value={overview.openComplaints} icon={MessageSquareWarning} tone="danger" />
          <StatCard label="Active vehicles" value={overview.vehicles} icon={Truck} tone="brand" />
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 card p-0 overflow-hidden h-[420px]">
            <LiveMapClient vehicles={vehicles} pickups={pickups} complaints={complaints} />
          </div>

          <div className="lg:col-span-2 card p-5">
            <h2 className="font-semibold mb-4">Pickups by status</h2>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={pickupStatusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1a9e5c" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 card p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Recycle size={18} className="text-brand" /> Recycling by material
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={overview.recycling}
                  dataKey="quantityKg"
                  nameKey="material"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(props: { name?: string }) => props.name ?? ""}
                >
                  {overview.recycling.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-3 card p-5">
            <h2 className="font-semibold mb-4">Recent complaints</h2>
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {complaints.length === 0 && <p className="text-sm text-[var(--muted)]">No complaints reported.</p>}
              {complaints.map((c) => (
                <div key={c.id} className="flex items-center justify-between border-b border-[var(--border-soft)] pb-3 last:border-0">
                  <div>
                    <p className="font-medium text-sm">
                      {c.type.replace(/_/g, " ")}{" "}
                      <span className="font-mono text-[10px] text-[var(--muted)] font-normal">#{c.reference}</span>
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {c.reporter?.name || "Anonymous"} · {c.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={c.status} />
                    {c.status === "OPEN" && (
                      <button
                        onClick={() => resolveComplaint(c.id)}
                        className="text-xs font-semibold text-brand-dark hover:underline"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="font-semibold">All pickup requests</h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-56 max-w-full">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search resident or address..."
                  className="input pl-8 py-1.5 text-sm"
                />
              </div>
              <div className="w-44 max-w-full">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input py-1.5 text-sm"
                >
                  {STATUS_FILTERS.map((s) => (
                    <option key={s} value={s}>
                      {s === "ALL" ? "All statuses" : s.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--muted)] border-b border-[var(--border-soft)]">
                  <th className="py-2 pr-4">Resident</th>
                  <th className="py-2 pr-4">Waste type</th>
                  <th className="py-2 pr-4">Address</th>
                  <th className="py-2 pr-4">Collector</th>
                  <th className="py-2 pr-4">Status</th>
                  {CAN_ASSIGN_ROLES.includes(user.role) && <th className="py-2 pr-4"></th>}
                </tr>
              </thead>
              <tbody>
                {pickups
                  .filter((p) => statusFilter === "ALL" || p.status === statusFilter)
                  .filter((p) => {
                    const q = search.trim().toLowerCase();
                    if (!q) return true;
                    return (
                      p.resident?.name?.toLowerCase().includes(q) || p.address.toLowerCase().includes(q)
                    );
                  })
                  .map((p) => (
                    <tr key={p.id} className="border-b border-neutral-50 last:border-0">
                      <td className="py-2.5 pr-4">{p.resident?.name}</td>
                      <td className="py-2.5 pr-4">{p.wasteType}</td>
                      <td className="py-2.5 pr-4 text-[var(--muted)]">{p.address}</td>
                      <td className="py-2.5 pr-4 text-[var(--muted)]">{p.collector?.name || "Unassigned"}</td>
                      <td className="py-2.5 pr-4">
                        <StatusBadge status={p.status} />
                      </td>
                      {CAN_ASSIGN_ROLES.includes(user.role) && (
                        <td className="py-2.5 pr-4">
                          {p.status === "PENDING" && (
                            <button
                              onClick={() => setAssignTarget(p)}
                              className="text-xs font-semibold text-brand-dark hover:underline flex items-center gap-1"
                            >
                              <UserPlus size={13} /> Assign
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {assignTarget && (
        <AssignPickupModal
          pickup={assignTarget}
          onClose={() => setAssignTarget(null)}
          onAssigned={loadData}
        />
      )}
      {showInvite && <InviteStaffModal onClose={() => setShowInvite(false)} onInvited={() => {}} />}
    </div>
  );
}
