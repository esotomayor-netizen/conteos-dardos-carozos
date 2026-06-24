import { getSql } from "@/lib/db";
import { PredioForm } from "@/components/PredioForm";
import { DeleteButton } from "@/components/DeleteButton";
import { EstadoContactoSelect } from "@/components/EstadoContactoSelect";
import { PrediosMapClient } from "@/components/PrediosMapClient";
import { ESTADOS_CONTACTO_LABEL, type PredioProspeccion } from "@/lib/types";

export const dynamic = "force-dynamic";

const POR_PAGINA = 50;
const MAX_PUNTOS_MAPA = 2000;

export default async function PrediosPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; comuna?: string; especie?: string; page?: string }>;
}) {
  const { region, comuna, especie, page } = await searchParams;
  const pagina = Math.max(1, Number(page) || 1);
  const offset = (pagina - 1) * POR_PAGINA;
  const sql = getSql();

  const filtros = {
    region: region ?? null,
    comuna: comuna ?? null,
    especie: especie ?? null,
  };

  const [predios, [{ total }], puntosMapa, regiones, comunas, especies] = await Promise.all([
    sql`
      select * from predios_prospeccion
      where (${filtros.region}::text is null or region = ${filtros.region})
        and (${filtros.comuna}::text is null or comuna = ${filtros.comuna})
        and (${filtros.especie}::text is null or especie = ${filtros.especie})
      order by created_at desc
      limit ${POR_PAGINA} offset ${offset}
    `,
    sql`
      select count(*)::int as total from predios_prospeccion
      where (${filtros.region}::text is null or region = ${filtros.region})
        and (${filtros.comuna}::text is null or comuna = ${filtros.comuna})
        and (${filtros.especie}::text is null or especie = ${filtros.especie})
    `,
    sql`
      select id, lat, lng, nombre_propietario, direccion, especie, variedad, hectareas_aprox,
             ha_total_predio, region, comuna, rol, telefono, email
      from predios_prospeccion
      where lat is not null and lng is not null
        and (${filtros.region}::text is null or region = ${filtros.region})
        and (${filtros.comuna}::text is null or comuna = ${filtros.comuna})
        and (${filtros.especie}::text is null or especie = ${filtros.especie})
      limit ${MAX_PUNTOS_MAPA}
    `,
    sql`select distinct region from predios_prospeccion order by region`,
    sql`select distinct comuna from predios_prospeccion where comuna is not null order by comuna`,
    sql`select distinct especie from predios_prospeccion order by especie`,
  ]);

  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  function urlPagina(p: number) {
    const params = new URLSearchParams();
    if (region) params.set("region", region);
    if (comuna) params.set("comuna", comuna);
    if (especie) params.set("especie", especie);
    params.set("page", String(p));
    return `/predios?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Prospección de predios</h1>
        <p className="text-sm text-neutral-500">
          Busca nuevos productores por región, comuna y especie para sumar a tu red de proveedores.
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
          <label className="block text-xs text-neutral-500 mb-1">Comuna</label>
          <select name="comuna" defaultValue={comuna ?? ""} className="border rounded px-3 py-2 text-sm">
            <option value="">Todas</option>
            {comunas.map((c) => (
              <option key={c.comuna} value={c.comuna}>
                {c.comuna}
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

      <p className="text-sm text-neutral-500">
        {total.toLocaleString("es-CL")} predio(s) encontrados
        {puntosMapa.length < total && puntosMapa.length === MAX_PUNTOS_MAPA
          ? ` · mostrando los primeros ${MAX_PUNTOS_MAPA.toLocaleString("es-CL")} en el mapa`
          : ""}
      </p>

      <PrediosMapClient predios={puntosMapa as PredioProspeccion[]} />

      <div className="rounded-lg border border-neutral-200 bg-white divide-y">
        {predios.length === 0 && <p className="p-4 text-neutral-500">No hay predios registrados con estos filtros.</p>}
        {(predios as PredioProspeccion[]).map((p) => (
          <div key={p.id} className="p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">{p.nombre_propietario}</p>
              <p className="text-sm text-neutral-500">
                {p.especie}
                {p.variedad ? ` · ${p.variedad}` : ""} · {p.region}
                {p.comuna ? `, ${p.comuna}` : ""} ·{" "}
                {p.hectareas_aprox ? `${p.hectareas_aprox} ha` : "ha no informadas"}
                {p.ha_total_predio ? ` de ${p.ha_total_predio} ha del predio` : ""}
              </p>
              {p.direccion && <p className="text-sm text-neutral-500">{p.direccion}</p>}
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

      {totalPaginas > 1 && (
        <div className="flex items-center gap-3 text-sm">
          <a
            href={pagina > 1 ? urlPagina(pagina - 1) : undefined}
            className={pagina > 1 ? "underline" : "text-neutral-300 pointer-events-none"}
          >
            ← Anterior
          </a>
          <span className="text-neutral-500">
            Página {pagina} de {totalPaginas}
          </span>
          <a
            href={pagina < totalPaginas ? urlPagina(pagina + 1) : undefined}
            className={pagina < totalPaginas ? "underline" : "text-neutral-300 pointer-events-none"}
          >
            Siguiente →
          </a>
        </div>
      )}

      <p className="text-xs text-neutral-400">
        Estados de seguimiento: {Object.values(ESTADOS_CONTACTO_LABEL).join(" · ")}
      </p>
    </div>
  );
}
