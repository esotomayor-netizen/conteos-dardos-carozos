// Importa data/productores.json (base de productores exportada desde Excel) a Neon Postgres.
// Uso: node --env-file=.env.local scripts/seed-crm.mjs
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("Falta DATABASE_URL. Ejecuta con: node --env-file=.env.local scripts/seed-crm.mjs");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "..", "data", "productores.json");

async function main() {
  const productores = JSON.parse(await readFile(dataPath, "utf-8"));

  let creados = 0;
  let actualizados = 0;
  let cultivosInsertados = 0;

  for (const p of productores) {
    const existentes = await sql`
      select id from productores where upper(razon_social) = upper(${p.razon_social}) limit 1
    `;

    let productorId;
    if (existentes.length > 0) {
      productorId = existentes[0].id;
      await sql`
        update productores set
          dueno_nombre = coalesce(${p.dueno_nombre}, dueno_nombre),
          dueno_telefono = coalesce(${p.dueno_telefono}, dueno_telefono),
          dueno_email = coalesce(${p.dueno_email}, dueno_email),
          administrador_nombre = coalesce(${p.administrador_nombre}, administrador_nombre),
          administrador_telefono = coalesce(${p.administrador_telefono}, administrador_telefono),
          administrador_email = coalesce(${p.administrador_email}, administrador_email),
          region = coalesce(${p.region}, region),
          provincia = coalesce(${p.provincia}, provincia),
          comuna = coalesce(${p.comuna}, comuna),
          direccion = coalesce(${p.direccion}, direccion)
        where id = ${productorId}
      `;
      actualizados++;
    } else {
      const [nuevo] = await sql`
        insert into productores (
          razon_social, dueno_nombre, dueno_telefono, dueno_email,
          administrador_nombre, administrador_telefono, administrador_email,
          region, provincia, comuna, direccion
        ) values (
          ${p.razon_social}, ${p.dueno_nombre}, ${p.dueno_telefono}, ${p.dueno_email},
          ${p.administrador_nombre}, ${p.administrador_telefono}, ${p.administrador_email},
          ${p.region}, ${p.provincia}, ${p.comuna}, ${p.direccion}
        )
        returning id
      `;
      productorId = nuevo.id;
      creados++;
    }

    // Reemplaza los cultivos del productor para evitar duplicados en reimportaciones.
    await sql`delete from productor_cultivos where productor_id = ${productorId}`;
    for (const c of p.cultivos) {
      await sql`
        insert into productor_cultivos (productor_id, especie, variedad, kilos)
        values (${productorId}, ${c.especie}, ${c.variedad}, ${c.kilos})
      `;
      cultivosInsertados++;
    }
  }

  console.log(`Productores creados: ${creados}`);
  console.log(`Productores actualizados: ${actualizados}`);
  console.log(`Cultivos insertados: ${cultivosInsertados}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
