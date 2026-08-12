import { ESTADO_LABELS, type EstadoSeguimiento } from "@/lib/types";

const COLORS: Record<EstadoSeguimiento, string> = {
  pendiente: "bg-neutral-100 text-neutral-600",
  contactado: "bg-blue-100 text-blue-700",
  interesado: "bg-amber-100 text-amber-700",
  en_negociacion: "bg-purple-100 text-purple-700",
  cerrado_ganado: "bg-green-100 text-green-700",
  cerrado_perdido: "bg-red-100 text-red-700",
  sin_respuesta: "bg-neutral-200 text-neutral-500",
};

export function EstadoBadge({ estado }: { estado: EstadoSeguimiento }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${COLORS[estado]}`}>
      {ESTADO_LABELS[estado]}
    </span>
  );
}
