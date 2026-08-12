import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { productorUpdateSchema } from "@/lib/types";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sql = getSql();
  const [productor] = await sql`select * from productores where id = ${id}`;
  if (!productor) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json(productor);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const parsed = productorUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;
  const sql = getSql();
  const [productor] = await sql`
    update productores set
      razon_social = coalesce(${d.razon_social}, razon_social),
      codigo_sag = coalesce(${d.codigo_sag}, codigo_sag),
      dueno_nombre = coalesce(${d.dueno_nombre}, dueno_nombre),
      dueno_telefono = coalesce(${d.dueno_telefono}, dueno_telefono),
      dueno_email = coalesce(${d.dueno_email}, dueno_email),
      administrador_nombre = coalesce(${d.administrador_nombre}, administrador_nombre),
      administrador_telefono = coalesce(${d.administrador_telefono}, administrador_telefono),
      administrador_email = coalesce(${d.administrador_email}, administrador_email),
      region = coalesce(${d.region}, region),
      provincia = coalesce(${d.provincia}, provincia),
      comuna = coalesce(${d.comuna}, comuna),
      direccion = coalesce(${d.direccion}, direccion),
      agronomo_id = coalesce(${d.agronomo_id}, agronomo_id)
    where id = ${id}
    returning *
  `;
  if (!productor) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json(productor);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sql = getSql();
  await sql`delete from productores where id = ${id}`;
  return NextResponse.json({ ok: true });
}
