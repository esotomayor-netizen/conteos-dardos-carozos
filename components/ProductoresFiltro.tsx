"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ESTADOS_SEGUIMIENTO, ESTADO_LABELS, type Agronomo } from "@/lib/types";

export function ProductoresFiltro({
  comunas,
  especies,
  agronomos,
  valores,
}: {
  comunas: string[];
  especies: string[];
  agronomos: Agronomo[];
  valores: { q?: string; comuna?: string; especie?: string; estado?: string; agronomo_id?: string };
}) {
  const router = useRouter();
  const [q, setQ] = useState(valores.q ?? "");

  function actualizar(next: Partial<typeof valores>) {
    const params = new URLSearchParams({ ...valores, ...next } as Record<string, string>);
    for (const [key, value] of [...params.entries()]) {
      if (!value) params.delete(key);
    }
    router.push(`/productores?${params.toString()}`);
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 flex flex-wrap gap-3 items-end">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          actualizar({ q });
        }}
        className="flex gap-2"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar razón social, dueño, comuna..."
          className="border rounded px-3 py-2 text-sm w-64"
        />
        <button type="submit" className="border rounded px-3 py-2 text-sm hover:bg-neutral-50">
          Buscar
        </button>
      </form>

      <select
        value={valores.comuna ?? ""}
        onChange={(e) => actualizar({ comuna: e.target.value })}
        className="border rounded px-3 py-2 text-sm"
      >
        <option value="">Todas las comunas</option>
        {comunas.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        value={valores.especie ?? ""}
        onChange={(e) => actualizar({ especie: e.target.value })}
        className="border rounded px-3 py-2 text-sm"
      >
        <option value="">Todas las especies</option>
        {especies.map((e) => (
          <option key={e} value={e}>
            {e}
          </option>
        ))}
      </select>

      <select
        value={valores.estado ?? ""}
        onChange={(e) => actualizar({ estado: e.target.value })}
        className="border rounded px-3 py-2 text-sm"
      >
        <option value="">Todos los estados</option>
        {ESTADOS_SEGUIMIENTO.map((e) => (
          <option key={e} value={e}>
            {ESTADO_LABELS[e]}
          </option>
        ))}
      </select>

      <select
        value={valores.agronomo_id ?? ""}
        onChange={(e) => actualizar({ agronomo_id: e.target.value })}
        className="border rounded px-3 py-2 text-sm"
      >
        <option value="">Todos los agrónomos</option>
        {agronomos.map((a) => (
          <option key={a.id} value={a.id}>
            {a.nombre}
          </option>
        ))}
      </select>

      {(valores.q || valores.comuna || valores.especie || valores.estado || valores.agronomo_id) && (
        <button
          onClick={() => {
            setQ("");
            router.push("/productores");
          }}
          className="text-sm text-neutral-500 hover:underline"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
