"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function AgronomoForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    const res = await fetch("/api/agronomos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: data.get("nombre"),
        email: data.get("email") || undefined,
        telefono: data.get("telefono") || undefined,
      }),
    });
    setLoading(false);
    if (res.ok) {
      form.reset();
      router.refresh();
    } else {
      setError("No se pudo agregar al agrónomo.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-neutral-200 bg-white p-4 space-y-3">
      <h2 className="font-medium">Nuevo agrónomo</h2>
      <div className="grid sm:grid-cols-3 gap-3">
        <input name="nombre" placeholder="Nombre" required className="border rounded px-3 py-2 text-sm" />
        <input name="email" type="email" placeholder="Mail (opcional)" className="border rounded px-3 py-2 text-sm" />
        <input name="telefono" placeholder="Teléfono (opcional)" className="border rounded px-3 py-2 text-sm" />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button type="submit" disabled={loading} className="bg-neutral-900 text-white rounded px-4 py-2 text-sm disabled:opacity-50">
        {loading ? "Guardando..." : "Agregar agrónomo"}
      </button>
    </form>
  );
}
