"use client";

import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { SEQUENTIAL_BLUE, INK } from "@/lib/chart-colors";

const PERIODOS = [
  { dias: 7, label: "7 días" },
  { dias: 30, label: "30 días" },
  { dias: 90, label: "90 días" },
] as const;

function formatFechaCorta(fecha: string) {
  const [, m, d] = fecha.split("-");
  return `${d}/${m}`;
}

function TooltipContenido({ active, payload }: { active?: boolean; payload?: { value: number; payload: { fecha: string } }[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0];
  return (
    <div className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-neutral-800">{formatFechaCorta(p.payload.fecha)}</p>
      <p className="text-neutral-500">
        {p.value} {p.value === 1 ? "contacto" : "contactos"}
      </p>
    </div>
  );
}

export function TrendChart({ data }: { data: { fecha: string; total: number }[] }) {
  const [dias, setDias] = useState<number>(30);
  const datos = data.slice(-dias);
  const totalPeriodo = datos.reduce((sum, d) => sum + d.total, 0);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          <span className="font-semibold text-neutral-800">{totalPeriodo}</span> contactos en los últimos {dias} días
        </p>
        <div className="flex gap-1 rounded-full bg-neutral-100 p-1">
          {PERIODOS.map((p) => (
            <button
              key={p.dias}
              onClick={() => setDias(p.dias)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                dias === p.dias ? "bg-white text-emerald-800 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={datos} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="tendenciaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={SEQUENTIAL_BLUE} stopOpacity={0.28} />
              <stop offset="100%" stopColor={SEQUENTIAL_BLUE} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={INK.grid} />
          <XAxis
            dataKey="fecha"
            tickFormatter={formatFechaCorta}
            tick={{ fontSize: 11, fill: INK.muted }}
            axisLine={{ stroke: INK.grid }}
            tickLine={false}
            interval={dias > 30 ? Math.floor(dias / 10) : "preserveStartEnd"}
            minTickGap={24}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: INK.muted }} axisLine={false} tickLine={false} width={28} />
          <Tooltip content={<TooltipContenido />} />
          <Area
            type="monotone"
            dataKey="total"
            stroke={SEQUENTIAL_BLUE}
            strokeWidth={2}
            fill="url(#tendenciaFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
