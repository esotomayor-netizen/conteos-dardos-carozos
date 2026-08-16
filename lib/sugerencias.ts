import {
  ESTADOS_FINALES,
  ultimoPorProductorMap,
  type AgronomoRaw,
  type CultivoRaw,
  type ProductorRaw,
  type SeguimientoRaw,
} from "@/lib/dashboard-metrics";

export type MotivoSugerencia = "vencido" | "sin_seguimiento_agendado" | "sin_contactar";

export const ORDEN_MOTIVO: Record<MotivoSugerencia, number> = {
  vencido: 0,
  sin_seguimiento_agendado: 1,
  sin_contactar: 2,
};

export type SugerenciaContacto = {
  productorId: number;
  razonSocial: string;
  comuna: string | null;
  telefono: string | null;
  email: string | null;
  kilos: number;
  especies: string[];
  kilosPorEspecie: Record<string, number>;
  motivo: MotivoSugerencia;
  ultimaFecha: string | null;
  proximoSeguimientoVencido: string | null;
  asignadoOriginalmente: boolean;
};

export type PropuestaPorAgronomo = {
  agronomo: AgronomoRaw;
  sugerencias: SugerenciaContacto[];
  kilosEnJuego: number;
};

export type PropuestaSugerencias = {
  porAgronomo: PropuestaPorAgronomo[];
  sinAgronomosDisponibles: SugerenciaContacto[];
  /** Especies presentes en la propuesta, ordenadas por kilos totales en juego (mayor a menor). */
  especiesDisponibles: string[];
};

type ProductorConContacto = ProductorRaw & {
  dueno_telefono: string | null;
  dueno_email: string | null;
};

