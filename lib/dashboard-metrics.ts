import { CANALES_CONTACTO, CANAL_LABELS, type CanalContacto, type EstadoSeguimiento } from "@/lib/types";

export type ProductorRaw = { id: number; razon_social: string; comuna: string | null; region: string | null; agronomo_id: number | null };
export type CultivoRaw = { productor_id: number; especie: string; kilos: number | null };
export type SeguimientoRaw = {
  id: number;
  productor_id: number;
  agronomo_id: number | null;
  canal: CanalContacto;
  estado: EstadoSeguimiento;
  fecha: string;
  proximo_seguimiento: string | null;
};
export type AgronomoRaw = { id: number; nombre: string };

export type ConteoPct = { label: string; total: number; pct: number };

export type DashboardMetrics = {
  kpis: {
    totalProductores: number;
    totalKilos: number;
    totalSeguimientos: number;
    productoresContactados: number;
    tasaContacto: number;
    vencidos: number;
    cerradosGanados: number;
  };
  canalGlobal: ConteoPct[];
  especieGlobal: ConteoPct[];
  funnel: { etapa: string; total: number; pct: number }[];
  cerradosPerdidos: number;
  ranking: {
    id: number;
    nombre: string;
    totalContactos: number;
    productoresContactados: number;
    productoresAsignados: number;
    kilosGestionados: number;
  }[];
  tendencia: { fecha: string; total: number }[];
  prioridad: { id: number; razon_social: string; comuna: string | null; kilos: number }[];
  porAgronomo: Record<
    number,
    {
      nombre: string;
      totalContactos: number;
      productoresContactados: number;
      productoresAsignados: number;
      canal: ConteoPct[];
      especie: ConteoPct[];
    }
  >;
};

const ETAPAS_CONTACTADO: EstadoSeguimiento[] = ["pendiente", "contactado", "sin_respuesta"];
const ESTADOS_FINALES: EstadoSeguimiento[] = ["cerrado_ganado", "cerrado_perdido"];

function pct(total: number, base: number): number {
  return base > 0 ? Math.round((total / base) * 1000) / 10 : 0;
}

// El último seguimiento (por fecha, y por id como desempate) de cada productor.
// Se usa para "estado actual" y para no considerar vencido un próximo
// seguimiento que ya quedó superado por un contacto más reciente.
export function ultimoPorProductorMap<T extends { productor_id: number; fecha: string; id: number }>(
  seguimientos: T[]
): Map<number, T> {
  const ordenados = [...seguimientos].sort((a, b) => a.fecha.localeCompare(b.fecha) || a.id - b.id);
  const map = new Map<number, T>();
  for (const s of ordenados) map.set(s.productor_id, s);
  return map;
}

