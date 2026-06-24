import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { predioProspeccionEstadoSchema } from "@/lib/types";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const parsed = predioProspeccionEstadoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const sql = getSql();
  const [predio] = await sql`
    update predios_prospeccion
    set estado_contacto = ${parsed.data.estado_contacto}
    where id = ${id}
    returning *
  `;
  if (!predio) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json(predio);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sql = getSql();
  await sql`delete from predios_prospeccion where id = ${id}`;
  return NextResponse.json({ ok: true });
}
