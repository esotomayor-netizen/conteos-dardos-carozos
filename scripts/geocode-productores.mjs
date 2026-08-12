// Geocodifica las direcciones de los productores usando la API de Google Geocoding
// y guarda latitud/longitud en la base de datos, para mostrarlos en el mapa.
//
// Uso: node --env-file=.env.local scripts/geocode-productores.mjs
// Requiere DATABASE_URL y GOOGLE_MAPS_API_KEY (una API key con la Geocoding API habilitada).
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("Falta DATABASE_URL. Ejecuta con: node --env-file=.env.local scripts/geocode-productores.mjs");
  process.exit(1);
}
if (!process.env.GOOGLE_MAPS_API_KEY) {
  console.error("Falta GOOGLE_MAPS_API_KEY. Ejecuta con: node --env-file=.env.local scripts/geocode-productores.mjs");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const DELAY_MS = 150;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function construirDireccion(p) {
  const partes = [p.direccion, p.comuna, p.provincia, p.region, "Chile"].filter(Boolean);
  return partes.join(", ");
}

async function geocodificar(direccion) {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", direccion);
  url.searchParams.set("region", "cl");
  url.searchParams.set("key", API_KEY);

  const res = await fetch(url);
  const data = await res.json();

  if (data.status === "OK" && data.results.length > 0) {
    const { lat, lng } = data.results[0].geometry.location;
    return { lat, lng };
  }
  if (data.status === "OVER_QUERY_LIMIT" || data.status === "REQUEST_DENIED") {
    throw new Error(`Google Geocoding API: ${data.status} — ${data.error_message ?? "revisa tu API key/cuota"}`);
  }
  return null;
}

async function main() {
  const pendientes = await sql`
    select id, direccion, comuna, provincia, region
    from productores
    where latitud is null or longitud is null
    order by id
  `;

  console.log(`Productores sin coordenadas: ${pendientes.length}`);

  let geocodificados = 0;
  let sinResultado = 0;

  for (const p of pendientes) {
    const direccionCompleta = construirDireccion(p);
    if (!direccionCompleta) {
      sinResultado++;
      continue;
    }

    const resultado = await geocodificar(direccionCompleta);
    if (resultado) {
      await sql`
        update productores set latitud = ${resultado.lat}, longitud = ${resultado.lng}
        where id = ${p.id}
      `;
      geocodificados++;
      console.log(`OK  #${p.id}: ${direccionCompleta} -> ${resultado.lat}, ${resultado.lng}`);
    } else {
      sinResultado++;
      console.log(`--  #${p.id}: sin resultado (${direccionCompleta})`);
    }

    await sleep(DELAY_MS);
  }

  console.log(`\nGeocodificados: ${geocodificados}`);
  console.log(`Sin resultado: ${sinResultado}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
