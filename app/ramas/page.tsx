import Link from "next/link";
import { getSql } from "@/lib/db";
import { RamaForm } from "@/components/RamaForm";
import { DeleteButton } from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

type RamaConArbol = {
  id: number;
  arbol_id: number;
  codigo: string;
  longitud_cm: string | null;
  arbol_codigo: string;
  parcela_nombre: string;
};

export default async function RamasPage({
  searchParams,
}: {
  searchParams: Promise<{ arbol_id?: string }>;
}) {
  const { arbol_id } = await searchParams;
  const sql = getSql();
  const arboles = (await sql`
    select a.id, a.codigo, p.nombre as parcela_nombre
    from arboles a join parcelas p on p.id = a.parcela_id
    order by p.nombre, a.codigo
  `) as { id: number; codigo: string; parcela_nombre: string }[];

  const ramas = arbol_id
    ? ((await sql`
        select r.*, a.codigo as arbol_codigo, p.nombre as parcela_nombre
        from ramas r
        join arboles a on a.id = r.arbol_id
        join parcelas p on p.id = a.parcela_id
        where r.arbol_id = ${arbol_id}
        order by r.codigo
      `) as RamaConArbol[])
    : ((await sql`
        select r.*, a.codigo as arbol_codigo, p.nombre as parcela_nombre
        from ramas r
        join arboles a on a.id = r.arbol_id
        join parcelas p on p.id = a.parcela_id
        order by r.created_at desc
      `) as RamaConArbol[]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Ramas</h1>
      <RamaForm arboles={arboles} arbolIdPredeterminado={arbol_id ? Number(arbol_id) : undefined} />
      <div className="rounded-lg border border-neutral-200 bg-white divide-y">
        {ramas.length === 0 && <p className="p-4 text-neutral-500">No hay ramas registradas.</p>}
        {ramas.map((r) => (
          <div key={r.id} className="p-4 flex items-center justify-between">
            <div>
              <Link href={`/conteos?rama_id=${r.id}`} className="font-medium hover:underline">
                {r.codigo}
              </Link>
              <p className="text-sm text-neutral-500">
                {r.parcela_nombre} / {r.arbol_codigo}
                {r.longitud_cm ? ` · ${r.longitud_cm} cm` : ""}
              </p>
            </div>
            <DeleteButton url={`/api/ramas/${r.id}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
