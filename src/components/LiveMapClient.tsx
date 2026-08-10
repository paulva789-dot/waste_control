"use client";

import dynamic from "next/dynamic";
import { Vehicle, PickupRequest, Complaint } from "@/lib/api";

const LiveMap = dynamic(() => import("./LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center text-neutral-400 text-sm">
      Loading map...
    </div>
  ),
});

export default function LiveMapClient(props: {
  vehicles?: Vehicle[];
  pickups?: PickupRequest[];
  complaints?: Complaint[];
  center?: [number, number];
  zoom?: number;
}) {
  return <LiveMap {...props} />;
}
