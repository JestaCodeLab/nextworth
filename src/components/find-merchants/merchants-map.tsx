"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Store } from "lucide-react";
import { CITY_COORDINATES } from "@/lib/city-coordinates";

export interface MapMerchant {
  id: string;
  name: string;
  category: string;
  discountPercent?: number;
  city: string;
  country: "GH" | "UK";
}

function clusterIcon(count: number) {
  return L.divIcon({
    className: "",
    html: `<div style="
      display:flex;align-items:center;justify-content:center;
      width:${count > 1 ? 40 : 32}px;height:${count > 1 ? 40 : 32}px;
      border-radius:9999px;background:oklch(0.541 0.281 293.009);
      color:white;font-weight:600;font-size:13px;
      box-shadow:0 2px 8px rgba(0,0,0,0.35);border:2px solid white;
    ">${count > 1 ? count : ""}</div>`,
    iconSize: [count > 1 ? 40 : 32, count > 1 ? 40 : 32],
    iconAnchor: [count > 1 ? 20 : 16, count > 1 ? 20 : 16],
  });
}

function FitToMarkers({ positions }: { positions: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 11);
    } else {
      map.fitBounds(positions, { padding: [48, 48], maxZoom: 12 });
    }
  }, [positions, map]);

  return null;
}

export function MerchantsMap({
  merchants,
  defaultCenter = [10, 0],
  defaultZoom = 2,
  lockToDefaultView = false,
}: {
  merchants: MapMerchant[];
  defaultCenter?: [number, number];
  defaultZoom?: number;
  /** When true, stay focused on defaultCenter/defaultZoom instead of auto-fitting to markers — used when we already know the member's market (e.g. Accra for Ghana, London for the UK). */
  lockToDefaultView?: boolean;
}) {
  const groups = useMemo(() => {
    const byCity = new Map<string, MapMerchant[]>();
    for (const merchant of merchants) {
      const key = merchant.city;
      if (!byCity.has(key)) byCity.set(key, []);
      byCity.get(key)!.push(merchant);
    }
    return Array.from(byCity.entries())
      .map(([city, list]) => ({ city, list, coords: CITY_COORDINATES[city] }))
      .filter((group): group is { city: string; list: MapMerchant[]; coords: [number, number] } => Boolean(group.coords));
  }, [merchants]);

  const positions = groups.map((g) => g.coords);

  return (
    <div className="h-full w-full overflow-hidden rounded-xl ring-1 ring-foreground/10">
      <MapContainer center={defaultCenter} zoom={defaultZoom} scrollWheelZoom className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {!lockToDefaultView && <FitToMarkers positions={positions} />}
        {groups.map((group) => (
          <Marker key={group.city} position={group.coords} icon={clusterIcon(group.list.length)}>
            <Popup>
              <div className="min-w-48 space-y-2">
                <div className="flex items-center gap-1.5 font-semibold">
                  <MapPin className="h-3.5 w-3.5" />
                  {group.city} · {group.list.length} {group.list.length === 1 ? "merchant" : "merchants"}
                </div>
                <div className="space-y-1.5">
                  {group.list.map((merchant) => (
                    <div key={merchant.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex items-center gap-1.5 truncate">
                        <Store className="h-3 w-3 shrink-0 text-muted-foreground" />
                        {merchant.name}
                      </span>
                      {merchant.discountPercent !== undefined && (
                        <span className="shrink-0 font-medium text-success">{merchant.discountPercent}% off</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
