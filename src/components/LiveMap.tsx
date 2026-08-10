"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Vehicle, PickupRequest, Complaint } from "@/lib/api";

const truckIcon = new L.DivIcon({
  className: "",
  html: `<div style="background:#1a9e5c;color:white;width:30px;height:30px;border-radius:9999px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.3);font-size:16px;animation:float-truck 2.4s ease-in-out infinite;">🚛</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const pickupIcon = new L.DivIcon({
  className: "",
  html: `<div style="background:#2563eb;color:white;width:26px;height:26px;border-radius:9999px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.3);font-size:13px;">📍</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

const complaintIcon = new L.DivIcon({
  className: "",
  html: `<div style="background:#dc2626;color:white;width:26px;height:26px;border-radius:9999px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.3);font-size:13px;">⚠️</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

// Roughly centers and frames the whole of Cameroon at the default zoom.
const CAMEROON_CENTER: [number, number] = [7.3697, 12.3547];
const CAMEROON_ZOOM = 6;

export default function LiveMap({
  vehicles = [],
  pickups = [],
  complaints = [],
  center = CAMEROON_CENTER,
  zoom = CAMEROON_ZOOM,
}: {
  vehicles?: Vehicle[];
  pickups?: PickupRequest[];
  complaints?: Complaint[];
  center?: [number, number];
  zoom?: number;
}) {
  return (
    <MapContainer center={center} zoom={zoom} minZoom={5} maxZoom={18} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {vehicles
        .filter((v) => v.latitude && v.longitude)
        .map((v) => (
          <Marker key={v.id} position={[v.latitude!, v.longitude!]} icon={truckIcon}>
            <Popup>
              <strong>{v.plateNumber}</strong>
              <br />
              {v.type}
              <br />
              Driver: {v.driver?.name || "Unassigned"}
              <br />
              Status: {v.status}
            </Popup>
          </Marker>
        ))}

      {pickups
        .filter((p) => p.latitude && p.longitude)
        .map((p) => (
          <Marker key={p.id} position={[p.latitude, p.longitude]} icon={pickupIcon}>
            <Popup>
              <strong>{p.wasteType} pickup</strong>
              <br />
              {p.address}
              <br />
              Status: {p.status}
            </Popup>
          </Marker>
        ))}

      {complaints
        .filter((c) => c.latitude && c.longitude)
        .map((c) => (
          <Marker key={c.id} position={[c.latitude!, c.longitude!]} icon={complaintIcon}>
            <Popup>
              <strong>{c.type.replace(/_/g, " ")}</strong>
              <br />
              {c.description}
              <br />
              Status: {c.status}
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
