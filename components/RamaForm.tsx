"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type ArbolOption = { id: number; codigo: string; parcela_nombre: string };

export function RamaForm({ arboles, arbolIdPredeterminado }: { arboles: ArbolOption[]; arbolIdPredeterminado?: number }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    const res = await fetch("/api/ramas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        arbol_id: data.get("arbol_id"),
        codigo: data.get("codigo"),
        longitud_cm: data.get("longitud_cm") || undefined,
      }),
    });
    setLoading(false);
    if (res.ok) {
      form.reset();
      router.refresh();
    } else {
      setError("No se pudo crear la rama. Revisa los datos.");
    }
  }

  if (arboles.length === 0) {
    return <p className="text-neutral-500">Crea primero un árbol para poder agregar ramas.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-neutral-200 bg-white p-4 space-y-3">
      <h2 className="font-medium">Nueva rama</h2>
      <div className="grid sm:grid-cols-3 gap-3">
        <select
          name="arbol_id"
          required
          defaultValue={arbolIdPredeterminado ?? ""}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="" disabled>
            Selecciona árbol
          </option>
          {arboles.map((a) => (
            <option key={a.id} value={a.id}>
              {a.parcela_nombre} / {a.codigo}
            </option>
          ))}
        </select>
        <input name="codigo" placeholder="Código de la rama" required className="border rounded px-3 py-2 text-sm" />
        <input
          name="longitud_cm"
          type="number"
          step="0.1"
          placeholder="Longitud cm (opcional)"
          className="border rounded px-3 py-2 text-sm"
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-emerald-700 hover:bg-emerald-800 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Agregar rama"}
      </button>
    </form>
  );
}
