import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { agronomoSchema } from "@/lib/types";

export async function GET() {
  const sql = getSql();
  const agronomos = await sql`select * from agronomos order by nombre asc`;
  return NextResponse.json(agronomos);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = agronomoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { nombre, email, telefono } = parsed.data;
  const sql = getSql();
  const [agronomo] = await sql`
    insert into agronomos (nombre, email, telefono)
    values (${nombre}, ${email || null}, ${telefono || null})
    returning *
  `;
  return NextResponse.json(agronomo, { status: 201 });
}
