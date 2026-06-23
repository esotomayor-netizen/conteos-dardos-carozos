import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let cached: NeonQueryFunction<false, false> | null = null;

export function getSql() {
  if (!cached) {
    if (!process.env.DATABASE_URL) {
      throw new Error("Falta la variable de entorno DATABASE_URL (cadena de conexión de Neon)");
    }
    cached = neon(process.env.DATABASE_URL);
  }
  return cached;
}
