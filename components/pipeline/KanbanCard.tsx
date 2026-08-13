"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { TarjetaProductor } from "@/components/pipeline/TarjetaProductor";
import type { ProductorPipeline } from "@/lib/pipeline";

export function KanbanCard({ productor }: { productor: ProductorPipeline }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: productor.id,
  });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`touch-none cursor-grab active:cursor-grabbing ${isDragging ? "opacity-30" : ""}`}
    >
      <TarjetaProductor productor={productor} />
    </div>
  );
}
