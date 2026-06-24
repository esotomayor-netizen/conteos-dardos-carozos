"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import type { PredioProspeccion } from "@/lib/types";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Las coordenadas se aproximan al centroide de la comuna (el catastro no trae GPS por predio).
// Se aplica un pequeño desplazamiento determinístico por id para que los puntos de una misma
// comuna no queden exactamente superpuestos.
function jitter(id: number, lat: number, lng: number): [number, number] {
  const angle = (id * 37) % 360;
  const radius = 0.01 + ((id * 13) % 100) / 4000;
  const rad = (angle * Math.PI) / 180;
  return [lat + radius * Math.cos(rad), lng + radius * Math.sin(rad)];
}

export function PrediosMap({ predios }: { predios: PredioProspeccion[] }) {
  const conCoordenadas = predios.filter((p) => p.lat && p.lng);
  const centro: [number, number] =
    conCoordenadas.length > 0
      ? [Number(conCoordenadas[0].lat), Number(conCoordenadas[0].lng)]
      : [-33.45, -70.65];

  return (
    <MapContainer center={centro} zoom={8} style={{ height: "420px", width: "100%" }} className="rounded-lg border">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MarkerClusterGroup chunkedLoading>
        {conCoordenadas.map((p) => {
          const [lat, lng] = jitter(p.id, Number(p.lat), Number(p.lng));
          return (
            <Marker key={p.id} position={[lat, lng]} icon={icon}>
              <Popup>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{p.nombre_propietario}</p>
                  {p.direccion && <p>{p.direccion}</p>}
                  <p>
                    {p.especie}
                    {p.variedad ? ` · ${p.variedad}` : ""}
                  </p>
                  <p>
                    {p.hectareas_aprox ? `${p.hectareas_aprox} ha` : "Hectáreas no informadas"}
                    {p.ha_total_predio ? ` de ${p.ha_total_predio} ha del predio` : ""}
                  </p>
                  <p>
                    {p.comuna ?? p.region}, {p.region}
                  </p>
                  {p.rol && <p>Rol: {p.rol}</p>}
                  {p.telefono && <p>📞 {p.telefono}</p>}
                  {p.email && <p>✉️ {p.email}</p>}
                  <p className="text-neutral-400">Ubicación aproximada (centroide de comuna)</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
