"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { TIPOS_ESTRUCTURA } from "@/lib/types";

type RamaOption = { id: number; codigo: string; arbol_codigo: string; parcela_nombre: string };

export function ConteoForm({ ramas, ramaIdPredeterminada }: { ramas: RamaOption[]; ramaIdPredeterminada?: number }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    const res = await fetch("/api/conteos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rama_id: data.get("rama_id"),
        tipo_estructura: data.get("tipo_estructura"),
        cantidad: data.get("cantidad"),
        fecha: data.get("fecha") || undefined,
        notas: data.get("notas") || undefined,
      }),
    });
    setLoading(false);
    if (res.ok) {
      form.reset();
      router.refresh();
    } else {
      setError("No se pudo registrar el conteo. Revisa los datos.");
    }
  }

  if (ramas.length === 0) {
    return <p className="text-neutral-500">Crea primero una rama para poder registrar conteos.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-neutral-200 bg-white p-4 space-y-3">
      <h2 className="font-medium">Nuevo conteo</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <select
          name="rama_id"
          required
          defaultValue={ramaIdPredeterminada ?? ""}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="" disabled>
            Selecciona rama
          </option>
          {ramas.map((r) => (
            <option key={r.id} value={r.id}>
              {r.parcela_nombre} / {r.arbol_codigo} / {r.codigo}
            </option>
          ))}
        </select>
        <select name="tipo_estructura" required defaultValue="" className="border rounded px-3 py-2 text-sm">
          <option value="" disabled>
            Tipo de estructura
          </option>
          {TIPOS_ESTRUCTURA.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
        <input name="cantidad" type="number" min={0} placeholder="Cantidad" required className="border rounded px-3 py-2 text-sm" />
        <input name="fecha" type="date" className="border rounded px-3 py-2 text-sm" />
      </div>
      <input name="notas" placeholder="Notas (opcional)" className="border rounded px-3 py-2 text-sm w-full" />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-neutral-900 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Registrar conteo"}
      </button>
    </form>
  );
}
