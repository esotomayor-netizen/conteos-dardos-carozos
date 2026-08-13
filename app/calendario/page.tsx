import { getSql } from "@/lib/db";
import { ultimoPorProductorMap } from "@/lib/dashboard-metrics";
import { CalendarioSeguimientos, type SeguimientoCalendario } from "@/components/calendario/CalendarioSeguimientos";
import type { AgronomoRaw } from "@/lib/dashboard-metrics";

export const dynamic = "force-dynamic";

type SeguimientoRow = {
  id: number;
  productor_id: number;
  razon_social: string;
  comuna: string | null;
  agronomo_id: number | null;
  agronomo_nombre: string | null;
  canal: SeguimientoCalendario["canal"];
  estado: SeguimientoCalendario["estado"];
  fecha: string;
  proximo_seguimiento: string | null;
  notas: string | null;
};

export default async function CalendarioPage() {
  const sql = getSql();
  const [filasRaw, agronomosRaw] = await Promise.all([
    sql`
      select s.id, s.productor_id, p.razon_social, p.comuna, s.agronomo_id, a.nombre as agronomo_nombre,
             s.canal, s.estado, s.fecha, s.proximo_seguimiento, s.notas
      from seguimientos s
      join productores p on p.id = s.productor_id
      left join agronomos a on a.id = s.agronomo_id
      order by s.fecha desc
    `,
    sql`select id, nombre from agronomos order by nombre asc`,
  ]);

  const filas = filasRaw as SeguimientoRow[];
  const ultimoPorProductor = ultimoPorProductorMap(filas);

  const seguimientos: SeguimientoCalendario[] = filas.map((s) => ({
    ...s,
    esUltimo: ultimoPorProductor.get(s.productor_id)?.id === s.id,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Calendario de seguimientos</h1>
        <p className="text-neutral-600">Trazabilidad y avance de los contactos realizados y programados por el equipo.</p>
      </div>
      <CalendarioSeguimientos seguimientos={seguimientos} agronomos={agronomosRaw as AgronomoRaw[]} />
    </div>
  );
}
