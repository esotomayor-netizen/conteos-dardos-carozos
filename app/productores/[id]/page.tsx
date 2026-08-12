import Link from "next/link";
import { notFound } from "next/navigation";
import { getSql } from "@/lib/db";
import { SeguimientoForm } from "@/components/SeguimientoForm";
import { EstadoBadge } from "@/components/EstadoBadge";
import { DeleteButton } from "@/components/DeleteButton";
import { CANAL_LABELS, type Agronomo, type Productor, type ProductorCultivo, type Seguimiento } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProductorDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sql = getSql();

  const [productorRowsRaw, cultivosRaw, seguimientosRaw, agronomosRaw] = await Promise.all([
    sql`
      select p.*, a.nombre as agronomo_nombre
      from productores p
      left join agronomos a on a.id = p.agronomo_id
      where p.id = ${id}
    `,
    sql`select * from productor_cultivos where productor_id = ${id} order by especie, variedad`,
    sql`select s.*, a.nombre as agronomo_nombre from seguimientos s left join agronomos a on a.id = s.agronomo_id where s.productor_id = ${id} order by s.fecha desc, s.created_at desc`,
    sql`select * from agronomos order by nombre asc`,
  ]);
  const productorRows = productorRowsRaw as (Productor & { agronomo_nombre: string | null })[];
  const cultivos = cultivosRaw as ProductorCultivo[];
  const seguimientos = seguimientosRaw as (Seguimiento & { agronomo_nombre: string | null })[];
  const agronomos = agronomosRaw as Agronomo[];

  const productor = productorRows[0];
  if (!productor) notFound();

  const kilosTotal = cultivos.reduce((sum, c) => sum + (c.kilos ?? 0), 0);
  const estadoActual = seguimientos[0]?.estado ?? "pendiente";

  return (
    <div className="space-y-6">
      <div>
        <Link href="/productores" className="text-sm text-neutral-500 hover:underline">
          ← Productores
        </Link>
        <div className="flex items-start justify-between gap-4 mt-1">
          <div>
            <h1 className="text-2xl font-semibold">{productor.razon_social}</h1>
            <p className="text-neutral-600">
              {productor.comuna ?? "Sin comuna"}
              {productor.provincia ? `, ${productor.provincia}` : ""}
              {productor.region ? ` — ${productor.region}` : ""}
            </p>
          </div>
          <EstadoBadge estado={estadoActual} />
        </div>
      </div>

      <section className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-l-4 border-l-blue-500 border-neutral-200 bg-white p-4 space-y-2">
          <h2 className="font-medium mb-2 text-blue-800">Contacto</h2>
          <p className="text-sm">
            <span className="text-neutral-500">Dueño:</span> {productor.dueno_nombre ?? "—"}
          </p>
          <p className="text-sm">
            <span className="text-neutral-500">Teléfono:</span>{" "}
            {productor.dueno_telefono ? <a className="hover:underline" href={`tel:${productor.dueno_telefono}`}>{productor.dueno_telefono}</a> : "—"}
          </p>
          <p className="text-sm">
            <span className="text-neutral-500">Mail:</span>{" "}
            {productor.dueno_email ? <a className="hover:underline" href={`mailto:${productor.dueno_email}`}>{productor.dueno_email}</a> : "—"}
          </p>
          <hr className="my-2" />
          <p className="text-sm">
            <span className="text-neutral-500">Administrador:</span> {productor.administrador_nombre ?? "—"}
          </p>
          <p className="text-sm">
            <span className="text-neutral-500">Teléfono admin.:</span>{" "}
            {productor.administrador_telefono ? (
              <a className="hover:underline" href={`tel:${productor.administrador_telefono}`}>{productor.administrador_telefono}</a>
            ) : (
              "—"
            )}
          </p>
          <p className="text-sm">
            <span className="text-neutral-500">Mail admin.:</span>{" "}
            {productor.administrador_email ? (
              <a className="hover:underline" href={`mailto:${productor.administrador_email}`}>{productor.administrador_email}</a>
            ) : (
              "—"
            )}
          </p>
          <hr className="my-2" />
          <p className="text-sm">
            <span className="text-neutral-500">Dirección:</span> {productor.direccion ?? "—"}
          </p>
          <p className="text-sm">
            <span className="text-neutral-500">Código SAG:</span> {productor.codigo_sag ?? "—"}
          </p>
          <p className="text-sm">
            <span className="text-neutral-500">Agrónomo asignado:</span> {productor.agronomo_nombre ?? "Sin asignar"}
          </p>
        </div>

        <div className="rounded-lg border border-l-4 border-l-amber-500 border-neutral-200 bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-medium text-amber-800">Cultivos</h2>
            <span className="text-sm font-medium text-amber-700">{kilosTotal.toLocaleString("es-CL")} kg totales</span>
          </div>
          {cultivos.length === 0 && <p className="text-neutral-500 text-sm">Sin cultivos registrados.</p>}
          <div className="divide-y">
            {cultivos.map((c) => (
              <div key={c.id} className="py-2 flex items-center justify-between text-sm">
                <span>
                  {c.especie} {c.variedad ? `· ${c.variedad}` : ""}
                </span>
                <span className="text-neutral-600">{(c.kilos ?? 0).toLocaleString("es-CL")} kg</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SeguimientoForm productorId={productor.id} agronomos={agronomos} />

      <section>
        <h2 className="text-lg font-medium mb-3">Historial de contactos</h2>
        {seguimientos.length === 0 && (
          <p className="text-neutral-500">Aún no se ha registrado ningún contacto con este productor.</p>
        )}
        <div className="space-y-3">
          {seguimientos.map((s) => (
            <div key={s.id} className="rounded-lg border border-neutral-200 bg-white p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <EstadoBadge estado={s.estado} />
                  <span className="text-sm text-neutral-500">{CANAL_LABELS[s.canal]}</span>
                  <span className="text-sm text-neutral-400">·</span>
                  <span className="text-sm text-neutral-500">{s.fecha}</span>
                  {s.agronomo_nombre && (
                    <>
                      <span className="text-sm text-neutral-400">·</span>
                      <span className="text-sm text-neutral-500">{s.agronomo_nombre}</span>
                    </>
                  )}
                </div>
                <DeleteButton url={`/api/seguimientos/${s.id}`} />
              </div>
              {s.notas && <p className="text-sm text-neutral-700 mt-2">{s.notas}</p>}
              {s.proximo_seguimiento && (
                <p className="text-xs text-amber-600 mt-1">Próximo seguimiento: {s.proximo_seguimiento}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
