import { ESTADO_LABELS, type CanalContacto, type EstadoSeguimiento } from "@/lib/types";

export type ColumnaPipeline = "sin_contactar" | EstadoSeguimiento;

export const COLUMNAS_PIPELINE: { id: ColumnaPipeline; label: string; accent: string; header: string }[] = [
  { id: "sin_contactar", label: "Sin contactar", accent: "border-t-neutral-400", header: "bg-neutral-50 text-neutral-700" },
  { id: "pendiente", label: ESTADO_LABELS.pendiente, accent: "border-t-neutral-400", header: "bg-neutral-50 text-neutral-700" },
  { id: "contactado", label: ESTADO_LABELS.contactado, accent: "border-t-blue-500", header: "bg-blue-50 text-blue-800" },
  { id: "sin_respuesta", label: ESTADO_LABELS.sin_respuesta, accent: "border-t-neutral-400", header: "bg-neutral-50 text-neutral-700" },
  { id: "interesado", label: ESTADO_LABELS.interesado, accent: "border-t-amber-500", header: "bg-amber-50 text-amber-800" },
  { id: "en_negociacion", label: ESTADO_LABELS.en_negociacion, accent: "border-t-violet-500", header: "bg-violet-50 text-violet-800" },
  { id: "cerrado_ganado", label: ESTADO_LABELS.cerrado_ganado, accent: "border-t-emerald-500", header: "bg-emerald-50 text-emerald-800" },
  { id: "cerrado_perdido", label: ESTADO_LABELS.cerrado_perdido, accent: "border-t-red-500", header: "bg-red-50 text-red-800" },
];

// "Sin contactar" no es un estado real de seguimiento: no se puede arrastrar una
// tarjeta hacia ahí (no existe forma de "des-contactar" a alguien).
export const COLUMNA_NO_RECIBE_DROP: ColumnaPipeline = "sin_contactar";

export function estadoActualDe(estado: EstadoSeguimiento | undefined): ColumnaPipeline {
  return estado ?? "sin_contactar";
}

export type ProductorPipeline = {
  id: number;
  razon_social: string;
  comuna: string | null;
  agronomo_id: number | null;
  agronomo_nombre: string | null;
  kilos: number;
  especies: string[];
  ultimaFecha: string | null;
  ultimoCanal: CanalContacto | null;
  columna: ColumnaPipeline;
};
