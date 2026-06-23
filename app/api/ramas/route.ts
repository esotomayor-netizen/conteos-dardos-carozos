import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { ramaSchema } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const arbolId = searchParams.get("arbol_id");
  const sql = getSql();
  const ramas = arbolId
    ? await sql`select * from ramas where arbol_id = ${arbolId} order by codigo`
    : await sql`select * from ramas order by created_at desc`;
  return NextResponse.json(ramas);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = ramaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { arbol_id, codigo, longitud_cm } = parsed.data;
  const sql = getSql();
  const [rama] = await sql`
    insert into ramas (arbol_id, codigo, longitud_cm)
    values (${arbol_id}, ${codigo}, ${longitud_cm ?? null})
    returning *
  `;
  return NextResponse.json(rama, { status: 201 });
}
