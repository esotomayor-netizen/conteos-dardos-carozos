import { getSql } from "@/lib/db";
import { PredioForm } from "@/components/PredioForm";
import { DeleteButton } from "@/components/DeleteButton";
import { EstadoContactoSelect } from "@/components/EstadoContactoSelect";
import { PrediosMapClient } from "@/components/PrediosMapClient";
import { ESTADOS_CONTACTO_LABEL, type PredioProspeccion } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PrediosPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; especie?: string }>;
}) {
  const { region, especie } = await searchParams;
  const sql = getSql();
  const predios = (await sql`
    select * from predios_prospeccion
    where (${region ?? null}::text is null or region = ${region ?? null})
      and (${especie ?? null}::text is null or especie = ${especie ?? null})
    order by created_at desc
  `) as PredioProspeccion[];

  const [regiones, especies] = await Promise.all([
    sql`select distinct region from predios_prospeccion order by region`,
    sql`select distinct especie from predios_prospeccion order by especie`,
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Prospección de predios</h1>
        <p className="text-sm text-neutral-500">
          Busca nuevos productores por región y especie para sumar a tu red de proveedores.
        </p>
      </div>

      <PredioForm />

      <form className="flex flex-wrap gap-3 items-end" method="get">
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Región</label>
          <select name="region" defaultValue={region ?? ""} className="border rounded px-3 py-2 text-sm">
            <option value="">Todas</option>
            {regiones.map((r) => (
              <option key={r.region} value={r.region}>
                {r.region}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Especie</label>
          <select name="especie" defaultValue={especie ?? ""} className="border rounded px-3 py-2 text-sm">
            <option value="">Todas</option>
            {especies.map((e) => (
              <option key={e.especie} value={e.especie}>
                {e.especie}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="bg-neutral-900 text-white rounded px-4 py-2 text-sm">
          Filtrar
        </button>
      </form>

      <PrediosMapClient predios={predios} />

      <div className="rounded-lg border border-neutral-200 bg-white divide-y">
        {predios.length === 0 && <p className="p-4 text-neutral-500">No hay predios registrados con estos filtros.</p>}
        {predios.map((p) => (
          <div key={p.id} className="p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">{p.nombre_propietario}</p>
              <p className="text-sm text-neutral-500">
                {p.especie}
                {p.variedad ? ` · ${p.variedad}` : ""} · {p.region}
                {p.comuna ? `, ${p.comuna}` : ""} ·{" "}
                {p.hectareas_aprox ? `${p.hectareas_aprox} ha` : "ha no informadas"}
              </p>
              {(p.telefono || p.email) && (
                <p className="text-sm text-neutral-500">
                  {p.telefono ?? ""} {p.email ?? ""}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <EstadoContactoSelect id={p.id} value={p.estado_contacto} />
              <DeleteButton url={`/api/predios/${p.id}`} />
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-neutral-400">
        Estados de seguimiento: {Object.values(ESTADOS_CONTACTO_LABEL).join(" · ")}
      </p>
    </div>
  );
}
