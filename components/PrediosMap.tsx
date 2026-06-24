"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { PredioProspeccion } from "@/lib/types";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export function PrediosMap({ predios }: { predios: PredioProspeccion[] }) {
  const conCoordenadas = predios.filter((p) => p.lat && p.lng);
  const centro: [number, number] =
    conCoordenadas.length > 0
      ? [Number(conCoordenadas[0].lat), Number(conCoordenadas[0].lng)]
      : [-33.45, -70.65];

  return (
    <MapContainer center={centro} zoom={7} style={{ height: "420px", width: "100%" }} className="rounded-lg border">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {conCoordenadas.map((p) => (
        <Marker key={p.id} position={[Number(p.lat), Number(p.lng)]} icon={icon}>
          <Popup>
            <div className="text-sm space-y-1">
              <p className="font-medium">{p.nombre_propietario}</p>
              <p>{p.especie}{p.variedad ? ` · ${p.variedad}` : ""}</p>
              <p>{p.hectareas_aprox ? `${p.hectareas_aprox} ha` : "Hectáreas no informadas"}</p>
              <p>{p.region}{p.comuna ? `, ${p.comuna}` : ""}</p>
              {p.telefono && <p>📞 {p.telefono}</p>}
              {p.email && <p>✉️ {p.email}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
