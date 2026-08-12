import { getSql } from "@/lib/db";
import { AgronomoForm } from "@/components/AgronomoForm";
import { DeleteButton } from "@/components/DeleteButton";
import type { Agronomo } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AgronomosPage() {
  const sql = getSql();
  const agronomos = (await sql`
    select a.*, count(p.id)::int as productores_asignados
    from agronomos a
    left join productores p on p.agronomo_id = a.id
    group by a.id
    order by a.nombre asc
  `) as (Agronomo & { productores_asignados: number })[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Equipo de agrónomos</h1>
        <p className="text-neutral-600">Administra a las personas que hacen la captación de productores.</p>
      </div>
      <AgronomoForm />
      <div className="rounded-lg border border-neutral-200 bg-white divide-y">
        {agronomos.length === 0 && <p className="p-4 text-neutral-500">No hay agrónomos registrados.</p>}
        {agronomos.map((a) => (
          <div key={a.id} className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{a.nombre}</p>
              <p className="text-sm text-neutral-500">
                {a.email ?? "Sin mail"} · {a.telefono ?? "Sin teléfono"} · {a.productores_asignados} productores asignados
              </p>
            </div>
            <DeleteButton url={`/api/agronomos/${a.id}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
