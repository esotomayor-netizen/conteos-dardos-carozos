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
