import { getSql } from "@/lib/db";

type TotalRow = { tipo_estructura: string; total: number; registros: number };
type PorParcelaRow = { parcela_id: number; parcela_nombre: string; tipo_estructura: string; total: number };

export const dynamic = "force-dynamic";

async function getResumen() {
  const sql = getSql();
  const totales = (await sql`
    select tipo_estructura, sum(cantidad)::int as total, count(*)::int as registros
    from conteos
    group by tipo_estructura
    order by tipo_estructura
  `) as TotalRow[];

  const porParcela = (await sql`
    select p.id as parcela_id, p.nombre as parcela_nombre, c.tipo_estructura, sum(c.cantidad)::int as total
    from conteos c
    join ramas r on r.id = c.rama_id
    join arboles a on a.id = r.arbol_id
    join parcelas p on p.id = a.parcela_id
    group by p.id, p.nombre, c.tipo_estructura
    order by p.nombre, c.tipo_estructura
  `) as PorParcelaRow[];

  return { totales, porParcela };
}

export default async function HomePage() {
  const { totales, porParcela } = await getResumen();

  const porParcelaAgrupado = porParcela.reduce<Record<string, PorParcelaRow[]>>((acc, row) => {
    acc[row.parcela_nombre] ??= [];
    acc[row.parcela_nombre].push(row);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Resumen general</h1>
        <p className="text-neutral-600">Totales de estructuras vegetales contadas en todas las parcelas.</p>
      </div>

      <section className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {totales.length === 0 && (
          <p className="text-neutral-500 col-span-full">Aún no hay conteos registrados.</p>
        )}
        {totales.map((t) => (
          <div key={t.tipo_estructura} className="rounded-lg border border-neutral-200 bg-white p-4">
            <p className="text-sm uppercase text-neutral-500">{t.tipo_estructura}</p>
            <p className="text-3xl font-bold">{t.total}</p>
            <p className="text-xs text-neutral-400">{t.registros} registros</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-lg font-medium mb-3">Totales por parcela</h2>
        {Object.keys(porParcelaAgrupado).length === 0 && (
          <p className="text-neutral-500">Sin datos todavía.</p>
        )}
        <div className="space-y-4">
          {Object.entries(porParcelaAgrupado).map(([nombre, rows]) => (
            <div key={nombre} className="rounded-lg border border-neutral-200 bg-white p-4">
              <p className="font-medium mb-2">{nombre}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                {rows.map((r) => (
                  <span key={r.tipo_estructura} className="text-neutral-700">
                    {r.tipo_estructura}: <strong>{r.total}</strong>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
