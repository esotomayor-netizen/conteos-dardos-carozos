import { getSql } from "@/lib/db";
import { ultimoPorProductorMap, type AgronomoRaw, type CultivoRaw, type SeguimientoRaw } from "@/lib/dashboard-metrics";
import { estadoActualDe, type ProductorPipeline } from "@/lib/pipeline";
import { KanbanBoard } from "@/components/pipeline/KanbanBoard";

export const dynamic = "force-dynamic";

type ProductorRow = {
  id: number;
  razon_social: string;
  comuna: string | null;
  agronomo_id: number | null;
  agronomo_nombre: string | null;
};

export default async function PipelinePage() {
  const sql = getSql();
  const [productoresRaw, cultivosRaw, seguimientosRaw, agronomosRaw] = await Promise.all([
    sql`
      select p.id, p.razon_social, p.comuna, p.agronomo_id, a.nombre as agronomo_nombre
      from productores p
      left join agronomos a on a.id = p.agronomo_id
      order by p.razon_social asc
    `,
    sql`select productor_id, especie, kilos from productor_cultivos`,
    sql`select id, productor_id, agronomo_id, canal, estado, fecha::text as fecha, proximo_seguimiento::text as proximo_seguimiento from seguimientos`,
    sql`select id, nombre from agronomos order by nombre asc`,
  ]);

  const productores = productoresRaw as ProductorRow[];
  const cultivos = cultivosRaw as CultivoRaw[];
  const seguimientos = seguimientosRaw as SeguimientoRaw[];
  const agronomos = agronomosRaw as AgronomoRaw[];

  const especiesPorProductor = new Map<number, string[]>();
  const kilosPorProductor = new Map<number, number>();
  for (const c of cultivos) {
    const arr = especiesPorProductor.get(c.productor_id) ?? [];
    if (!arr.includes(c.especie)) arr.push(c.especie);
    especiesPorProductor.set(c.productor_id, arr);
    kilosPorProductor.set(c.productor_id, (kilosPorProductor.get(c.productor_id) ?? 0) + (c.kilos ?? 0));
  }

  const ultimoPorProductor = ultimoPorProductorMap(seguimientos);

  const productoresPipeline: ProductorPipeline[] = productores.map((p) => {
    const ultimo = ultimoPorProductor.get(p.id);
    return {
      id: p.id,
      razon_social: p.razon_social,
      comuna: p.comuna,
      agronomo_id: p.agronomo_id,
      agronomo_nombre: p.agronomo_nombre,
      kilos: kilosPorProductor.get(p.id) ?? 0,
      especies: especiesPorProductor.get(p.id) ?? [],
      ultimaFecha: ultimo?.fecha ?? null,
      ultimoCanal: ultimo?.canal ?? null,
      columna: estadoActualDe(ultimo?.estado),
    };
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Tablero de captación</h1>
        <p className="text-neutral-600">
          Arrastra a un productor a otra columna para registrar el contacto y avanzarlo en el proceso.
        </p>
      </div>
      <KanbanBoard productoresIniciales={productoresPipeline} agronomos={agronomos} />
    </div>
  );
}
