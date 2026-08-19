"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MapaProductores } from "@/components/MapaProductores";
import type { ProductorZona } from "@/lib/types";

type Grupo = {
  region: string;
  provincia: string;
  comuna: string;
  productores: ProductorZona[];
};

export function ZonasClient({ productores }: { productores: ProductorZona[] }) {
  const [region, setRegion] = useState("");
  const [comuna, setComuna] = useState("");

  const regiones = useMemo(
    () => [...new Set(productores.map((p) => p.region))].sort((a, b) => a.localeCompare(b)),
    [productores]
  );

  const comunas = useMemo(() => {
    const base = region ? productores.filter((p) => p.region === region) : productores;
    return [...new Set(base.map((p) => p.comuna))].sort((a, b) => a.localeCompare(b));
  }, [productores, region]);

  const filtrados = useMemo(
    () => productores.filter((p) => (!region || p.region === region) && (!comuna || p.comuna === comuna)),
    [productores, region, comuna]
  );

  const grupos = useMemo(() => {
    const map = new Map<string, Grupo>();
    for (const p of filtrados) {
      const key = `${p.region}__${p.provincia}__${p.comuna}`;
      if (!map.has(key)) map.set(key, { region: p.region, provincia: p.provincia, comuna: p.comuna, productores: [] });
      map.get(key)!.productores.push(p);
    }
    return [...map.values()].sort(
      (a, b) =>
        a.region.localeCompare(b.region) || a.provincia.localeCompare(b.provincia) || a.comuna.localeCompare(b.comuna)
    );
  }, [filtrados]);

  const conDireccion = filtrados.filter((p) => p.direccion).length;

  function cambiarRegion(value: string) {
    setRegion(value);
    setComuna("");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Zonas de productores</h1>
          <p className="text-neutral-600">Agrupados por comuna para planificar rutas de visita del equipo.</p>
        </div>
        <Link
          href="/productores"
          className="text-sm text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 rounded-full px-4 py-2 font-medium shrink-0 transition-colors"
        >
          ← Volver a productores
        </Link>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-500">Región</label>
          <select
            value={region}
            onChange={(e) => cambiarRegion(e.target.value)}
            className="rounded border border-neutral-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Todas las regiones</option>
            {regiones.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-500">Comuna</label>
          <select
            value={comuna}
            onChange={(e) => setComuna(e.target.value)}
            className="rounded border border-neutral-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Todas las comunas</option>
            {comunas.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {(region || comuna) && (
          <button
            onClick={() => {
              setRegion("");
              setComuna("");
            }}
            className="text-sm text-red-600 hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <p className="text-sm text-neutral-500">
        {filtrados.length} productores en {grupos.length} comunas · {conDireccion} con dirección registrada
      </p>

      <MapaProductores productores={filtrados} />

      <div className="space-y-6">
        {grupos.map((g) => (
          <div
            key={`${g.region}__${g.provincia}__${g.comuna}`}
            className="overflow-hidden rounded-lg border border-l-4 border-neutral-200 border-l-emerald-500 bg-white shadow-sm"
          >
            <div className="border-b border-emerald-100 bg-emerald-50 px-4 py-3">
              <p className="font-medium text-emerald-900">{g.comuna}</p>
              <p className="text-xs text-emerald-700">
                {g.provincia} · {g.region} · {g.productores.length} productores
              </p>
            </div>
            <div className="divide-y">
              {g.productores.map((p) => (
                <Link
                  key={p.id}
                  href={`/productores/${p.id}`}
                  className="flex items-center justify-between gap-4 p-3 transition-colors hover:bg-emerald-50/60"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.razon_social}</p>
                    <p className="truncate text-xs text-neutral-500">
                      {p.direccion ?? "Sin dirección registrada"}
                      {p.dueno_telefono ? ` · ${p.dueno_telefono}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-neutral-400">{p.especies.join(", ") || "—"}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
