"use client";

import { useState } from "react";
import { BarList } from "@/components/dashboard/BarList";
import type { DashboardMetrics } from "@/lib/dashboard-metrics";

export function AgronomoPanel({
  ranking,
  porAgronomo,
  canalColors,
  especieColors,
}: {
  ranking: DashboardMetrics["ranking"];
  porAgronomo: DashboardMetrics["porAgronomo"];
  canalColors: Record<string, string>;
  especieColors: Record<string, string>;
}) {
  const [seleccionado, setSeleccionado] = useState<number | null>(ranking[0]?.id ?? null);

  if (ranking.length === 0) {
    return <p className="text-sm text-neutral-500">Todavía no hay agrónomos registrados.</p>;
  }

  const detalle = seleccionado != null ? porAgronomo[seleccionado] : null;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {ranking.map((a) => (
          <button
            key={a.id}
            onClick={() => setSeleccionado(a.id)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              seleccionado === a.id
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300 hover:text-emerald-700"
            }`}
          >
            {a.nombre}
          </button>
        ))}
      </div>

      {detalle && (
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="sm:col-span-1 space-y-3">
            <div className="rounded-lg bg-neutral-50 p-3">
              <p className="text-xs uppercase text-neutral-500">Contactos registrados</p>
              <p className="text-2xl font-bold text-neutral-800 tabular-nums">{detalle.totalContactos}</p>
            </div>
            <div className="rounded-lg bg-neutral-50 p-3">
              <p className="text-xs uppercase text-neutral-500">Productores contactados</p>
              <p className="text-2xl font-bold text-neutral-800 tabular-nums">{detalle.productoresContactados}</p>
            </div>
            <div className="rounded-lg bg-neutral-50 p-3">
              <p className="text-xs uppercase text-neutral-500">Productores asignados</p>
              <p className="text-2xl font-bold text-neutral-800 tabular-nums">{detalle.productoresAsignados}</p>
            </div>
          </div>
          <div className="sm:col-span-2 space-y-5">
            <div>
              <p className="mb-2 text-sm font-medium text-neutral-700">Contactos por canal</p>
              <BarList items={detalle.canal} colors={canalColors} />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-neutral-700">Contactos por especie</p>
              <BarList items={detalle.especie} colors={especieColors} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
