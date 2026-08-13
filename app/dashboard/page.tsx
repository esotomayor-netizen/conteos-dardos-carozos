import Link from "next/link";
import {
  Users,
  Package,
  PhoneCall,
  TrendingUp,
  Trophy,
  AlertTriangle,
  Target,
  Sprout,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { getSql } from "@/lib/db";
import { StatTile } from "@/components/dashboard/StatTile";
import { BarList } from "@/components/dashboard/BarList";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { AgronomoPanel } from "@/components/dashboard/AgronomoPanel";
import { computeDashboardMetrics, type AgronomoRaw, type CultivoRaw, type ProductorRaw, type SeguimientoRaw } from "@/lib/dashboard-metrics";
import { CANAL_COLORS, SEQUENTIAL_BLUE, SEQUENTIAL_BLUE_ORDINAL, buildColorMap } from "@/lib/chart-colors";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const sql = getSql();
  const [productoresRaw, cultivosRaw, seguimientosRaw, agronomosRaw] = await Promise.all([
    sql`select id, razon_social, comuna, region, agronomo_id from productores`,
    sql`select productor_id, especie, kilos from productor_cultivos`,
    sql`select id, productor_id, agronomo_id, canal, estado, fecha::text as fecha, proximo_seguimiento::text as proximo_seguimiento from seguimientos`,
    sql`select id, nombre from agronomos order by nombre asc`,
  ]);

  const metrics = computeDashboardMetrics(
    productoresRaw as ProductorRaw[],
    cultivosRaw as CultivoRaw[],
    seguimientosRaw as SeguimientoRaw[],
    agronomosRaw as AgronomoRaw[]
  );

  const { kpis, canalGlobal, especieGlobal, funnel, cerradosPerdidos, ranking, tendencia, prioridad } = metrics;
  // Mapa fijo especie -> color, construido una sola vez a partir del ranking global,
  // para que cada especie mantenga su color en todas las vistas (incluida la por agrónomo).
  const especieColors = buildColorMap(especieGlobal.map((e) => e.label));

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Dashboard de captación</h1>
          <p className="text-neutral-600">Desempeño del equipo comercial y avance de la cartera de productores.</p>
        </div>
        <Link
          href="/productores"
          className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
        >
          Ir a productores →
        </Link>
      </div>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatTile label="Productores" value={kpis.totalProductores.toLocaleString("es-CL")} icon={Users} tone="blue" />
        <StatTile
          label="Kilos totales"
          value={`${Math.round(kpis.totalKilos / 1000).toLocaleString("es-CL")} t`}
          sublabel={`${kpis.totalKilos.toLocaleString("es-CL")} kg`}
          icon={Package}
          tone="amber"
        />
        <StatTile label="Contactos" value={kpis.totalSeguimientos.toLocaleString("es-CL")} icon={PhoneCall} tone="violet" />
        <StatTile
          label="Tasa de contacto"
          value={`${kpis.tasaContacto}%`}
          sublabel={`${kpis.productoresContactados} de ${kpis.totalProductores}`}
          icon={Target}
          tone="emerald"
        />
        <StatTile label="Cerrados ganados" value={kpis.cerradosGanados.toLocaleString("es-CL")} icon={CheckCircle2} tone="emerald" />
        <StatTile label="Seguimientos vencidos" value={kpis.vencidos.toLocaleString("es-CL")} icon={AlertTriangle} tone="red" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Mail size={18} className="text-neutral-400" />
            <h2 className="font-medium text-neutral-800">Contactos por canal</h2>
          </div>
          <BarList items={canalGlobal} colors={CANAL_COLORS} />
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Sprout size={18} className="text-neutral-400" />
            <h2 className="font-medium text-neutral-800">Contactos por especie</h2>
          </div>
          <BarList items={especieGlobal} colors={especieColors} labelWidth="w-24" />
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-neutral-400" />
            <h2 className="font-medium text-neutral-800">Embudo de conversión</h2>
          </div>
          {cerradosPerdidos > 0 && (
            <span className="text-xs text-red-600">{cerradosPerdidos} cerrados como perdidos (fuera del embudo)</span>
          )}
        </div>
        <BarList items={funnel.map((f) => ({ label: f.etapa, total: f.total, pct: f.pct }))} colors={[...SEQUENTIAL_BLUE_ORDINAL]} labelWidth="w-32" />
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Trophy size={18} className="text-neutral-400" />
          <h2 className="font-medium text-neutral-800">Ranking de agrónomos — mayores usuarios del CRM</h2>
        </div>
        <BarList
          items={ranking.map((r) => ({ label: r.nombre, total: r.totalContactos }))}
          colors={SEQUENTIAL_BLUE}
          showPct={false}
          emptyMessage="Todavía no hay agrónomos registrados."
        />
        {ranking.length > 0 && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-xs uppercase text-neutral-500">
                  <th className="py-2 pr-4 font-medium">Agrónomo</th>
                  <th className="py-2 pr-4 font-medium text-right">Contactos</th>
                  <th className="py-2 pr-4 font-medium text-right">Productores contactados</th>
                  <th className="py-2 pr-4 font-medium text-right">Productores asignados</th>
                  <th className="py-2 font-medium text-right">Kilos gestionados</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {ranking.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2 pr-4 font-medium text-neutral-800">{r.nombre}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">{r.totalContactos}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">{r.productoresContactados}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">{r.productoresAsignados}</td>
                    <td className="py-2 text-right tabular-nums">{r.kilosGestionados.toLocaleString("es-CL")} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Users size={18} className="text-neutral-400" />
          <h2 className="font-medium text-neutral-800">Desempeño por agrónomo</h2>
        </div>
        <AgronomoPanel ranking={ranking} porAgronomo={metrics.porAgronomo} canalColors={CANAL_COLORS} especieColors={especieColors} />
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="mb-1 flex items-center gap-2">
          <TrendingUp size={18} className="text-neutral-400" />
          <h2 className="font-medium text-neutral-800">Tendencia de contactos</h2>
        </div>
        <TrendChart data={tendencia} />
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-500" />
          <h2 className="font-medium text-neutral-800">Prioridad de captación</h2>
          <span className="text-xs text-neutral-400">— mayor volumen sin contactar</span>
        </div>
        {prioridad.length === 0 ? (
          <p className="text-sm text-neutral-500">Todos los productores tienen al menos un contacto registrado.</p>
        ) : (
          <div className="divide-y divide-neutral-100">
            {prioridad.map((p, i) => (
              <Link
                key={p.id}
                href={`/productores/${p.id}`}
                className="flex items-center justify-between gap-4 py-2.5 transition-colors hover:bg-amber-50/60"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-800">{p.razon_social}</p>
                    <p className="text-xs text-neutral-500">{p.comuna ?? "Sin comuna"}</p>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-medium tabular-nums text-amber-700">
                  {p.kilos.toLocaleString("es-CL")} kg
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
