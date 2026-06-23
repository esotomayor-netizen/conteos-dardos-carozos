import { getSql } from "@/lib/db";
import { ConteoForm } from "@/components/ConteoForm";
import { DeleteButton } from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

type ConteoConDetalle = {
  id: number;
  rama_id: number;
  tipo_estructura: string;
  cantidad: number;
  fecha: string;
  notas: string | null;
  rama_codigo: string;
  arbol_codigo: string;
  parcela_nombre: string;
};

export default async function ConteosPage({
  searchParams,
}: {
  searchParams: Promise<{ rama_id?: string }>;
}) {
  const { rama_id } = await searchParams;
  const sql = getSql();
  const ramas = (await sql`
    select r.id, r.codigo, a.codigo as arbol_codigo, p.nombre as parcela_nombre
    from ramas r
    join arboles a on a.id = r.arbol_id
    join parcelas p on p.id = a.parcela_id
    order by p.nombre, a.codigo, r.codigo
  `) as { id: number; codigo: string; arbol_codigo: string; parcela_nombre: string }[];

  const conteos = rama_id
    ? ((await sql`
        select c.*, r.codigo as rama_codigo, a.codigo as arbol_codigo, p.nombre as parcela_nombre
        from conteos c
        join ramas r on r.id = c.rama_id
        join arboles a on a.id = r.arbol_id
        join parcelas p on p.id = a.parcela_id
        where c.rama_id = ${rama_id}
        order by c.fecha desc, c.created_at desc
      `) as ConteoConDetalle[])
    : ((await sql`
        select c.*, r.codigo as rama_codigo, a.codigo as arbol_codigo, p.nombre as parcela_nombre
        from conteos c
        join ramas r on r.id = c.rama_id
        join arboles a on a.id = r.arbol_id
        join parcelas p on p.id = a.parcela_id
        order by c.fecha desc, c.created_at desc
        limit 100
      `) as ConteoConDetalle[]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Conteos</h1>
      <ConteoForm ramas={ramas} ramaIdPredeterminada={rama_id ? Number(rama_id) : undefined} />
      <div className="rounded-lg border border-neutral-200 bg-white divide-y">
        {conteos.length === 0 && <p className="p-4 text-neutral-500">No hay conteos registrados.</p>}
        {conteos.map((c) => (
          <div key={c.id} className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">
                {c.tipo_estructura}: {c.cantidad}
              </p>
              <p className="text-sm text-neutral-500">
                {c.parcela_nombre} / {c.arbol_codigo} / {c.rama_codigo} · {new Date(c.fecha).toLocaleDateString("es-CL")}
                {c.notas ? ` · ${c.notas}` : ""}
              </p>
            </div>
            <DeleteButton url={`/api/conteos/${c.id}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
