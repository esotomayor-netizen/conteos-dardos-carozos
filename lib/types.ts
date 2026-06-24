import { z } from "zod";

export const TIPOS_ESTRUCTURA = ["dardo", "carozo", "brote", "flor", "vegetativo"] as const;
export type TipoEstructura = (typeof TIPOS_ESTRUCTURA)[number];

export const parcelaSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  ubicacion: z.string().optional(),
  especie: z.string().optional(),
});

export const arbolSchema = z.object({
  parcela_id: z.coerce.number().int().positive(),
  codigo: z.string().min(1, "El código es obligatorio"),
  variedad: z.string().optional(),
});

export const ramaSchema = z.object({
  arbol_id: z.coerce.number().int().positive(),
  codigo: z.string().min(1, "El código es obligatorio"),
  longitud_cm: z.coerce.number().positive().optional(),
});

export const conteoSchema = z.object({
  rama_id: z.coerce.number().int().positive(),
  tipo_estructura: z.enum(TIPOS_ESTRUCTURA),
  cantidad: z.coerce.number().int().min(0),
  fecha: z.string().optional(),
  notas: z.string().optional(),
});

export type Parcela = {
  id: number;
  nombre: string;
  ubicacion: string | null;
  especie: string | null;
  created_at: string;
};

export type Arbol = {
  id: number;
  parcela_id: number;
  codigo: string;
  variedad: string | null;
  created_at: string;
};

export type Rama = {
  id: number;
  arbol_id: number;
  codigo: string;
  longitud_cm: string | null;
  created_at: string;
};

export type Conteo = {
  id: number;
  rama_id: number;
  tipo_estructura: TipoEstructura;
  cantidad: number;
  fecha: string;
  notas: string | null;
  created_at: string;
};

export const ESTADOS_CONTACTO = [
  "sin_contactar",
  "contactado",
  "en_negociacion",
  "proveedor_activo",
  "descartado",
] as const;
export type EstadoContacto = (typeof ESTADOS_CONTACTO)[number];

export const ESTADOS_CONTACTO_LABEL: Record<EstadoContacto, string> = {
  sin_contactar: "Sin contactar",
  contactado: "Contactado",
  en_negociacion: "En negociación",
  proveedor_activo: "Proveedor activo",
  descartado: "Descartado",
};

export const predioProspeccionSchema = z.object({
  nombre_propietario: z.string().min(1, "El nombre del propietario es obligatorio"),
  rut: z.string().optional(),
  region: z.string().min(1, "La región es obligatoria"),
  comuna: z.string().optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  especie: z.string().min(1, "La especie es obligatoria"),
  variedad: z.string().optional(),
  hectareas_aprox: z.coerce.number().positive().optional(),
  telefono: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  fuente: z.string().optional(),
  notas: z.string().optional(),
});

export const predioProspeccionEstadoSchema = z.object({
  estado_contacto: z.enum(ESTADOS_CONTACTO),
});

export type PredioProspeccion = {
  id: number;
  nombre_propietario: string;
  rut: string | null;
  region: string;
  comuna: string | null;
  lat: string | null;
  lng: string | null;
  especie: string;
  variedad: string | null;
  hectareas_aprox: string | null;
  telefono: string | null;
  email: string | null;
  fuente: string | null;
  estado_contacto: EstadoContacto;
  notas: string | null;
  created_at: string;
};
