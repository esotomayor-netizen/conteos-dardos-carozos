import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";

export async function GET() {
  const sql = getSql();

  const porParcela = await sql`
    select p.id as parcela_id, p.nombre as parcela_nombre, c.tipo_estructura, sum(c.cantidad)::int as total
    from conteos c
    join ramas r on r.id = c.rama_id
    join arboles a on a.id = r.arbol_id
    join parcelas p on p.id = a.parcela_id
    group by p.id, p.nombre, c.tipo_estructura
    order by p.nombre, c.tipo_estructura
  `;

  const porArbol = await sql`
    select a.id as arbol_id, a.codigo as arbol_codigo, p.nombre as parcela_nombre, c.tipo_estructura, sum(c.cantidad)::int as total
    from conteos c
    join ramas r on r.id = c.rama_id
    join arboles a on a.id = r.arbol_id
    join parcelas p on p.id = a.parcela_id
    group by a.id, a.codigo, p.nombre, c.tipo_estructura
    order by p.nombre, a.codigo, c.tipo_estructura
  `;

  const totales = await sql`
    select tipo_estructura, sum(cantidad)::int as total, count(*)::int as registros
    from conteos
    group by tipo_estructura
    order by tipo_estructura
  `;

  return NextResponse.json({ porParcela, porArbol, totales });
}
