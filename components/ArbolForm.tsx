"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { Parcela } from "@/lib/types";

export function ArbolForm({ parcelas, parcelaIdPredeterminada }: { parcelas: Parcela[]; parcelaIdPredeterminada?: number }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    const res = await fetch("/api/arboles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parcela_id: data.get("parcela_id"),
        codigo: data.get("codigo"),
        variedad: data.get("variedad") || undefined,
      }),
    });
    setLoading(false);
    if (res.ok) {
      form.reset();
      router.refresh();
    } else {
      setError("No se pudo crear el árbol. Revisa los datos.");
    }
  }

  if (parcelas.length === 0) {
    return <p className="text-neutral-500">Crea primero una parcela para poder agregar árboles.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-neutral-200 bg-white p-4 space-y-3">
      <h2 className="font-medium">Nuevo árbol</h2>
      <div className="grid sm:grid-cols-3 gap-3">
        <select
          name="parcela_id"
          required
          defaultValue={parcelaIdPredeterminada ?? ""}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="" disabled>
            Selecciona parcela
          </option>
          {parcelas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
        <input name="codigo" placeholder="Código del árbol" required className="border rounded px-3 py-2 text-sm" />
        <input name="variedad" placeholder="Variedad (opcional)" className="border rounded px-3 py-2 text-sm" />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-emerald-700 hover:bg-emerald-800 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Agregar árbol"}
      </button>
    </form>
  );
}
