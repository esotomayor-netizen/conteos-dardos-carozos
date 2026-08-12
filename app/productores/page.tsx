import Link from "next/link";
import { getSql } from "@/lib/db";
import { ProductoresFiltro } from "@/components/ProductoresFiltro";
import { ProductorForm } from "@/components/ProductorForm";
import { EstadoBadge } from "@/components/EstadoBadge";
import type { Agronomo, EstadoSeguimiento } from "@/lib/types";

export const dynamic = "force-dynamic";

type ProductorRow = {
  id: number;
  razon_social: string;
  comuna: string | null;
  provincia: string | null;
  region: string | null;
  dueno_nombre: string | null;
  dueno_telefono: string | null;
  dueno_email: string | null;
  agronomo_id: number | null;
  agronomo_nombre: string | null;
};

type CultivoRow = { productor_id: number; especie: string; kilos: number | null };

type UltimoSeguimientoRow = {
  productor_id: number;
  estado: EstadoSeguimiento;
  fecha: string;
  proximo_seguimiento: string | null;
};

export default async function ProductoresPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; comuna?: string; especie?: string; estado?: string; agronomo_id?: string }>;
}) {
  const filtros = await searchParams;
  const sql = getSql();

  const [productoresRaw, cultivosRaw, ultimosRaw, agronomosRaw] = await Promise.all([
    sql`
      select p.id, p.razon_social, p.comuna, p.provincia, p.region,
             p.dueno_nombre, p.dueno_telefono, p.dueno_email,
             p.agronomo_id, a.nombre as agronomo_nombre
      from productores p
      left join agronomos a on a.id = p.agronomo_id
      order by p.razon_social asc
    `,
    sql`select productor_id, especie, kilos from productor_cultivos`,
    sql`
      select distinct on (productor_id) productor_id, estado, fecha, proximo_seguimiento
      from seguimientos
      order by productor_id, fecha desc, created_at desc
    `,
    sql`select * from agronomos order by nombre asc`,
  ]);
  const productores = productoresRaw as ProductorRow[];
  const cultivos = cultivosRaw as CultivoRow[];
  const ultimos = ultimosRaw as UltimoSeguimientoRow[];
  const agronomos = agronomosRaw as Agronomo[];

  const cultivosPorProductor = new Map<number, CultivoRow[]>();
  for (const c of cultivos) {
    const arr = cultivosPorProductor.get(c.productor_id) ?? [];
    arr.push(c);
    cultivosPorProductor.set(c.productor_id, arr);
  }
  const ultimoPorProductor = new Map(ultimos.map((u) => [u.productor_id, u]));

  const hoy = new Date().toISOString().slice(0, 10);

  let filas = productores.map((p) => {
    const cs = cultivosPorProductor.get(p.id) ?? [];
    const kilosTotal = cs.reduce((sum, c) => sum + (c.kilos ?? 0), 0);
    const especies = [...new Set(cs.map((c) => c.especie))];
    const ultimo = ultimoPorProductor.get(p.id);
    return {
      ...p,
      kilosTotal,
      especies,
      estado: (ultimo?.estado ?? "pendiente") as EstadoSeguimiento,
      ultimaFecha: ultimo?.fecha ?? null,
      proximoSeguimiento: ultimo?.proximo_seguimiento ?? null,
      vencido: !!(ultimo?.proximo_seguimiento && ultimo.proximo_seguimiento <= hoy),
    };
  });

  if (filtros.q) {
    const q = filtros.q.toLowerCase();
    filas = filas.filter(
      (f) =>
        f.razon_social.toLowerCase().includes(q) ||
        f.dueno_nombre?.toLowerCase().includes(q) ||
        f.comuna?.toLowerCase().includes(q)
    );
  }
  if (filtros.comuna) filas = filas.filter((f) => f.comuna === filtros.comuna);
  if (filtros.especie) filas = filas.filter((f) => f.especies.includes(filtros.especie!));
  if (filtros.estado) filas = filas.filter((f) => f.estado === filtros.estado);
  if (filtros.agronomo_id) filas = filas.filter((f) => String(f.agronomo_id ?? "") === filtros.agronomo_id);

  const comunas = [...new Set(productores.map((p) => p.comuna).filter((c): c is string => !!c))].sort();
  const especies = [...new Set(cultivos.map((c) => c.especie))].sort();

  const totalKilos = productores.reduce((sum, p) => sum + (cultivosPorProductor.get(p.id) ?? []).reduce((s, c) => s + (c.kilos ?? 0), 0), 0);
  const contactados = productores.filter((p) => ultimoPorProductor.has(p.id)).length;
  const pendientes = productores.length - contactados;
  const porVencer = [...ultimoPorProductor.values()].filter((u) => u.proximo_seguimiento && u.proximo_seguimiento <= hoy).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Productores</h1>
        <p className="text-neutral-600">Base de captación para el equipo de agrónomos.</p>
      </div>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-sm uppercase text-neutral-500">Productores</p>
          <p className="text-3xl font-bold">{productores.length}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-sm uppercase text-neutral-500">Kilos totales</p>
          <p className="text-3xl font-bold">{totalKilos.toLocaleString("es-CL")}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-sm uppercase text-neutral-500">Contactados</p>
          <p className="text-3xl font-bold">{contactados}</p>
          <p className="text-xs text-neutral-400">{pendientes} sin contactar</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-sm uppercase text-neutral-500">Seguimientos por vencer</p>
          <p className="text-3xl font-bold text-amber-600">{porVencer}</p>
        </div>
      </section>

      <ProductorForm agronomos={agronomos} />

      <ProductoresFiltro comunas={comunas} especies={especies} agronomos={agronomos} valores={filtros} />

      <div className="rounded-lg border border-neutral-200 bg-white divide-y">
        {filas.length === 0 && <p className="p-4 text-neutral-500">No hay productores que coincidan con el filtro.</p>}
        {filas.map((f) => (
          <Link
            key={f.id}
            href={`/productores/${f.id}`}
            className="p-4 flex items-center justify-between gap-4 hover:bg-neutral-50"
          >
            <div className="min-w-0">
              <p className="font-medium truncate">{f.razon_social}</p>
              <p className="text-sm text-neutral-500 truncate">
                {f.comuna ?? "Sin comuna"} · {f.especies.join(", ") || "Sin cultivos"} ·{" "}
                {f.kilosTotal.toLocaleString("es-CL")} kg
              </p>
              <p className="text-xs text-neutral-400">
                {f.dueno_nombre ?? "Sin contacto"} {f.agronomo_nombre ? `· Agrónomo: ${f.agronomo_nombre}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {f.vencido && <span className="text-xs text-amber-600 font-medium">Seguimiento vencido</span>}
              <EstadoBadge estado={f.estado} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
