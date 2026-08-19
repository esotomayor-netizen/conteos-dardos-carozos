import { getSql } from "@/lib/db";
import { ZonasClient } from "@/components/ZonasClient";
import type { ProductorZona } from "@/lib/types";

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
  const productoresRows = productoresRaw as ProductorRow[];
  const cultivos = cultivosRaw as CultivoRow[];

  const especiesPorProductor = new Map<number, string[]>();
  for (const c of cultivos) {
    const arr = especiesPorProductor.get(c.productor_id) ?? [];
    if (!arr.includes(c.especie)) arr.push(c.especie);
    especiesPorProductor.set(c.productor_id, arr);
  }

  const productores: ProductorZona[] = productoresRows.map((p) => ({
    id: p.id,
    razon_social: p.razon_social,
    direccion: p.direccion,
    region: p.region ?? "Sin región",
    provincia: p.provincia ?? "Sin provincia",
    comuna: p.comuna ?? "Sin comuna",
    dueno_telefono: p.dueno_telefono,
    latitud: p.latitud,
    longitud: p.longitud,
    especies: especiesPorProductor.get(p.id) ?? [],
  }));

  return <ZonasClient productores={productores} />;
}
