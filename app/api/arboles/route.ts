import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { arbolSchema } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parcelaId = searchParams.get("parcela_id");
  const sql = getSql();
  const arboles = parcelaId
    ? await sql`select * from arboles where parcela_id = ${parcelaId} order by codigo`
    : await sql`select * from arboles order by created_at desc`;
  return NextResponse.json(arboles);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = arbolSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { parcela_id, codigo, variedad } = parsed.data;
  const sql = getSql();
  const [arbol] = await sql`
    insert into arboles (parcela_id, codigo, variedad)
    values (${parcela_id}, ${codigo}, ${variedad ?? null})
    returning *
  `;
  return NextResponse.json(arbol, { status: 201 });
}