function contarPorCanal(seguimientos: SeguimientoRaw[]): ConteoPct[] {
  const total = seguimientos.length;
  const counts = new Map<CanalContacto, number>();
  for (const s of seguimientos) counts.set(s.canal, (counts.get(s.canal) ?? 0) + 1);
  return CANALES_CONTACTO.map((c) => ({
    label: CANAL_LABELS[c],
    total: counts.get(c) ?? 0,
    pct: pct(counts.get(c) ?? 0, total),
  }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);
}

function contarPorEspecie(seguimientos: SeguimientoRaw[], especiesPorProductor: Map<number, string[]>): ConteoPct[] {
  const counts = new Map<string, number>();
  let total = 0;
  for (const s of seguimientos) {
    for (const especie of especiesPorProductor.get(s.productor_id) ?? []) {
      counts.set(especie, (counts.get(especie) ?? 0) + 1);
      total++;
    }
  }
  return [...counts.entries()]
    .map(([label, t]) => ({ label, total: t, pct: pct(t, total) }))
    .sort((a, b) => b.total - a.total);
}

export function computeDashboardMetrics(
  productores: ProductorRaw[],
  cultivos: CultivoRaw[],
  seguimientos: SeguimientoRaw[],
  agronomos: AgronomoRaw[]
): DashboardMetrics {
  const especiesPorProductor = new Map<number, string[]>();
  const kilosPorProductor = new Map<number, number>();
  for (const c of cultivos) {
    const arr = especiesPorProductor.get(c.productor_id) ?? [];
    if (!arr.includes(c.especie)) arr.push(c.especie);
    especiesPorProductor.set(c.productor_id, arr);
    kilosPorProductor.set(c.productor_id, (kilosPorProductor.get(c.productor_id) ?? 0) + (c.kilos ?? 0));
  }
  const totalKilos = cultivos.reduce((sum, c) => sum + (c.kilos ?? 0), 0);

  const ultimoPorProductor = ultimoPorProductorMap(seguimientos);
  const ultimos = [...ultimoPorProductor.values()];

  const productoresContactados = ultimoPorProductor.size;
  const hoy = new Date().toISOString().slice(0, 10);
  const vencidos = ultimos.filter(
    (s) => s.proximo_seguimiento && s.proximo_seguimiento <= hoy && !ESTADOS_FINALES.includes(s.estado)
  ).length;

  const cerradosGanados = ultimos.filter((s) => s.estado === "cerrado_ganado").length;
  const cerradosPerdidos = ultimos.filter((s) => s.estado === "cerrado_perdido").length;

  const sinContactar = productores.length - productoresContactados;
  const interesados = ultimos.filter((s) => s.estado === "interesado").length;
  const negociacion = ultimos.filter((s) => s.estado === "en_negociacion").length;
  const enProcesoInicial = ultimos.filter((s) => ETAPAS_CONTACTADO.includes(s.estado)).length;

  const baseFunnel = productores.length;
  const funnel = [
    { etapa: "Sin contactar", total: sinContactar },
    { etapa: "Contactados", total: enProcesoInicial + interesados + negociacion + cerradosGanados },
    { etapa: "Interesados", total: interesados + negociacion + cerradosGanados },
    { etapa: "En negociación", total: negociacion + cerradosGanados },
    { etapa: "Cerrado ganado", total: cerradosGanados },
  ].map((e) => ({ ...e, pct: pct(e.total, baseFunnel) }));

  const ranking = agronomos
    .map((a) => {
      const propios = seguimientos.filter((s) => s.agronomo_id === a.id);
      const productoresAsignados = productores.filter((p) => p.agronomo_id === a.id);
      return {
        id: a.id,
        nombre: a.nombre,
        totalContactos: propios.length,
        productoresContactados: new Set(propios.map((s) => s.productor_id)).size,
        productoresAsignados: productoresAsignados.length,
        kilosGestionados: productoresAsignados.reduce((sum, p) => sum + (kilosPorProductor.get(p.id) ?? 0), 0),
      };
    })
    .sort((a, b) => b.totalContactos - a.totalContactos);

  const porAgronomo: DashboardMetrics["porAgronomo"] = {};
  for (const a of ranking) {
    const propios = seguimientos.filter((s) => s.agronomo_id === a.id);
    porAgronomo[a.id] = {
      nombre: a.nombre,
      totalContactos: a.totalContactos,
      productoresContactados: a.productoresContactados,
      productoresAsignados: a.productoresAsignados,
      canal: contarPorCanal(propios),
      especie: contarPorEspecie(propios, especiesPorProductor),
    };
  }

  const DIAS_TENDENCIA = 90;
  const porDia = new Map<string, number>();
  for (const s of seguimientos) porDia.set(s.fecha, (porDia.get(s.fecha) ?? 0) + 1);
  const tendencia: { fecha: string; total: number }[] = [];
  for (let i = DIAS_TENDENCIA - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const fecha = d.toISOString().slice(0, 10);
    tendencia.push({ fecha, total: porDia.get(fecha) ?? 0 });
  }

  const contactadosSet = new Set(ultimoPorProductor.keys());
  const prioridad = productores
    .filter((p) => !contactadosSet.has(p.id))
    .map((p) => ({ id: p.id, razon_social: p.razon_social, comuna: p.comuna, kilos: kilosPorProductor.get(p.id) ?? 0 }))
    .sort((a, b) => b.kilos - a.kilos)
    .slice(0, 10);

  return {
    kpis: {
      totalProductores: productores.length,
      totalKilos,
      totalSeguimientos: seguimientos.length,
      productoresContactados,
      tasaContacto: pct(productoresContactados, productores.length),
      vencidos,
      cerradosGanados,
    },
    canalGlobal: contarPorCanal(seguimientos),
    especieGlobal: contarPorEspecie(seguimientos, especiesPorProductor),
    funnel,
    cerradosPerdidos,
    ranking,
    tendencia,
    prioridad,
    porAgronomo,
  };
}
