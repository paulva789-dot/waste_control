import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Proof-of-service photos are served from the backend's own /uploads path
// (self-hosted, no external storage dependency) — resolve them to an absolute URL.
export function resolveUploadUrl(path?: string | null) {
  if (!path) return null;
  return `${API_URL}${path}`;
}

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("dwms_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export type Role =
  | "RESIDENT"
  | "COLLECTOR"
  | "HYSACAM_DRIVER"
  | "HYSACAM_SUPERVISOR"
  | "COUNCIL_ADMIN"
  | "RECYCLING_COMPANY"
  | "INSPECTOR"
  | "SYSTEM_ADMIN";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  area?: string | null;
  town?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isPremium?: boolean;
  premiumUntil?: string | null;
  hasUnlockedTracking?: boolean;
}

export interface PickupRequest {
  id: string;
  wasteType: string;
  address: string;
  latitude: number;
  longitude: number;
  status: "PENDING" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "MISSED" | "CANCELLED";
  createdAt: string;
  scheduledFor?: string | null;
  completedAt?: string | null;
  isSpecial?: boolean;
  priceXAF?: number | null;
  resident?: { id: string; name: string; area?: string | null };
  collector?: { id: string; name: string } | null;
  // Proof of service, captured when the collector marks the pickup complete.
  completionPhotoUrl?: string | null;
  completionLatitude?: number | null;
  completionLongitude?: number | null;
  binCount?: number | null;
}

export interface ComplaintTimelineEvent {
  status: string;
  at: string;
}

export interface Complaint {
  id: string;
  reference?: string;
  type: string;
  description: string;
  status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "REJECTED";
  createdAt: string;
  latitude?: number | null;
  longitude?: number | null;
  reporter?: { id: string; name: string };
}

export interface ComplaintTracking {
  reference: string;
  type: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  timeline: ComplaintTimelineEvent[];
}

export interface Vehicle {
  id: string;
  plateNumber?: string;
  type: string;
  truckColor?: string;
  town?: string | null;
  description?: string | null;
  status: string;
  latitude?: number | null;
  longitude?: number | null;
  driver?: { id: string; name: string; phone?: string | null; email?: string | null };
  locked?: boolean;
}

export interface Schedule {
  id: string;
  area: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  vehicle?: { plateNumber: string; driver?: { name: string } } | null;
}

// "PREMIUM_MEMBERSHIP" and "SPECIAL_PICKUP" are the initiable payment types.
// "UNLOCK_TRACKING" too. "TOWN_CHANGE" only appears on historical payment
// records — changing town is free now, see AuthContext.changeTown.
export type PaymentType = "UNLOCK_TRACKING" | "PREMIUM_MEMBERSHIP" | "SPECIAL_PICKUP" | "TOWN_CHANGE";
export type Provider = "MTN" | "ORANGE";

export interface Payment {
  id: string;
  amountXAF: number;
  provider: Provider;
  type: PaymentType;
  status: "PENDING" | "SUCCESS" | "FAILED";
  reference: string;
  createdAt: string;
}

export interface PriceQuote {
  priceXAF: number;
  basePriceXAF: number;
  isWeekend: boolean;
  isEvening: boolean;
  multiplier: number;
  surcharges: { label: string; percent: number }[];
}

export const UNLOCK_FEE_XAF = 1500;

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface AnalyticsOverview {
  totalPickups: number;
  completedPickups: number;
  missedPickups: number;
  openComplaints: number;
  resolvedComplaints: number;
  vehicles: number;
  collectionEfficiency: number;
  recycling: { material: string; quantityKg: number }[];
}
