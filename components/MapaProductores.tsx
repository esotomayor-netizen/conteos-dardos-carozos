"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

export type ProductorMapa = {
  id: number;
  razon_social: string;
  direccion: string | null;
  comuna: string | null;
  dueno_telefono: string | null;
  especies: string[];
  latitud: number | null;
  longitud: number | null;
};

const CENTRO_CHILE = { lat: -35.6, lng: -71.5 };

function escapeHtml(text: string) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

export function MapaProductores({ productores }: { productores: ProductorMapa[] }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapRef = useRef<HTMLDivElement>(null);
  const [scriptCargado, setScriptCargado] = useState(false);

  const conCoordenadas = productores.filter(
    (p): p is ProductorMapa & { latitud: number; longitud: number } => p.latitud != null && p.longitud != null
  );

  useEffect(() => {
    if (!scriptCargado || !mapRef.current) return;
    if (typeof google === "undefined") return;

    const map = new google.maps.Map(mapRef.current, {
      center: CENTRO_CHILE,
      zoom: 6,
    });

    if (conCoordenadas.length === 0) return;

    const infoWindow = new google.maps.InfoWindow();
    const bounds = new google.maps.LatLngBounds();

    for (const p of conCoordenadas) {
      const position = { lat: Number(p.latitud), lng: Number(p.longitud) };
      const marker = new google.maps.Marker({ position, map, title: p.razon_social });
      bounds.extend(position);

      marker.addListener("click", () => {
        infoWindow.setContent(`
          <div style="font-family: system-ui, sans-serif; max-width: 220px;">
            <p style="font-weight: 600; margin: 0 0 4px;">${escapeHtml(p.razon_social)}</p>
            <p style="margin: 0 0 2px; color: #555; font-size: 13px;">${escapeHtml(p.direccion ?? p.comuna ?? "")}</p>
            ${p.dueno_telefono ? `<p style="margin: 0 0 2px; font-size: 13px;">📞 ${escapeHtml(p.dueno_telefono)}</p>` : ""}
            ${p.especies.length ? `<p style="margin: 0 0 6px; font-size: 12px; color: #777;">${escapeHtml(p.especies.join(", "))}</p>` : ""}
            <a href="/productores/${p.id}" style="color: #047857; font-size: 13px; font-weight: 500;">Ver ficha →</a>
          </div>
        `);
        infoWindow.open({ map, anchor: marker });
      });
    }

    map.fitBounds(bounds);
  }, [scriptCargado, conCoordenadas]);

  if (!apiKey) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Para ver el mapa configura la variable de entorno{" "}
        <code className="font-mono bg-amber-100 px-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> con tu API key de
        Google Maps.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}`}
        strategy="afterInteractive"
        onLoad={() => setScriptCargado(true)}
      />
      <div ref={mapRef} className="w-full h-[420px] rounded-lg border border-neutral-200 bg-neutral-100" />
      <p className="text-xs text-neutral-500">
        {conCoordenadas.length} de {productores.length} productores tienen coordenadas.
        {conCoordenadas.length < productores.length && " Corre el script de geocodificación para completar el resto."}
      </p>
    </div>
  );
}
