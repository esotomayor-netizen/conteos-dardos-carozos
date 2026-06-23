"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { TIPOS_ESTRUCTURA } from "@/lib/types";

type RamaOption = { id: number; codigo: string; arbol_codigo: string; parcela_nombre: string };

type Resultado = { cantidad: number; confianza: string; comentario: string };

function fileToBase64(file: File): Promise<{ data: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const [header, data] = result.split(",");
      const mediaType = header.match(/data:(.*);base64/)?.[1] ?? "image/jpeg";
      resolve({ data, mediaType });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ConteoFotoForm({ ramas, ramaIdPredeterminada }: { ramas: RamaOption[]; ramaIdPredeterminada?: number }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imagenB64, setImagenB64] = useState<{ data: string; mediaType: string } | null>(null);
  const [tipoEstructura, setTipoEstructura] = useState<string>("dardo");
  const [ramaId, setRamaId] = useState<string>(ramaIdPredeterminada ? String(ramaIdPredeterminada) : "");
  const [analizando, setAnalizando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [cantidadEditada, setCantidadEditada] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setResultado(null);
    setPreview(URL.createObjectURL(file));
    const { data, mediaType } = await fileToBase64(file);
    setImagenB64({ data, mediaType });
  }

  async function analizarFoto() {
    if (!imagenB64) {
      setError("Selecciona o toma una foto primero.");
      return;
    }
    setError(null);
    setAnalizando(true);
    setResultado(null);
    const res = await fetch("/api/conteos/analizar-foto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imagen_base64: imagenB64.data,
        media_type: imagenB64.mediaType,
        tipo_estructura: tipoEstructura,
      }),
    });
    setAnalizando(false);
    if (res.ok) {
      const data: Resultado = await res.json();
      setResultado(data);
      setCantidadEditada(String(data.cantidad));
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ? String(data.error) : "No se pudo analizar la foto.");
    }
  }

  async function handleGuardar(event: FormEvent) {
    event.preventDefault();
    if (!ramaId) {
      setError("Selecciona una rama.");
      return;
    }
    const cantidad = Number(cantidadEditada);
    if (!Number.isFinite(cantidad) || cantidad < 0) {
      setError("Cantidad inválida.");
      return;
    }
    setError(null);
    setGuardando(true);
    const res = await fetch("/api/conteos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rama_id: ramaId,
        tipo_estructura: tipoEstructura,
        cantidad,
        notas: resultado ? `IA (${resultado.confianza}): ${resultado.comentario}` : "Conteo asistido por foto",
      }),
    });
    setGuardando(false);
    if (res.ok) {
      setPreview(null);
      setImagenB64(null);
      setResultado(null);
      setCantidadEditada("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.refresh();
    } else {
      setError("No se pudo guardar el conteo.");
    }
  }

  if (ramas.length === 0) {
    return <p className="text-neutral-500">Crea primero una rama para poder usar el conteo por foto.</p>;
  }

  return (
    <form onSubmit={handleGuardar} className="rounded-lg border border-neutral-200 bg-white p-4 space-y-3">
      <h2 className="font-medium">Conteo automático por foto</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <select value={ramaId} onChange={(e) => setRamaId(e.target.value)} required className="border rounded px-3 py-2 text-sm">
          <option value="" disabled>
            Selecciona rama
          </option>
          {ramas.map((r) => (
            <option key={r.id} value={r.id}>
              {r.parcela_nombre} / {r.arbol_codigo} / {r.codigo}
            </option>
          ))}
        </select>
        <select
          value={tipoEstructura}
          onChange={(e) => setTipoEstructura(e.target.value)}
          required
          className="border rounded px-3 py-2 text-sm"
        >
          {TIPOS_ESTRUCTURA.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="border rounded px-3 py-2 text-sm"
        />
      </div>

      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Vista previa" className="max-h-64 rounded border border-neutral-200" />
      )}

      <button
        type="button"
        onClick={analizarFoto}
        disabled={!imagenB64 || analizando}
        className="border rounded px-4 py-2 text-sm disabled:opacity-50"
      >
        {analizando ? "Analizando..." : "Analizar foto con IA"}
      </button>

      {resultado && (
        <div className="rounded border border-neutral-200 bg-neutral-50 p-3 text-sm space-y-2">
          <p>
            Estimación de la IA: <strong>{resultado.cantidad}</strong> {tipoEstructura}(s) · confianza {resultado.confianza}
          </p>
          <p className="text-neutral-600">{resultado.comentario}</p>
          <label className="block">
            Cantidad a guardar (puedes corregirla):
            <input
              type="number"
              min={0}
              value={cantidadEditada}
              onChange={(e) => setCantidadEditada(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-full mt-1"
            />
          </label>
        </div>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={guardando || !resultado}
        className="bg-neutral-900 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
      >
        {guardando ? "Guardando..." : "Guardar conteo"}
      </button>
    </form>
  );
}
