export function BarList({
  items,
  colors,
  formatValue = (v) => v.toLocaleString("es-CL"),
  showPct = true,
  emptyMessage = "Sin datos todavía.",
  labelWidth = "w-32",
}: {
  items: { label: string; total: number; pct?: number }[];
  /** Un color fijo, un arreglo (por posición) o un mapa label→color (por identidad,
   * recomendado cuando la lista puede reordenarse o filtrarse, ej. por agrónomo). */
  colors: string[] | string | Record<string, string>;
  formatValue?: (v: number) => string;
  showPct?: boolean;
  emptyMessage?: string;
  labelWidth?: string;
}) {
  if (items.length === 0) return <p className="text-sm text-neutral-500">{emptyMessage}</p>;
  const max = Math.max(...items.map((i) => i.total), 1);

  return (
    <div className="space-y-2.5">
      {items.map((item, i) => {
        const color =
          typeof colors === "string"
            ? colors
            : Array.isArray(colors)
              ? colors[i % colors.length]
              : (colors[item.label] ?? "#898781");
        const width = item.total > 0 ? Math.max((item.total / max) * 100, 3) : 0;
        return (
          <div key={item.label} className="flex items-center gap-3">
            <span className={`${labelWidth} shrink-0 truncate text-sm text-neutral-700`} title={item.label}>
              {item.label}
            </span>
            <div className="h-2.5 flex-1 rounded-full bg-neutral-100">
              <div className="h-2.5 rounded-full" style={{ width: `${width}%`, backgroundColor: color }} />
            </div>
            <span className="w-24 shrink-0 text-right text-sm tabular-nums text-neutral-600">
              {formatValue(item.total)}
              {showPct && item.pct != null && <span className="text-neutral-400"> · {item.pct}%</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}
