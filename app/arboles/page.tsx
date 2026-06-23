import Link from "next/link";
import { getSql } from "@/lib/db";
import { ArbolForm } from "@/components/ArbolForm";
import { DeleteButton } from "@/components/DeleteButton";
import type { Arbol, Parcela } from "@/lib/types";

export const dynamic = "force-dynamic";

type ArbolConParcela = Arbol & { parcela_nombre: string };

export default async function ArbolesPage({
  searchParams,
}: {
  searchParams: Promise<{ parcela_id?: string }>;
}) {
  const { parcela_id } = await searchParams;
  const sql = getSql();
  const parcelas = (await sql`select * from parcelas order by nombre`) as Parcela[];
  const arboles = parcela_id
    ? ((await sql`
        select a.*, p.nombre as parcela_nombre
        from arboles a join parcelas p on p.id = a.parcela_id
        where a.parcela_id = ${parcela_id}
        order by a.codigo
      `) as ArbolConParcela[])
    : ((await sql`
        select a.*, p.nombre as parcela_nombre
        from arboles a join parcelas p on p.id = a.parcela_id
        order by a.created_at desc
      `) as ArbolConParcela[]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Árboles</h1>
      <ArbolForm parcelas={parcelas} parcelaIdPredeterminada={parcela_id ? Number(parcela_id) : undefined} />
      <div className="rounded-lg border border-neutral-200 bg-white divide-y">
        {arboles.length === 0 && <p className="p-4 text-neutral-500">No hay árboles registrados.</p>}
        {arboles.map((a) => (
          <div key={a.id} className="p-4 flex items-center justify-between">
            <div>
              <Link href={`/ramas?arbol_id=${a.id}`} className="font-medium hover:underline">
                {a.codigo}
              </Link>
              <p className="text-sm text-neutral-500">
                {a.parcela_nombre} · {a.variedad ?? "Sin variedad"}
              </p>
            </div>
            <DeleteButton url={`/api/arboles/${a.id}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
