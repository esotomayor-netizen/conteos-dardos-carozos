"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Phone, Mail, UserX } from "lucide-react";
import { ORDEN_MOTIVO, type MotivoSugerencia, type PropuestaSugerencias, type SugerenciaContacto } from "@/lib/sugerencias";

const MOTIVO_INFO: Record<MotivoSugerencia, { label: string; badge: string }> = {
  vencido: { label: "Seguimiento vencido", badge: "bg-red-100 text-red-700" },
  sin_seguimiento_agendado: { label: "Sin próxima fecha agendada", badge: "bg-amber-100 text-amber-700" },
  sin_contactar: { label: "Nunca contactado", badge: "bg-blue-100 text-blue-700" },
};

const LIMITE_POR_AGRONOMO = 15;

function kilosRelevantes(s: SugerenciaContacto, especie: string | null): number {
  return especie ? (s.kilosPorEspecie[especie] ?? 0) : s.kilos;
}

export function PropuestaClient({ propuesta }: { propuesta: PropuestaSugerencias }) {
  const [especie, setEspecie] = useState<string | null>(null);

  const porAgronomoFiltrado = useMemo(() => {
    return propuesta.porAgronomo.map(({ agronomo, sugerencias }) => {
      const filtradas = especie ? sugerencias.filter((s) => (s.kilosPorEspecie[especie] ?? 0) > 0) : sugerencias;
      const ordenadas = [...filtradas].sort(
        (a, b) => ORDEN_MOTIVO[a.motivo] - ORDEN_MOTIVO[b.motivo] || kilosRelevantes(b, especie) - kilosRelevantes(a, especie)
      );
      const kilosEnJuego = ordenadas.reduce((sum, s) => sum + kilosRelevantes(s, especie), 0);
      return { agronomo, sugerencias: ordenadas, kilosEnJuego };
    });
  }, [propuesta.porAgronomo, especie]);

  const sinAgronomosFiltrado = especie
    ? propuesta.sinAgronomosDisponibles.filter((s) => (s.kilosPorEspecie[especie] ?? 0) > 0)
    : propuesta.sinAgronomosDisponibles;

  return (
    <div className="space-y-6">
      {propuesta.especiesDisponibles.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setEspecie(null)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              especie == null
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300 hover:text-emerald-700"
            }`}
          >
            Todas las especies
          </button>
          {propuesta.especiesDisponibles.map((e) => (
            <button
              key={e}
              onClick={() => setEspecie(e)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                especie === e
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300 hover:text-emerald-700"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {porAgronomoFiltrado.map(({ agronomo, sugerencias, kilosEnJuego }) => (
          <div key={agronomo.id} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-neutral-800">{agronomo.nombre}</h2>
              <span className="text-xs text-neutral-500">
                {sugerencias.length} sugerencias · {kilosEnJuego.toLocaleString("es-CL")} kg
                {especie ? ` de ${especie}` : ""}
              </span>
            </div>

            {sugerencias.length === 0 ? (
              <p className="text-sm text-neutral-500">Sin pendientes por ahora.</p>
            ) : (
              <div className="divide-y divide-neutral-100">
                {sugerencias.slice(0, LIMITE_POR_AGRONOMO).map((s) => (
                  <Link
                    key={s.productorId}
                    href={`/productores/${s.productorId}`}
                    className="flex items-start justify-between gap-3 py-2.5 transition-colors hover:bg-neutral-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-neutral-800">{s.razonSocial}</p>
                      <p className="text-xs text-neutral-500">
                        {s.comuna ?? "Sin comuna"} · {kilosRelevantes(s, especie).toLocaleString("es-CL")} kg
                        {especie ? "" : s.especies.length > 0 ? ` · ${s.especies.slice(0, 2).join(", ")}` : ""}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-neutral-400">
                        {s.telefono && (
                          <span className="flex items-center gap-1">
                            <Phone size={11} /> {s.telefono}
                          </span>
                        )}
                        {s.email && (
                          <span className="flex items-center gap-1">
                            <Mail size={11} /> {s.email}
                          </span>
                        )}
                      </div>
                      {s.motivo === "vencido" && s.proximoSeguimientoVencido && (
                        <p className="mt-0.5 text-[11px] text-red-600">Prometido para el {s.proximoSeguimientoVencido}</p>
                      )}
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${MOTIVO_INFO[s.motivo].badge}`}>
                      {MOTIVO_INFO[s.motivo].label}
                    </span>
                  </Link>
                ))}
                {sugerencias.length > LIMITE_POR_AGRONOMO && (
                  <p className="pt-2 text-center text-xs text-neutral-400">
                    +{sugerencias.length - LIMITE_POR_AGRONOMO} más — revisa{" "}
                    <Link href="/productores" className="underline">
                      el listado completo
                    </Link>
                    .
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {sinAgronomosFiltrado.length > 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <UserX size={16} className="text-neutral-400" />
            <h2 className="font-medium text-neutral-800">Sin agrónomos registrados para asignar</h2>
          </div>
          <p className="text-sm text-neutral-500">{sinAgronomosFiltrado.length} productores en espera.</p>
        </div>
      )}
    </div>
  );
}
