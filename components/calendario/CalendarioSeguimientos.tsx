"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { EstadoBadge } from "@/components/EstadoBadge";
import { CANAL_LABELS, type CanalContacto, type EstadoSeguimiento } from "@/lib/types";
import type { AgronomoRaw } from "@/lib/dashboard-metrics";

export type SeguimientoCalendario = {
  id: number;
  productor_id: number;
  razon_social: string;
  comuna: string | null;
  agronomo_id: number | null;
  agronomo_nombre: string | null;
  canal: CanalContacto;
  estado: EstadoSeguimiento;
  fecha: string;
  proximo_seguimiento: string | null;
  notas: string | null;
  esUltimo: boolean;
};

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const ESTADOS_FINALES: EstadoSeguimiento[] = ["cerrado_ganado", "cerrado_perdido"];

function toKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildMonthGrid(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1);
  const gridStart = new Date(year, month, 1 - firstOfMonth.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

type EventoDia = { tipo: "realizado" | "programado" | "vencido"; seguimiento: SeguimientoCalendario };

export function CalendarioSeguimientos({
  seguimientos,
  agronomos,
}: {
  seguimientos: SeguimientoCalendario[];
  agronomos: AgronomoRaw[];
}) {
  const hoy = useMemo(() => new Date(), []);
  const hoyKey = toKey(hoy);
  const [cursor, setCursor] = useState(() => new Date(hoy.getFullYear(), hoy.getMonth(), 1));
  const [agronomoId, setAgronomoId] = useState<number | null>(null);
  const [diaSeleccionado, setDiaSeleccionado] = useState<string>(hoyKey);

  const filtrados = agronomoId == null ? seguimientos : seguimientos.filter((s) => s.agronomo_id === agronomoId);

  const eventosPorDia = useMemo(() => {
    const map = new Map<string, EventoDia[]>();
    const push = (key: string, evento: EventoDia) => {
      const arr = map.get(key) ?? [];
      arr.push(evento);
      map.set(key, arr);
    };
    for (const s of filtrados) {
      push(s.fecha, { tipo: "realizado", seguimiento: s });
      if (s.proximo_seguimiento && s.esUltimo) {
        const vencido = s.proximo_seguimiento < hoyKey && !ESTADOS_FINALES.includes(s.estado);
        push(s.proximo_seguimiento, { tipo: vencido ? "vencido" : "programado", seguimiento: s });
      }
    }
    return map;
  }, [filtrados, hoyKey]);

  const grid = useMemo(() => buildMonthGrid(cursor.getFullYear(), cursor.getMonth()), [cursor]);

  const resumenMes = useMemo(() => {
    const prefijo = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    let realizados = 0;
    let programados = 0;
    let vencidos = 0;
    for (const [key, eventos] of eventosPorDia) {
      if (!key.startsWith(prefijo)) continue;
      for (const e of eventos) {
        if (e.tipo === "realizado") realizados++;
        else if (e.tipo === "programado") programados++;
        else vencidos++;
      }
    }
    return { realizados, programados, vencidos };
  }, [eventosPorDia, cursor]);

  const eventosDelDia = (eventosPorDia.get(diaSeleccionado) ?? []).sort((a, b) => a.seguimiento.id - b.seguimiento.id);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setAgronomoId(null)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              agronomoId == null
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300 hover:text-emerald-700"
            }`}
          >
            Todo el equipo
          </button>
          {agronomos.map((a) => (
            <button
              key={a.id}
              onClick={() => setAgronomoId(a.id)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                agronomoId === a.id
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300 hover:text-emerald-700"
              }`}
            >
              {a.nombre}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <CheckCircle2 size={13} className="text-emerald-600" /> {resumenMes.realizados} realizados este mes
          </span>
          <span className="flex items-center gap-1">
            <Clock size={13} className="text-amber-600" /> {resumenMes.programados} programados
          </span>
          {resumenMes.vencidos > 0 && (
            <span className="flex items-center gap-1 font-medium text-red-600">
              <AlertTriangle size={13} /> {resumenMes.vencidos} vencidos
            </span>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100"
              aria-label="Mes anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <p className="w-40 text-center text-base font-semibold text-neutral-800">
              {MESES[cursor.getMonth()]} {cursor.getFullYear()}
            </p>
            <button
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
              className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100"
              aria-label="Mes siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <button
            onClick={() => {
              setCursor(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
              setDiaSeleccionado(hoyKey);
            }}
            className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
          >
            Hoy
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-neutral-400">
          {DIAS_SEMANA.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {grid.map((date) => {
            const key = toKey(date);
            const enMes = date.getMonth() === cursor.getMonth();
            const eventos = eventosPorDia.get(key) ?? [];
            const realizados = eventos.filter((e) => e.tipo === "realizado").length;
            const programados = eventos.filter((e) => e.tipo === "programado").length;
            const vencidos = eventos.filter((e) => e.tipo === "vencido").length;
            const esHoy = key === hoyKey;
            const seleccionado = key === diaSeleccionado;

            return (
              <button
                key={key}
                onClick={() => setDiaSeleccionado(key)}
                className={`flex min-h-[64px] flex-col items-start rounded-lg border p-1.5 text-left transition-colors ${
                  seleccionado
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-transparent hover:bg-neutral-50"
                } ${!enMes ? "opacity-40" : ""}`}
              >
                <span
                  className={`mb-1 flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                    esHoy ? "bg-emerald-600 font-semibold text-white" : "text-neutral-600"
                  }`}
                >
                  {date.getDate()}
                </span>
                <div className="flex flex-wrap gap-0.5">
                  {realizados > 0 && (
                    <span className="rounded bg-emerald-100 px-1 text-[10px] font-medium text-emerald-700">
                      {realizados}
                    </span>
                  )}
                  {programados > 0 && (
                    <span className="rounded bg-amber-100 px-1 text-[10px] font-medium text-amber-700">
                      {programados}
                    </span>
                  )}
                  {vencidos > 0 && (
                    <span className="rounded bg-red-100 px-1 text-[10px] font-medium text-red-700">{vencidos}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex gap-4 text-[11px] text-neutral-400">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Contacto realizado
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> Próximo seguimiento
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500" /> Vencido
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-medium text-neutral-800">
          {new Date(`${diaSeleccionado}T00:00:00`).toLocaleDateString("es-CL", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </h2>
        {eventosDelDia.length === 0 ? (
          <p className="text-sm text-neutral-500">Sin actividad registrada para este día.</p>
        ) : (
          <div className="space-y-2">
            {eventosDelDia.map((e, i) => (
              <Link
                key={`${e.seguimiento.id}-${e.tipo}-${i}`}
                href={`/productores/${e.seguimiento.productor_id}`}
                className="flex items-start justify-between gap-3 rounded-lg border border-neutral-100 p-3 transition-colors hover:bg-neutral-50"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {e.tipo === "realizado" && <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />}
                    {e.tipo === "programado" && <Clock size={14} className="shrink-0 text-amber-600" />}
                    {e.tipo === "vencido" && <AlertTriangle size={14} className="shrink-0 text-red-600" />}
                    <p className="truncate text-sm font-medium text-neutral-800">{e.seguimiento.razon_social}</p>
                  </div>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {e.tipo === "realizado" ? "Contacto por " : "Próximo seguimiento — "}
                    {e.tipo === "realizado" ? CANAL_LABELS[e.seguimiento.canal] : "último contacto por " + CANAL_LABELS[e.seguimiento.canal]}
                    {e.seguimiento.agronomo_nombre ? ` · ${e.seguimiento.agronomo_nombre}` : " · Sin agrónomo asignado"}
                    {e.seguimiento.comuna ? ` · ${e.seguimiento.comuna}` : ""}
                  </p>
                  {e.seguimiento.notas && <p className="mt-1 text-xs text-neutral-600">{e.seguimiento.notas}</p>}
                </div>
                <EstadoBadge estado={e.seguimiento.estado} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
