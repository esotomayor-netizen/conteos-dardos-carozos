"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { KanbanColumn } from "@/components/pipeline/KanbanColumn";
import { TarjetaProductor } from "@/components/pipeline/TarjetaProductor";
import { RegistrarContactoModal } from "@/components/pipeline/RegistrarContactoModal";
import { COLUMNAS_PIPELINE, COLUMNA_NO_RECIBE_DROP, type ColumnaPipeline, type ProductorPipeline } from "@/lib/pipeline";
import type { EstadoSeguimiento } from "@/lib/types";
import type { AgronomoRaw } from "@/lib/dashboard-metrics";

export function KanbanBoard({
  productoresIniciales,
  agronomos,
}: {
  productoresIniciales: ProductorPipeline[];
  agronomos: AgronomoRaw[];
}) {
  const [productores, setProductores] = useState(productoresIniciales);
  const [agronomoFiltro, setAgronomoFiltro] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [pendingMove, setPendingMove] = useState<{ productor: ProductorPipeline; columnaDestino: EstadoSeguimiento } | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const visibles = agronomoFiltro == null ? productores : productores.filter((p) => p.agronomo_id === agronomoFiltro);

  const porColumna = useMemo(() => {
    const map = new Map<ColumnaPipeline, ProductorPipeline[]>();
    for (const col of COLUMNAS_PIPELINE) map.set(col.id, []);
    for (const p of visibles) map.get(p.columna)?.push(p);
    return map;
  }, [visibles]);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as number);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const columnaDestino = over.id as ColumnaPipeline;
    if (columnaDestino === COLUMNA_NO_RECIBE_DROP) return;
    const productor = productores.find((p) => p.id === active.id);
    if (!productor || productor.columna === columnaDestino) return;
    setPendingMove({ productor, columnaDestino: columnaDestino as EstadoSeguimiento });
  }

  const activo = activeId != null ? productores.find((p) => p.id === activeId) : null;
  const kilosPorColumna = (lista: ProductorPipeline[]) => lista.reduce((sum, p) => sum + p.kilos, 0);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        <button
          onClick={() => setAgronomoFiltro(null)}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
            agronomoFiltro == null
              ? "border-emerald-600 bg-emerald-600 text-white"
              : "border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300 hover:text-emerald-700"
          }`}
        >
          Todo el equipo
        </button>
        {agronomos.map((a) => (
          <button
            key={a.id}
            onClick={() => setAgronomoFiltro(a.id)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              agronomoFiltro === a.id
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300 hover:text-emerald-700"
            }`}
          >
            {a.nombre}
          </button>
        ))}
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {COLUMNAS_PIPELINE.map((col) => {
            const lista = porColumna.get(col.id) ?? [];
            return (
              <KanbanColumn
                key={col.id}
                id={col.id}
                label={col.label}
                accent={col.accent}
                header={col.header}
                productores={lista}
                kilosTotal={kilosPorColumna(lista)}
                disabled={col.id === COLUMNA_NO_RECIBE_DROP}
              />
            );
          })}
        </div>
        <DragOverlay>
          {activo ? (
            <div className="w-60">
              <TarjetaProductor productor={activo} dragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {pendingMove && (
        <RegistrarContactoModal
          productor={pendingMove.productor}
          columnaDestino={pendingMove.columnaDestino}
          agronomos={agronomos}
          onCancel={() => setPendingMove(null)}
          onSaved={(nuevoAgronomoId) => {
            const { productor, columnaDestino } = pendingMove;
            setProductores((prev) =>
              prev.map((p) =>
                p.id === productor.id
                  ? {
                      ...p,
                      columna: columnaDestino,
                      agronomo_id: nuevoAgronomoId ?? p.agronomo_id,
                      ultimaFecha: new Date().toISOString().slice(0, 10),
                    }
                  : p
              )
            );
            setPendingMove(null);
          }}
        />
      )}
    </div>
  );
}
