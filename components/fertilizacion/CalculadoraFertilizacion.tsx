"use client";

import { useMemo, useState } from "react";
import {
  CONSTANTES_FERTILIZACION,
  PARCIALIZACION_N,
  calcularNitrogeno,
  calcularPotasio,
  type EstacionVariedad,
} from "@/lib/fertilizacion";

function numberOrZero(value: string): number {
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function fmt(value: number): string {
  return value.toLocaleString("es-CL", { maximumFractionDigits: 1 });
}

const inputClass = "border rounded px-3 py-2 text-sm w-full";
const labelClass = "block text-xs font-medium text-neutral-600 mb-1";

export function CalculadoraFertilizacion() {
  // Datos generales
  const [produccionTonHa, setProduccionTonHa] = useState("20");
  const [variedad, setVariedad] = useState<EstacionVariedad>("temprana");

  // Nitrógeno
  const [nAplicadoPrecosecha, setNAplicadoPrecosecha] = useState("");
  const [nResidualSuelo, setNResidualSuelo] = useState("");
  const [nAgua, setNAgua] = useState("");
  const [nMineral, setNMineral] = useState("");
  const [eficienciaN, setEficienciaN] = useState("50");

  // Potasio
  const [kAplicadoPrecosecha, setKAplicadoPrecosecha] = useState("");
  const [kSueloPpm, setKSueloPpm] = useState("");
  const [ceSuelo, setCeSuelo] = useState("");
  const [eficienciaK, setEficienciaK] = useState("100");

  const produccion = numberOrZero(produccionTonHa);

  const resultadoN = useMemo(
    () =>
      calcularNitrogeno({
        produccionTonHa: produccion,
        nAplicadoPrecosechaKgHa: numberOrZero(nAplicadoPrecosecha),
        nResidualSueloMgKg: numberOrZero(nResidualSuelo),
        nAguaKgHa: numberOrZero(nAgua),
        nMineralKgHa: numberOrZero(nMineral),
        eficiencia: numberOrZero(eficienciaN) / 100,
      }),
    [produccion, nAplicadoPrecosecha, nResidualSuelo, nAgua, nMineral, eficienciaN]
  );

  const resultadoK = useMemo(
    () =>
      calcularPotasio({
        produccionTonHa: produccion,
        kSueloPpm: numberOrZero(kSueloPpm),
        kAplicadoPrecosechaKgHa: numberOrZero(kAplicadoPrecosecha),
        ceSueloDsM: ceSuelo.trim() === "" ? null : numberOrZero(ceSuelo),
        eficiencia: numberOrZero(eficienciaK) / 100,
      }),
    [produccion, kSueloPpm, kAplicadoPrecosecha, ceSuelo, eficienciaK]
  );

  const parcializacion = PARCIALIZACION_N[variedad];

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="font-medium text-neutral-800 mb-4">Datos generales del cuartel</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Producción real (Ton/ha)</label>
            <input
              type="number"
              inputMode="decimal"
              className={inputClass}
              value={produccionTonHa}
              onChange={(e) => setProduccionTonHa(e.target.value)}
              min={0}
              step="0.1"
            />
          </div>
          <div>
            <label className={labelClass}>Variedad (estación de cosecha)</label>
            <select className={inputClass} value={variedad} onChange={(e) => setVariedad(e.target.value as EstacionVariedad)}>
              <option value="temprana">Temprana — {PARCIALIZACION_N.temprana.variedades}</option>
              <option value="media-tardia">Media-tardía — {PARCIALIZACION_N["media-tardia"].variedades}</option>
            </select>
            <p className="mt-1 text-xs text-neutral-500">
              Referencia de N: {parcializacion.precosecha}% precosecha / {parcializacion.poscosecha}% poscosecha.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* NITRÓGENO */}
        <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
          <h2 className="font-medium text-neutral-800">Nitrógeno (N)</h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>N aplicado en precosecha (Kg N/ha)</label>
              <input type="number" inputMode="decimal" className={inputClass} value={nAplicadoPrecosecha} onChange={(e) => setNAplicadoPrecosecha(e.target.value)} min={0} />
            </div>
            <div>
              <label className={labelClass}>N residual del suelo (mg/Kg)</label>
              <input type="number" inputMode="decimal" className={inputClass} value={nResidualSuelo} onChange={(e) => setNResidualSuelo(e.target.value)} min={0} />
            </div>
            <div>
              <label className={labelClass}>N aportado por agua de riego (Kg N/ha)</label>
              <input type="number" inputMode="decimal" className={inputClass} value={nAgua} onChange={(e) => setNAgua(e.target.value)} min={0} />
            </div>
            <div>
              <label className={labelClass}>N mineral aportado (Kg N/ha)</label>
              <input type="number" inputMode="decimal" className={inputClass} value={nMineral} onChange={(e) => setNMineral(e.target.value)} min={0} />
            </div>
            <div>
              <label className={labelClass}>Eficiencia de fertilización (%)</label>
              <input type="number" inputMode="decimal" className={inputClass} value={eficienciaN} onChange={(e) => setEficienciaN(e.target.value)} min={1} max={100} />
            </div>
          </div>

          <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-4 space-y-1.5 text-sm">
            <ResultRow label="Demanda de N total" value={`${fmt(resultadoN.demandaTotalKgHa)} Kg N/ha`} />
            <ResultRow label="Suministro (N residual + agua + mineral)" value={`${fmt(resultadoN.suministroKgHa)} Kg N/ha`} />
            <ResultRow label="Dosis de N poscosecha (neta)" value={`${fmt(resultadoN.dosisPoscosechaNetaKgHa)} Kg N/ha`} />
            <div className="border-t border-emerald-200 my-1.5" />
            <ResultRow label="Dosis final de N (ajustada por eficiencia)" value={`${fmt(resultadoN.dosisFinalKgHa)} Kg N/ha`} strong />
            <ResultRow label="Equivalente en Urea (46-0-0)" value={`${fmt(resultadoN.dosisUreaKgHa)} Kg urea/ha`} strong />
            <ResultRow label="Novatec One (inhibidor de nitrificación)" value={`${fmt(resultadoN.novatecCcHa)} cc/ha`} />
          </div>
        </section>

        {/* POTASIO */}
        <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
          <h2 className="font-medium text-neutral-800">Potasio (K₂O)</h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>K en suelo (ppm)</label>
              <input type="number" inputMode="decimal" className={inputClass} value={kSueloPpm} onChange={(e) => setKSueloPpm(e.target.value)} min={0} />
            </div>
            <div>
              <label className={labelClass}>K₂O aplicado en precosecha (Kg/ha)</label>
              <input type="number" inputMode="decimal" className={inputClass} value={kAplicadoPrecosecha} onChange={(e) => setKAplicadoPrecosecha(e.target.value)} min={0} />
            </div>
            <div>
              <label className={labelClass}>CE del suelo (dS/m) — opcional</label>
              <input type="number" inputMode="decimal" className={inputClass} value={ceSuelo} onChange={(e) => setCeSuelo(e.target.value)} min={0} />
            </div>
            <div>
              <label className={labelClass}>Eficiencia de fertilización (%)</label>
              <input type="number" inputMode="decimal" className={inputClass} value={eficienciaK} onChange={(e) => setEficienciaK(e.target.value)} min={1} max={100} />
            </div>
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-100 p-4 space-y-1.5 text-sm">
            <ResultRow label="Estrategia según análisis de suelo" value={<EstrategiaBadge estrategia={resultadoK.estrategia} />} />
            <ResultRow
              label={resultadoK.estrategia === "demanda" ? "Demanda de K₂O total" : "Extracción de K₂O total"}
              value={`${fmt(resultadoK.baseKgHa)} Kg K₂O/ha`}
            />
            <div className="border-t border-amber-200 my-1.5" />
            <ResultRow label="Dosis final de K₂O (ajustada por eficiencia)" value={`${fmt(resultadoK.dosisFinalKgHa)} Kg K₂O/ha`} strong />
            <ResultRow
              label="Fuente recomendada (según CE del suelo)"
              value={
                resultadoK.fuenteRecomendada === "K2SO4"
                  ? "Aquamix 5K (K₂SO₄)"
                  : resultadoK.fuenteRecomendada === "KCl"
                    ? "Aquamix Full K (KCl)"
                    : "Ingresa la CE del suelo"
              }
            />
          </div>
        </section>
      </div>

      <p className="text-xs text-neutral-400">
        Fórmulas según &ldquo;Estrategia de Fertilización de Poscosecha&rdquo; (Garcés Fruit, Gerencia Agrícola, feb. 2019). Constantes:
        demanda N {CONSTANTES_FERTILIZACION.DEMANDA_N_POR_TON} Kg/ton, demanda K₂O {CONSTANTES_FERTILIZACION.DEMANDA_K2O_POR_TON} Kg/ton,
        extracción K₂O {CONSTANTES_FERTILIZACION.EXTRACCION_K2O_POR_TON} Kg/ton, urea al {CONSTANTES_FERTILIZACION.PUREZA_UREA * 100}%. El
        rango 325-350 ppm de K en suelo no está definido en el documento original; aquí se trata como &ldquo;extracción&rdquo; hasta el
        corte de 350 ppm.
      </p>
    </div>
  );
}

function ResultRow({ label, value, strong }: { label: string; value: React.ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-neutral-600">{label}</span>
      <span className={strong ? "font-semibold text-neutral-900 tabular-nums" : "text-neutral-800 tabular-nums"}>{value}</span>
    </div>
  );
}

function EstrategiaBadge({ estrategia }: { estrategia: "demanda" | "extraccion" | "sin_aplicacion" }) {
  const label = estrategia === "demanda" ? "Demanda (K < 250 ppm)" : estrategia === "extraccion" ? "Extracción (250-349 ppm)" : "Sin aplicación (≥ 350 ppm)";
  const tone = estrategia === "sin_aplicacion" ? "bg-neutral-200 text-neutral-600" : "bg-amber-200 text-amber-800";
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>{label}</span>;
}
