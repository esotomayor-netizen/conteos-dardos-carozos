"use client";

import { useEffect, useState } from "react";
import { CANALES_CONTACTO, CANAL_LABELS, ESTADO_LABELS, type CanalContacto, type EstadoSeguimiento } from "@/lib/types";
import type { ProductorPipeline } from "@/lib/pipeline";
import type { AgronomoRaw } from "@/lib/dashboard-metrics";

export function RegistrarContactoModal({
  productor,
  columnaDestino,
  agronomos,
  onCancel,
  onSaved,
}: {
  productor: ProductorPipeline;
  columnaDestino: EstadoSeguimiento;
  agronomos: AgronomoRaw[];
  onCancel: () => void;
  onSaved: (agronomoId: number | null) => void;
}) {
  const [canal, setCanal] = useState<CanalContacto>("telefono");
  const [agronomoId, setAgronomoId] = useState<string>(productor.agronomo_id ? String(productor.agronomo_id) : "");
  const [notas, setNotas] = useState("");
  const [proximo, setProximo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  async function guardar() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/seguimientos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productor_id: productor.id,
        agronomo_id: agronomoId || undefined,
        canal,
        estado: columnaDestino,
        notas: notas || undefined,
        proximo_seguimiento: proximo || undefined,
      }),
    });
    setLoading(false);
    if (res.ok) {
      onSaved(agronomoId ? Number(agronomoId) : null);
    } else {
      setError("No se pudo registrar el contacto. Intenta de nuevo.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-neutral-800">Registrar contacto</h2>
        <p className="mt-1 text-sm text-neutral-500">
          {productor.razon_social} → <span className="font-medium text-neutral-700">{ESTADO_LABELS[columnaDestino]}</span>
        </p>

        <div className="mt-4 space-y-3">
          <label className="block text-sm text-neutral-600">
            Canal
            <select
              value={canal}
              onChange={(e) => setCanal(e.target.value as CanalContacto)}
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {CANALES_CONTACTO.map((c) => (
                <option key={c} value={c}>
                  {CANAL_LABELS[c]}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-neutral-600">
            Agrónomo
            <select
              value={agronomoId}
              onChange={(e) => setAgronomoId(e.target.value)}
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Sin asignar</option>
              {agronomos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-neutral-600">
            Próximo seguimiento (opcional)
            <input
              type="date"
              value={proximo}
              onChange={(e) => setProximo(e.target.value)}
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </label>

          <label className="block text-sm text-neutral-600">
            Notas (opcional)
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={2}
              placeholder="Detalle de la conversación..."
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </label>
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-100">
            Cancelar
          </button>
          <button
            onClick={guardar}
            disabled={loading}
            className="rounded bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
