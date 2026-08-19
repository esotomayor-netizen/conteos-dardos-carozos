import { z } from "zod";

// --- CRM de captación de productores ---

export const CANALES_CONTACTO = ["mail", "telefono", "visita", "whatsapp", "otro"] as const;
export type CanalContacto = (typeof CANALES_CONTACTO)[number];

export const ESTADOS_SEGUIMIENTO = [
  "pendiente",
  "contactado",
  "interesado",
  "en_negociacion",
  "cerrado_ganado",
  "cerrado_perdido",
  "sin_respuesta",
] as const;
export type EstadoSeguimiento = (typeof ESTADOS_SEGUIMIENTO)[number];

export const ESTADO_LABELS: Record<EstadoSeguimiento, string> = {
  pendiente: "Pendiente",
  contactado: "Contactado",
  interesado: "Interesado",
  en_negociacion: "En negociación",
  cerrado_ganado: "Cerrado (ganado)",
  cerrado_perdido: "Cerrado (perdido)",
  sin_respuesta: "Sin respuesta",
};

export const CANAL_LABELS: Record<CanalContacto, string> = {
  mail: "Mail",
  telefono: "Teléfono",
  visita: "Visita",
  whatsapp: "WhatsApp",
  otro: "Otro",
};

export const agronomoSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email().optional().or(z.literal("")),
  telefono: z.string().optional(),
});

export const productorSchema = z.object({
  razon_social: z.string().min(1, "La razón social es obligatoria"),
  codigo_sag: z.string().optional(),
  dueno_nombre: z.string().optional(),
  dueno_telefono: z.string().optional(),
  dueno_email: z.string().email().optional().or(z.literal("")),
  administrador_nombre: z.string().optional(),
  administrador_telefono: z.string().optional(),
  administrador_email: z.string().email().optional().or(z.literal("")),
  region: z.string().optional(),
  provincia: z.string().optional(),
  comuna: z.string().optional(),
  direccion: z.string().optional(),
  agronomo_id: z.coerce.number().int().positive().optional(),
});

export const productorUpdateSchema = productorSchema.partial();

export const seguimientoSchema = z.object({
  productor_id: z.coerce.number().int().positive(),
  agronomo_id: z.coerce.number().int().positive().optional(),
  canal: z.enum(CANALES_CONTACTO),
  estado: z.enum(ESTADOS_SEGUIMIENTO),
  fecha: z.string().optional(),
  proximo_seguimiento: z.string().optional(),
  notas: z.string().optional(),
});

export type Agronomo = {
  id: number;
  nombre: string;
  email: string | null;
  telefono: string | null;
  created_at: string;
};

export type Productor = {
  id: number;
  razon_social: string;
  codigo_sag: string | null;
  dueno_nombre: string | null;
  dueno_telefono: string | null;
  dueno_email: string | null;
  administrador_nombre: string | null;
  administrador_telefono: string | null;
  administrador_email: string | null;
  region: string | null;
  provincia: string | null;
  comuna: string | null;
  direccion: string | null;
  latitud: number | null;
  longitud: number | null;
  agronomo_id: number | null;
  created_at: string;
};

export type ProductorCultivo = {
  id: number;
  productor_id: number;
  especie: string;
  variedad: string | null;
  kilos: number | null;
  created_at: string;
};

export type Seguimiento = {
  id: number;
  productor_id: number;
  agronomo_id: number | null;
  canal: CanalContacto;
  estado: EstadoSeguimiento;
  fecha: string;
  proximo_seguimiento: string | null;
  notas: string | null;
  created_at: string;
};

export type ProductorZona = {
  id: number;
  razon_social: string;
  direccion: string | null;
  region: string;
  provincia: string;
  comuna: string;
  dueno_telefono: string | null;
  latitud: number | null;
  longitud: number | null;
  especies: string[];
};
