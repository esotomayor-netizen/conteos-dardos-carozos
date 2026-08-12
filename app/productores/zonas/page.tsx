import Link from "next/link";
import { getSql } from "@/lib/db";
import { MapaProductores } from "@/components/MapaProductores";

export const dynamic = "force-dynamic";

type ProductorRow = {
  id: number;
  razon_social: string;
  direccion: string | null;
  comuna: string | null;
  provincia: string | null;
  region: string | null;
  dueno_telefono: string | null;
  latitud: number | null;
  longitud: number | null;
};

type CultivoRow = { productor_id: number; especie: string };

type Grupo = {
  region: string;
  provincia: string;
  comuna: string;
  productores: ProductorRow[];
};

export default async function ZonasPage() {
  const sql = getSql();
  const [productoresRaw, cultivosRaw] = await Promise.all([
    sql`
      select id, razon_social, direccion, comuna, provincia, region, dueno_telefono, latitud, longitud
      from productores
      order by region, provincia, comuna, razon_social
    `,
    sql`select productor_id, especie from productor_cultivos`,
  ]);
  const productores = productoresRaw as ProductorRow[];
  const cultivos = cultivosRaw as CultivoRow[];

  const especiesPorProductor = new Map<number, string[]>();
  for (const c of cultivos) {
    const arr = especiesPorProductor.get(c.productor_id) ?? [];
    if (!arr.includes(c.especie)) arr.push(c.especie);
    especiesPorProductor.set(c.productor_id, arr);
  }

  const comunaMap = new Map<string, Grupo>();
  for (const p of productores) {
    const region = p.region ?? "Sin región";
    const provincia = p.provincia ?? "Sin provincia";
    const comuna = p.comuna ?? "Sin comuna";
    const key = `${region}__${provincia}__${comuna}`;
    if (!comunaMap.has(key)) comunaMap.set(key, { region, provincia, comuna, productores: [] });
    comunaMap.get(key)!.productores.push(p);
  }

  const grupos = [...comunaMap.values()].sort(
    (a, b) =>
      a.region.localeCompare(b.region) ||
      a.provincia.localeCompare(b.provincia) ||
      a.comuna.localeCompare(b.comuna)
  );

  const conDireccion = productores.filter((p) => p.direccion).length;

  const productoresMapa = productores.map((p) => ({
    id: p.id,
    razon_social: p.razon_social,
    direccion: p.direccion,
    comuna: p.comuna,
    dueno_telefono: p.dueno_telefono,
    especies: especiesPorProductor.get(p.id) ?? [],
    latitud: p.latitud,
    longitud: p.longitud,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Zonas de productores</h1>
          <p className="text-neutral-600">Agrupados por comuna para planificar rutas de visita del equipo.</p>
        </div>
        <Link
          href="/productores"
          className="text-sm text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 rounded-full px-4 py-2 font-medium shrink-0 transition-colors"
        >
          ← Volver a productores
        </Link>
      </div>

      <p className="text-sm text-neutral-500">
        {productores.length} productores en {comunaMap.size} comunas · {conDireccion} con dirección registrada
      </p>

      <MapaProductores productores={productoresMapa} />

      <div className="space-y-6">
        {grupos.map((g) => (
          <div
            key={`${g.region}__${g.provincia}__${g.comuna}`}
            className="rounded-lg border border-l-4 border-l-emerald-500 border-neutral-200 bg-white overflow-hidden shadow-sm"
          >
            <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100">
              <p className="font-medium text-emerald-900">{g.comuna}</p>
              <p className="text-xs text-emerald-700">
                {g.provincia} · {g.region} · {g.productores.length} productores
              </p>
            </div>
            <div className="divide-y">
              {g.productores.map((p) => {
                const especies = especiesPorProductor.get(p.id) ?? [];
                return (
                  <Link
                    key={p.id}
                    href={`/productores/${p.id}`}
                    className="p-3 flex items-center justify-between gap-4 hover:bg-emerald-50/60 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.razon_social}</p>
                      <p className="text-xs text-neutral-500 truncate">
                        {p.direccion ?? "Sin dirección registrada"}
                        {p.dueno_telefono ? ` · ${p.dueno_telefono}` : ""}
                      </p>
                    </div>
                    <span className="text-xs text-neutral-400 shrink-0">{especies.join(", ") || "—"}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
