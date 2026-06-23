import Link from "next/link";
import { getSql } from "@/lib/db";
import { ParcelaForm } from "@/components/ParcelaForm";
import { DeleteButton } from "@/components/DeleteButton";
import type { Parcela } from "@/lib/types";

export const dynamic = "force-dynamic";

const COORDENADAS_REGEX = /^-?\d{1,3}(\.\d+)?,\s*-?\d{1,3}(\.\d+)?$/;

export default async function ParcelasPage() {
  const sql = getSql();
  const parcelas = (await sql`select * from parcelas order by created_at desc`) as Parcela[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Parcelas</h1>
      <ParcelaForm />
      <div className="rounded-lg border border-neutral-200 bg-white divide-y">
        {parcelas.length === 0 && <p className="p-4 text-neutral-500">No hay parcelas registradas.</p>}
        {parcelas.map((p) => (
          <div key={p.id} className="p-4 flex items-center justify-between">
            <div>
              <Link href={`/arboles?parcela_id=${p.id}`} className="font-medium hover:underline">
                {p.nombre}
              </Link>
              <p className="text-sm text-neutral-500">
                {p.especie ?? "Sin especie"} ·{" "}
                {p.ubicacion && COORDENADAS_REGEX.test(p.ubicacion.trim()) ? (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(p.ubicacion)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    📍 {p.ubicacion}
                  </a>
                ) : (
                  p.ubicacion ?? "Sin ubicación"
                )}
              </p>
            </div>
            <DeleteButton url={`/api/parcelas/${p.id}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
