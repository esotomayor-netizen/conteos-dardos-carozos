import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { productorSchema } from "@/lib/types";

export async function GET() {
  const sql = getSql();
  const productores = await sql`select * from productores order by razon_social asc`;
  return NextResponse.json(productores);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = productorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;
  const sql = getSql();
  const [productor] = await sql`
    insert into productores (
      razon_social, codigo_sag, dueno_nombre, dueno_telefono, dueno_email,
      administrador_nombre, administrador_telefono, administrador_email,
      region, provincia, comuna, direccion, agronomo_id
    ) values (
      ${d.razon_social}, ${d.codigo_sag || null}, ${d.dueno_nombre || null}, ${d.dueno_telefono || null}, ${d.dueno_email || null},
      ${d.administrador_nombre || null}, ${d.administrador_telefono || null}, ${d.administrador_email || null},
      ${d.region || null}, ${d.provincia || null}, ${d.comuna || null}, ${d.direccion || null}, ${d.agronomo_id ?? null}
    )
    returning *
  `;
  return NextResponse.json(productor, { status: 201 });
}