export function generarPropuestaSugerencias(
  productores: ProductorConContacto[],
  cultivos: CultivoRaw[],
  seguimientos: SeguimientoRaw[],
  agronomos: AgronomoRaw[]
): PropuestaSugerencias {
  const especiesPorProductor = new Map<number, string[]>();
  const kilosPorProductor = new Map<number, number>();
  const kilosPorEspeciePorProductor = new Map<number, Record<string, number>>();
  for (const c of cultivos) {
    const arr = especiesPorProductor.get(c.productor_id) ?? [];
    if (!arr.includes(c.especie)) arr.push(c.especie);
    especiesPorProductor.set(c.productor_id, arr);
    kilosPorProductor.set(c.productor_id, (kilosPorProductor.get(c.productor_id) ?? 0) + (c.kilos ?? 0));

    const porEspecie = kilosPorEspeciePorProductor.get(c.productor_id) ?? {};
    porEspecie[c.especie] = (porEspecie[c.especie] ?? 0) + (c.kilos ?? 0);
    kilosPorEspeciePorProductor.set(c.productor_id, porEspecie);
  }

  const ultimoPorProductor = ultimoPorProductorMap(seguimientos);
  const hoy = new Date().toISOString().slice(0, 10);

  // Candidatos: falta contactar, la fecha prometida ya pasó, o quedó "abierto" sin próxima fecha agendada.
  const candidatos: SugerenciaContacto[] = [];
  for (const p of productores) {
    const ultimo = ultimoPorProductor.get(p.id);
    let motivo: MotivoSugerencia | null = null;
    let proximoVencido: string | null = null;

    if (!ultimo) {
      motivo = "sin_contactar";
    } else if (!ESTADOS_FINALES.includes(ultimo.estado)) {
      if (ultimo.proximo_seguimiento && ultimo.proximo_seguimiento < hoy) {
        motivo = "vencido";
        proximoVencido = ultimo.proximo_seguimiento;
      } else if (!ultimo.proximo_seguimiento) {
        motivo = "sin_seguimiento_agendado";
      }
    }

    if (!motivo) continue;

    candidatos.push({
      productorId: p.id,
      razonSocial: p.razon_social,
      comuna: p.comuna,
      telefono: p.dueno_telefono,
      email: p.dueno_email,
      kilos: kilosPorProductor.get(p.id) ?? 0,
      especies: especiesPorProductor.get(p.id) ?? [],
      kilosPorEspecie: kilosPorEspeciePorProductor.get(p.id) ?? {},
      motivo,
      ultimaFecha: ultimo?.fecha ?? null,
      proximoSeguimientoVencido: proximoVencido,
      asignadoOriginalmente: p.agronomo_id != null,
    });
  }

  candidatos.sort((a, b) => ORDEN_MOTIVO[a.motivo] - ORDEN_MOTIVO[b.motivo] || b.kilos - a.kilos);

  const kilosTotalesPorEspecie = new Map<string, number>();
  for (const c of candidatos) {
    for (const [especie, kilos] of Object.entries(c.kilosPorEspecie)) {
      kilosTotalesPorEspecie.set(especie, (kilosTotalesPorEspecie.get(especie) ?? 0) + kilos);
    }
  }
  const especiesDisponibles = [...kilosTotalesPorEspecie.entries()].sort((a, b) => b[1] - a[1]).map(([especie]) => especie);

  if (agronomos.length === 0) {
    return { porAgronomo: [], sinAgronomosDisponibles: candidatos, especiesDisponibles };
  }

  // Cobertura actual por comuna: qué agrónomo ya atiende más productores en cada comuna,
  // para asignar los productores sin agrónomo al que le queda geográficamente más cerca.
  const coberturaComuna = new Map<string, Map<number, number>>();
  const kilosPorAgronomo = new Map<number, number>();
  for (const a of agronomos) kilosPorAgronomo.set(a.id, 0);
  for (const p of productores) {
    if (p.agronomo_id == null) continue;
    kilosPorAgronomo.set(p.agronomo_id, (kilosPorAgronomo.get(p.agronomo_id) ?? 0) + (kilosPorProductor.get(p.id) ?? 0));
    if (!p.comuna) continue;
    const porAgronomo = coberturaComuna.get(p.comuna) ?? new Map<number, number>();
    porAgronomo.set(p.agronomo_id, (porAgronomo.get(p.agronomo_id) ?? 0) + 1);
    coberturaComuna.set(p.comuna, porAgronomo);
  }

  const idProductorAAgronomo = new Map<number, number>();
  for (const p of productores) {
    if (p.agronomo_id != null) idProductorAAgronomo.set(p.id, p.agronomo_id);
  }

  function agronomoConMenosCarga(): number {
    let mejor = agronomos[0].id;
    let mejorKilos = Infinity;
    for (const a of agronomos) {
      const k = kilosPorAgronomo.get(a.id) ?? 0;
      if (k < mejorKilos) {
        mejorKilos = k;
        mejor = a.id;
      }
    }
    return mejor;
  }

  const listasPorAgronomo = new Map<number, SugerenciaContacto[]>();
  for (const a of agronomos) listasPorAgronomo.set(a.id, []);

  for (const c of candidatos) {
    let agronomoId = idProductorAAgronomo.get(c.productorId);
    if (agronomoId == null) {
      const porComuna = c.comuna ? coberturaComuna.get(c.comuna) : undefined;
      if (porComuna && porComuna.size > 0) {
        agronomoId = [...porComuna.entries()].sort((a, b) => b[1] - a[1])[0][0];
      } else {
        agronomoId = agronomoConMenosCarga();
      }
      kilosPorAgronomo.set(agronomoId, (kilosPorAgronomo.get(agronomoId) ?? 0) + c.kilos);
    }
    listasPorAgronomo.get(agronomoId)?.push(c);
  }

  const porAgronomo: PropuestaPorAgronomo[] = agronomos.map((agronomo) => {
    const sugerencias = listasPorAgronomo.get(agronomo.id) ?? [];
    return {
      agronomo,
      sugerencias,
      kilosEnJuego: sugerencias.reduce((sum, s) => sum + s.kilos, 0),
    };
  });

  return { porAgronomo, sinAgronomosDisponibles: [], especiesDisponibles };
}
