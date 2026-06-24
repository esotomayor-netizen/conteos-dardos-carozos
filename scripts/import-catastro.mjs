// Importa un catastro frutícola (formato SAG: comuna, razón social, dirección, referencia,
// dirección postal, comuna postal, rol, celular, mail, especie, ha especie, ha total predio)
// a la tabla predios_prospeccion.
//
// Uso:
//   DATABASE_URL=... node scripts/import-catastro.mjs <archivo.xlsx> "<Región>" [hoja]
//
// Ejemplo:
//   DATABASE_URL=... node scripts/import-catastro.mjs catastro_VI_region.xlsx \
//     "Libertador General Bernardo O'Higgins"

import { neon } from "@neondatabase/serverless";
import XLSX from "xlsx";

// Centroides aproximados de comunas (no hay coordenadas por predio en el catastro).
const CENTROIDES_COMUNA = {
  CHEPICA: [-34.685, -71.2747],
  CHIMBARONGO: [-34.7228, -71.0292],
  CODEGUA: [-34.0394, -70.9678],
  COINCO: [-34.1894, -71.1322],
  COLTAUCO: [-34.2814, -71.1075],
  DONIHUE: [-34.1167, -70.9667],
  GRANEROS: [-34.0667, -70.7333],
  "LA ESTRELLA": [-34.1928, -71.6433],
  "LAS CABRAS": [-34.2978, -71.2733],
  LOLOL: [-34.6386, -71.5197],
  MACHALI: [-34.1814, -70.65],
  MALLOA: [-34.4333, -71.0833],
  MARCHIGUE: [-34.3833, -71.6333],
  MOSTAZAL: [-33.9833, -70.7167],
  NANCAGUA: [-34.65, -71.2167],
  NAVIDAD: [-33.955, -71.8489],
  OLIVAR: [-34.0167, -71.1167],
  PALMILLA: [-34.6167, -71.3333],
  PAREDONES: [-34.6667, -71.8667],
  PERALILLO: [-34.55, -71.3167],
  PEUMO: [-34.4, -71.1667],
  PICHIDEGUA: [-34.3667, -71.3],
  PICHILEMU: [-34.3833, -72.0],
  PLACILLA: [-34.5167, -70.9667],
  PUMANQUE: [-34.6167, -71.5833],
  "QUINTA DE TILCOCO": [-34.3083, -70.9417],
  RANCAGUA: [-34.1708, -70.7444],
  RENGO: [-34.4061, -70.8631],
  REQUINOA: [-34.2789, -70.8158],
  "SAN FERNANDO": [-34.5856, -70.9889],
  "SAN VICENTE": [-34.4486, -71.0631],
  "SANTA CRUZ": [-34.6383, -71.3667],
};

const FUENTE = "Catastro Frutícola SAG";
const LOTE = 500;

function limpiar(valor) {
  if (valor === undefined || valor === null) return null;
  const texto = String(valor).trim();
  return texto.length > 0 ? texto : null;
}

function numero(valor) {
  if (valor === undefined || valor === null || valor === "") return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

async function main() {
  const [archivo, region, hoja] = process.argv.slice(2);
  if (!archivo || !region) {
    console.error('Uso: node scripts/import-catastro.mjs <archivo.xlsx> "<Región>" [hoja]');
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error("Falta la variable de entorno DATABASE_URL");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const workbook = XLSX.readFile(archivo);
  const nombreHoja = hoja || workbook.SheetNames[0];
  const worksheet = workbook.Sheets[nombreHoja];
  if (!worksheet) {
    console.error(`No se encontró la hoja "${nombreHoja}". Hojas disponibles: ${workbook.SheetNames.join(", ")}`);
    process.exit(1);
  }

  const filas = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
  const datos = filas.slice(1); // saltar encabezado

  let lote = [];
  let insertados = 0;
  let sinComuna = 0;

  async function volcarLote() {
    if (lote.length === 0) return;
    const valores = [];
    const placeholders = lote.map((fila, i) => {
      const base = i * 18;
      valores.push(...fila);
      return `(${Array.from({ length: 18 }, (_, j) => `$${base + j + 1}`).join(", ")})`;
    });
    const texto = `
      insert into predios_prospeccion
        (nombre_propietario, rol, region, comuna, comuna_postal, direccion, referencia, direccion_postal,
         lat, lng, especie, hectareas_aprox, ha_total_predio, telefono, email, fuente, estado_contacto, notas)
      values ${placeholders.join(", ")}
    `;
    await sql.query(texto, valores);
    insertados += lote.length;
    lote = [];
  }

  for (const fila of datos) {
    const [
      comunaRaw,
      razonSocial,
      direccion,
      referencia,
      direccionPostal,
      comunaPostalRaw,
      rol,
      celular,
      ,
      ,
      mail,
      especie,
      haEspecie,
      haTotal,
    ] = fila;

    if (!razonSocial || !especie) continue;

    const comuna = limpiar(comunaRaw);
    const centroide = comuna ? CENTROIDES_COMUNA[comuna.toUpperCase()] : null;
    if (comuna && !centroide) sinComuna++;

    lote.push([
      limpiar(razonSocial),
      limpiar(rol),
      region,
      comuna,
      limpiar(comunaPostalRaw),
      limpiar(direccion),
      limpiar(referencia),
      limpiar(direccionPostal),
      centroide ? centroide[0] : null,
      centroide ? centroide[1] : null,
      limpiar(especie),
      numero(haEspecie),
      numero(haTotal),
      limpiar(celular),
      limpiar(mail),
      FUENTE,
      "sin_contactar",
      null,
    ]);

    if (lote.length >= LOTE) {
      await volcarLote();
      console.log(`Insertados: ${insertados}`);
    }
  }
  await volcarLote();

  console.log(`Importación completa. Total filas insertadas: ${insertados}`);
  if (sinComuna > 0) {
    console.log(`Aviso: ${sinComuna} fila(s) con comuna sin centroide conocido (quedaron sin lat/lng).`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
