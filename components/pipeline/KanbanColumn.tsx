"use client";

import { useDroppable } from "@dnd-kit/core";
import { KanbanCard } from "@/components/pipeline/KanbanCard";
import type { ColumnaPipeline, ProductorPipeline } from "@/lib/pipeline";

export function KanbanColumn({
  id,
  label,
  accent,
  header,
  productores,
  kilosTotal,
  disabled = false,
}: {
  id: ColumnaPipeline;
  label: string;
  accent: string;
  header: string;
  productores: ProductorPipeline[];
  kilosTotal: number;
  disabled?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id, disabled });

  return (
    <div className={`flex w-64 shrink-0 flex-col rounded-lg border border-t-4 ${accent} border-neutral-200 bg-neutral-50/60`}>
      <div className={`rounded-t-md px-3 py-2 ${header}`}>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs opacity-80">
          {productores.length} {productores.length === 1 ? "productor" : "productores"} · {kilosTotal.toLocaleString("es-CL")} kg
        </p>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 space-y-2 overflow-y-auto p-2 transition-colors ${isOver && !disabled ? "bg-emerald-100/50" : ""}`}
        style={{ maxHeight: "calc(100vh - 340px)", minHeight: 140 }}
      >
        {productores.length === 0 && <p className="p-2 text-center text-xs text-neutral-400">Sin productores</p>}
        {productores.map((p) => (
          <KanbanCard key={p.id} productor={p} />
        ))}
      </div>
    </div>
  );
}
