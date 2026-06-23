import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { conteoSchema } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ramaId = searchParams.get("rama_id");
  const sql = getSql();
  const conteos = ramaId
    ? await sql`select * from conteos where rama_id = ${ramaId} order by fecha desc, created_at desc`
    : await sql`select * from conteos order by fecha desc, created_at desc limit 200`;
  return NextResponse.json(conteos);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = conteoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { rama_id, tipo_estructura, cantidad, fecha, notas } = parsed.data;
  const sql = getSql();
  const [conteo] = fecha
    ? await sql`
        insert into conteos (rama_id, tipo_estructura, cantidad, fecha, notas)
        values (${rama_id}, ${tipo_estructura}, ${cantidad}, ${fecha}, ${notas ?? null})
        returning *
      `
    : await sql`
        insert into conteos (rama_id, tipo_estructura, cantidad, notas)
        values (${rama_id}, ${tipo_estructura}, ${cantidad}, ${notas ?? null})
        returning *
      `;
  return NextResponse.json(conteo, { status: 201 });
}
