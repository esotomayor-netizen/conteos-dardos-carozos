import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { seguimientoSchema } from "@/lib/types";

export async function GET() {
  const sql = getSql();
  const seguimientos = await sql`
    select id, productor_id, agronomo_id, canal, estado, fecha::text as fecha,
           proximo_seguimiento::text as proximo_seguimiento, notas, created_at
    from seguimientos
    order by fecha desc, created_at desc
  `;
  return NextResponse.json(seguimientos);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = seguimientoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;
  const sql = getSql();
  const [seguimiento] = await sql`
    insert into seguimientos (productor_id, agronomo_id, canal, estado, fecha, proximo_seguimiento, notas)
    values (
      ${d.productor_id}, ${d.agronomo_id ?? null}, ${d.canal}, ${d.estado},
      ${d.fecha || new Date().toISOString().slice(0, 10)}, ${d.proximo_seguimiento || null}, ${d.notas || null}
    )
    returning id, productor_id, agronomo_id, canal, estado, fecha::text as fecha,
              proximo_seguimiento::text as proximo_seguimiento, notas, created_at
  `;
  return NextResponse.json(seguimiento, { status: 201 });
}
