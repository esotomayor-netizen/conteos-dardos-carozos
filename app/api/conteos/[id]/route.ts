import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sql = getSql();
  await sql`delete from conteos where id = ${id}`;
  return NextResponse.json({ ok: true });
}
