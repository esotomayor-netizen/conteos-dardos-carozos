"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";

export function PredioForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    const res = await fetch("/api/predios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre_propietario: data.get("nombre_propietario"),
        rut: data.get("rut") || undefined,
        rol: data.get("rol") || undefined,
        region: data.get("region"),
        comuna: data.get("comuna") || undefined,
        direccion: data.get("direccion") || undefined,
        lat: data.get("lat") || undefined,
        lng: data.get("lng") || undefined,
        especie: data.get("especie"),
        variedad: data.get("variedad") || undefined,
        hectareas_aprox: data.get("hectareas_aprox") || undefined,
        ha_total_predio: data.get("ha_total_predio") || undefined,
        telefono: data.get("telefono") || undefined,
        email: data.get("email") || undefined,
        fuente: data.get("fuente") || undefined,
        notas: data.get("notas") || undefined,
      }),
    });
    setLoading(false);
    if (res.ok) {
      form.reset();
      router.refresh();
    } else {
      setError("No se pudo guardar el predio. Revisa los datos.");
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="rounded-lg border border-neutral-200 bg-white p-4 space-y-3">
      <h2 className="font-medium">Nuevo predio de prospección</h2>
      <div className="grid sm:grid-cols-3 gap-3">
        <input name="nombre_propietario" placeholder="Nombre propietario" required className="border rounded px-3 py-2 text-sm" />
        <input name="rut" placeholder="RUT (opcional)" className="border rounded px-3 py-2 text-sm" />
        <input name="rol" placeholder="Rol de avalúo (opcional)" className="border rounded px-3 py-2 text-sm" />
        <input name="region" placeholder="Región" required className="border rounded px-3 py-2 text-sm" />
        <input name="comuna" placeholder="Comuna (opcional)" className="border rounded px-3 py-2 text-sm" />
        <input name="direccion" placeholder="Predio / dirección (opcional)" className="border rounded px-3 py-2 text-sm" />
        <input name="lat" placeholder="Latitud (opcional)" className="border rounded px-3 py-2 text-sm" />
        <input name="lng" placeholder="Longitud (opcional)" className="border rounded px-3 py-2 text-sm" />
        <input name="especie" placeholder="Especie" required className="border rounded px-3 py-2 text-sm" />
        <input name="variedad" placeholder="Variedad (opcional)" className="border rounded px-3 py-2 text-sm" />
        <input name="hectareas_aprox" placeholder="Hectáreas de la especie" className="border rounded px-3 py-2 text-sm" />
        <input name="ha_total_predio" placeholder="Hectáreas totales del predio" className="border rounded px-3 py-2 text-sm" />
        <input name="telefono" placeholder="Teléfono (opcional)" className="border rounded px-3 py-2 text-sm" />
        <input name="email" placeholder="Email (opcional)" type="email" className="border rounded px-3 py-2 text-sm" />
        <input name="fuente" placeholder="Fuente del dato" className="border rounded px-3 py-2 text-sm" />
      </div>
      <textarea name="notas" placeholder="Notas (opcional)" className="border rounded px-3 py-2 text-sm w-full" rows={2} />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-neutral-900 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Agregar predio"}
      </button>
    </form>
  );
}
