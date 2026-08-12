"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";

export function ParcelaForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ubicacion, setUbicacion] = useState("");
  const [buscandoGps, setBuscandoGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function usarUbicacionGps() {
    if (!navigator.geolocation) {
      setGpsError("Tu navegador no soporta geolocalización.");
      return;
    }
    setGpsError(null);
    setBuscandoGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUbicacion(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        setBuscandoGps(false);
      },
      (err) => {
        setGpsError(
          err.code === err.PERMISSION_DENIED
            ? "Permiso de ubicación denegado. Habilítalo en tu navegador para usar el GPS."
            : "No se pudo obtener la ubicación GPS."
        );
        setBuscandoGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

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
      setUbicacion("");
      router.refresh();
    } else {
      setError("No se pudo crear la parcela. Revisa los datos.");
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="rounded-lg border border-neutral-200 bg-white p-4 space-y-3">
      <h2 className="font-medium">Nueva parcela</h2>
      <div className="grid sm:grid-cols-3 gap-3">
        <input name="nombre" placeholder="Nombre" required className="border rounded px-3 py-2 text-sm" />
        <div className="flex gap-2">
          <input
            name="ubicacion"
            placeholder="Ubicación (lat, lng)"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            className="border rounded px-3 py-2 text-sm flex-1"
          />
          <button
            type="button"
            onClick={usarUbicacionGps}
            disabled={buscandoGps}
            title="Usar mi ubicación GPS"
            className="border rounded px-3 py-2 text-sm disabled:opacity-50"
          >
            {buscandoGps ? "..." : "📍"}
          </button>
        </div>
        <input name="especie" placeholder="Especie (opcional)" className="border rounded px-3 py-2 text-sm" />
      </div>
      {gpsError && <p className="text-amber-600 text-sm">{gpsError}</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-emerald-700 hover:bg-emerald-800 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Agregar parcela"}
      </button>
    </form>
  );
}
