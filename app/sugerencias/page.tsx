import Link from "next/link";
import { Lightbulb, AlertTriangle, Clock } from "lucide-react";
import { getSql } from "@/lib/db";
import { generarPropuestaSugerencias } from "@/lib/sugerencias";
import { PropuestaClient } from "@/components/sugerencias/PropuestaClient";
import type { AgronomoRaw, CultivoRaw, ProductorRaw, SeguimientoRaw } from "@/lib/dashboard-metrics";

export const dynamic = "force-dynamic";

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
            próxima fecha agendada y productores que nunca se han contactado (ordenados por kilos). Filtra por
            especie para enfocar la captación por volumen.
          </p>
        </div>
      </div>

      {agronomosRaw.length === 0 ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Registra al equipo en <Link href="/agronomos" className="underline">Agrónomos</Link> para poder repartir esta
          propuesta.
        </p>
      ) : (
        <PropuestaClient propuesta={propuesta} />
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
