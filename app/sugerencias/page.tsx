import Link from "next/link";
import { Phone, Mail, AlertTriangle, Clock, UserX, Lightbulb } from "lucide-react";
import { getSql } from "@/lib/db";
import { generarPropuestaSugerencias, type MotivoSugerencia } from "@/lib/sugerencias";
import type { AgronomoRaw, CultivoRaw, ProductorRaw, SeguimientoRaw } from "@/lib/dashboard-metrics";

export const dynamic = "force-dynamic";

const MOTIVO_INFO: Record<MotivoSugerencia, { label: string; badge: string }> = {
  vencido: { label: "Seguimiento vencido", badge: "bg-red-100 text-red-700" },
  sin_seguimiento_agendado: { label: "Sin próxima fecha agendada", badge: "bg-amber-100 text-amber-700" },
  sin_contactar: { label: "Nunca contactado", badge: "bg-blue-100 text-blue-700" },
};

const LIMITE_POR_AGRONOMO = 15;

type ProductorRow = ProductorRaw & { dueno_telefono: string | null; dueno_email: string | null };

export default async function SugerenciasPage() {
  const sql = getSql();
  const [productoresRaw, cultivosRaw, seguimientosRaw, agronomosRaw] = await Promise.all([
    sql`select id, razon_social, comuna, region, agronomo_id, dueno_telefono, dueno_email from productores`,
    sql`select productor_id, especie, kilos from productor_cultivos`,
    sql`select id, productor_id, agronomo_id, canal, estado, fecha::text as fecha, proximo_seguimiento::text as proximo_seguimiento from seguimientos`,
    sql`select id, nombre from agronomos order by nombre asc`,
  ]);

  const propuesta = generarPropuestaSugerencias(
    productoresRaw as ProductorRow[],
    cultivosRaw as CultivoRaw[],
    seguimientosRaw as SeguimientoRaw[],
    agronomosRaw as AgronomoRaw[]
  );

  const totalSugerencias =
    propuesta.porAgronomo.reduce((sum, p) => sum + p.sugerencias.length, 0) + propuesta.sinAgronomosDisponibles.length;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
          <Lightbulb size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Propuesta de contactos</h1>
          <p className="text-neutral-600">
            {totalSugerencias} productores necesitan atención — priorizados por seguimientos vencidos, leads sin
            próxima fecha agendada y productores que nunca se han contactado (ordenados por kilos).
          </p>
        </div>
      </div>

      {agronomosRaw.length === 0 ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Registra al equipo en <Link href="/agronomos" className="underline">Agrónomos</Link> para poder repartir esta
          propuesta.
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {propuesta.porAgronomo.map(({ agronomo, sugerencias, kilosEnJuego }) => (
            <div key={agronomo.id} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold text-neutral-800">{agronomo.nombre}</h2>
                <span className="text-xs text-neutral-500">
                  {sugerencias.length} sugerencias · {kilosEnJuego.toLocaleString("es-CL")} kg
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
                          {s.comuna ?? "Sin comuna"} · {s.kilos.toLocaleString("es-CL")} kg
                          {s.especies.length > 0 ? ` · ${s.especies.slice(0, 2).join(", ")}` : ""}
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
                          <p className="mt-0.5 text-[11px] text-red-600">
                            Prometido para el {s.proximoSeguimientoVencido}
                          </p>
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
      )}

      {propuesta.sinAgronomosDisponibles.length > 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <UserX size={16} className="text-neutral-400" />
            <h2 className="font-medium text-neutral-800">Sin agrónomos registrados para asignar</h2>
          </div>
          <p className="text-sm text-neutral-500">{propuesta.sinAgronomosDisponibles.length} productores en espera.</p>
        </div>
      )}

      <div className="flex flex-wrap gap-4 text-xs text-neutral-400">
        <span className="flex items-center gap-1">
          <AlertTriangle size={12} className="text-red-500" /> Vencido: la fecha prometida ya pasó
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} className="text-amber-500" /> Sin próxima fecha: quedó abierto sin agendar
        </span>
      </div>
    </div>
  );
}
