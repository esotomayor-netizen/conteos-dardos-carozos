"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { Agronomo } from "@/lib/types";

export function ProductorForm({ agronomos }: { agronomos: Agronomo[] }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    const res = await fetch("/api/productores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razon_social: data.get("razon_social"),
        codigo_sag: data.get("codigo_sag") || undefined,
        dueno_nombre: data.get("dueno_nombre") || undefined,
        dueno_telefono: data.get("dueno_telefono") || undefined,
        dueno_email: data.get("dueno_email") || undefined,
        comuna: data.get("comuna") || undefined,
        provincia: data.get("provincia") || undefined,
        region: data.get("region") || undefined,
        direccion: data.get("direccion") || undefined,
        agronomo_id: data.get("agronomo_id") || undefined,
      }),
    });
    setLoading(false);
    if (res.ok) {
      form.reset();
      setAbierto(false);
      router.refresh();
    } else {
      setError("No se pudo crear el productor. Revisa los datos.");
    }
  }

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        className="bg-neutral-900 text-white rounded px-4 py-2 text-sm"
      >
        + Nuevo productor
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-neutral-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">Nuevo productor</h2>
        <button type="button" onClick={() => setAbierto(false)} className="text-sm text-neutral-500 hover:underline">
          Cancelar
        </button>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <input name="razon_social" placeholder="Razón social *" required className="border rounded px-3 py-2 text-sm" />
        <input name="codigo_sag" placeholder="Código SAG" className="border rounded px-3 py-2 text-sm" />
        <select name="agronomo_id" className="border rounded px-3 py-2 text-sm">
          <option value="">Sin asignar</option>
          {agronomos.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre}
            </option>
          ))}
        </select>
        <input name="dueno_nombre" placeholder="Dueño" className="border rounded px-3 py-2 text-sm" />
        <input name="dueno_telefono" placeholder="Teléfono" className="border rounded px-3 py-2 text-sm" />
        <input name="dueno_email" type="email" placeholder="Mail" className="border rounded px-3 py-2 text-sm" />
        <input name="region" placeholder="Región" className="border rounded px-3 py-2 text-sm" />
        <input name="provincia" placeholder="Provincia" className="border rounded px-3 py-2 text-sm" />
        <input name="comuna" placeholder="Comuna" className="border rounded px-3 py-2 text-sm" />
        <input name="direccion" placeholder="Dirección" className="border rounded px-3 py-2 text-sm sm:col-span-3" />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button type="submit" disabled={loading} className="bg-neutral-900 text-white rounded px-4 py-2 text-sm disabled:opacity-50">
        {loading ? "Guardando..." : "Crear productor"}
      </button>
    </form>
  );
}
