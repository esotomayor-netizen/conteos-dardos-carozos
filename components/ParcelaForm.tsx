"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function ParcelaForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    const res = await fetch("/api/parcelas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: data.get("nombre"),
        ubicacion: data.get("ubicacion") || undefined,
        especie: data.get("especie") || undefined,
      }),
    });
    setLoading(false);
    if (res.ok) {
      form.reset();
      router.refresh();
    } else {
      setError("No se pudo crear la parcela. Revisa los datos.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-neutral-200 bg-white p-4 space-y-3">
      <h2 className="font-medium">Nueva parcela</h2>
      <div className="grid sm:grid-cols-3 gap-3">
        <input name="nombre" placeholder="Nombre" required className="border rounded px-3 py-2 text-sm" />
        <input name="ubicacion" placeholder="Ubicación (opcional)" className="border rounded px-3 py-2 text-sm" />
        <input name="especie" placeholder="Especie (opcional)" className="border rounded px-3 py-2 text-sm" />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-neutral-900 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Agregar parcela"}
      </button>
    </form>
  );
}
