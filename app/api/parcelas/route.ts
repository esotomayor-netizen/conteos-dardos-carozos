import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { parcelaSchema } from "@/lib/types";

export async function GET() {
  const sql = getSql();
  const parcelas = await sql`select * from parcelas order by created_at desc`;
  return NextResponse.json(parcelas);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = parcelaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { nombre, ubicacion, especie } = parsed.data;
  const sql = getSql();
  const [parcela] = await sql`
    insert into parcelas (nombre, ubicacion, especie)
    values (${nombre}, ${ubicacion ?? null}, ${especie ?? null})
    returning *
  `;
  return NextResponse.json(parcela, { status: 201 });
}
