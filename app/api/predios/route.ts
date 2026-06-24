import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { predioProspeccionSchema } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region");
  const especie = searchParams.get("especie");
  const sql = getSql();
  const predios = await sql`
    select * from predios_prospeccion
    where (${region}::text is null or region = ${region})
      and (${especie}::text is null or especie = ${especie})
    order by created_at desc
  `;
  return NextResponse.json(predios);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = predioProspeccionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const {
    nombre_propietario,
    rut,
    region,
    comuna,
    lat,
    lng,
    especie,
    variedad,
    hectareas_aprox,
    telefono,
    email,
    fuente,
    notas,
  } = parsed.data;
  const sql = getSql();
  const [predio] = await sql`
    insert into predios_prospeccion
      (nombre_propietario, rut, region, comuna, lat, lng, especie, variedad, hectareas_aprox, telefono, email, fuente, notas)
    values
      (${nombre_propietario}, ${rut ?? null}, ${region}, ${comuna ?? null}, ${lat ?? null}, ${lng ?? null},
       ${especie}, ${variedad ?? null}, ${hectareas_aprox ?? null}, ${telefono ?? null}, ${email || null}, ${fuente ?? null}, ${notas ?? null})
    returning *
  `;
  return NextResponse.json(predio, { status: 201 });
}
