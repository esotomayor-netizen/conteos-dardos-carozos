import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { CANAL_LABELS } from "@/lib/types";
import type { ProductorPipeline } from "@/lib/pipeline";

export function TarjetaProductor({ productor, dragging = false }: { productor: ProductorPipeline; dragging?: boolean }) {
  return (
    <div
      className={`rounded-lg border border-neutral-200 bg-white p-3 shadow-sm ${
        dragging ? "rotate-2 shadow-lg ring-2 ring-emerald-400" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-1">
        <p className="min-w-0 truncate text-sm font-medium text-neutral-800">{productor.razon_social}</p>
        <Link
          href={`/productores/${productor.id}`}
          onPointerDown={(e) => e.stopPropagation()}
          className="shrink-0 text-neutral-300 hover:text-emerald-600"
          title="Ver ficha"
        >
          <ExternalLink size={13} />
        </Link>
      </div>
      <p className="mt-0.5 truncate text-xs text-neutral-500">{productor.comuna ?? "Sin comuna"}</p>

      {productor.especies.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {productor.especies.slice(0, 3).map((e) => (
            <span key={e} className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-600">
              {e}
            </span>
          ))}
          {productor.especies.length > 3 && (
            <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-400">
              +{productor.especies.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs font-medium text-amber-700">{productor.kilos.toLocaleString("es-CL")} kg</span>
        {productor.agronomo_nombre && (
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-semibold text-emerald-700"
            title={productor.agronomo_nombre}
          >
            {productor.agronomo_nombre.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {productor.ultimaFecha && (
        <p className="mt-1.5 border-t border-neutral-100 pt-1.5 text-[10px] text-neutral-400">
          Último contacto: {productor.ultimaFecha} {productor.ultimoCanal ? `· ${CANAL_LABELS[productor.ultimoCanal]}` : ""}
        </p>
      )}
    </div>
  );
}
