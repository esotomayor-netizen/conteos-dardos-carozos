"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CANALES_CONTACTO, CANAL_LABELS, ESTADOS_SEGUIMIENTO, ESTADO_LABELS, type Agronomo } from "@/lib/types";

export function SeguimientoForm({ productorId, agronomos }: { productorId: number; agronomos: Agronomo[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    const res = await fetch("/api/seguimientos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productor_id: productorId,
        agronomo_id: data.get("agronomo_id") || undefined,
        canal: data.get("canal"),
        estado: data.get("estado"),
        fecha: data.get("fecha") || undefined,
        proximo_seguimiento: data.get("proximo_seguimiento") || undefined,
        notas: data.get("notas") || undefined,
      }),
    });
    setLoading(false);
    if (res.ok) {
      form.reset();
      router.refresh();
    } else {
      setError("No se pudo registrar el contacto. Revisa los datos.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-neutral-200 bg-white p-4 space-y-3">
      <h2 className="font-medium">Registrar contacto</h2>
      <div className="grid sm:grid-cols-3 gap-3">
        <select name="agronomo_id" className="border rounded px-3 py-2 text-sm" defaultValue="">
          <option value="">Agrónomo...</option>
          {agronomos.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre}
            </option>
          ))}
        </select>
        <select name="canal" required className="border rounded px-3 py-2 text-sm" defaultValue="telefono">
          {CANALES_CONTACTO.map((c) => (
            <option key={c} value={c}>
              {CANAL_LABELS[c]}
            </option>
          ))}
        </select>
        <select name="estado" required className="border rounded px-3 py-2 text-sm" defaultValue="contactado">
          {ESTADOS_SEGUIMIENTO.map((e) => (
            <option key={e} value={e}>
              {ESTADO_LABELS[e]}
            </option>
          ))}
        </select>
        <label className="text-xs text-neutral-500 flex flex-col gap-1">
          Fecha del contacto
          <input name="fecha" type="date" className="border rounded px-3 py-2 text-sm" />
        </label>
        <label className="text-xs text-neutral-500 flex flex-col gap-1">
          Próximo seguimiento
          <input name="proximo_seguimiento" type="date" className="border rounded px-3 py-2 text-sm" />
        </label>
        <textarea
          name="notas"
          placeholder="Notas de la conversación..."
          className="border rounded px-3 py-2 text-sm sm:col-span-3"
          rows={2}
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button type="submit" disabled={loading} className="bg-emerald-700 hover:bg-emerald-800 text-white rounded px-4 py-2 text-sm disabled:opacity-50">
        {loading ? "Guardando..." : "Guardar contacto"}
      </button>
    </form>
  );
}
