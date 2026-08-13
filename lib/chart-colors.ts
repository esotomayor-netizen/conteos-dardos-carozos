import { CANALES_CONTACTO, CANAL_LABELS } from "@/lib/types";

// Paleta validada con el método de dataviz (CVD-safe, ver scripts/validate_palette.js).
// No generar tonos nuevos: asignar por orden fijo y, sobre 6 series, agrupar en "Otros".
export const CATEGORICAL = [
  "#2a78d6", // 1 azul
  "#eb6834", // 2 naranjo
  "#1baf7a", // 3 aqua
  "#eda100", // 4 amarillo
  "#e87ba4", // 5 magenta
  "#008300", // 6 verde
  "#4a3aa7", // 7 violeta
  "#e34948", // 8 rojo
] as const;

// Rampa secuencial (un solo hue) para escalas ordinales: etapas de embudo, tiers.
export const SEQUENTIAL_BLUE_ORDINAL = [
  "#86b6ef", // 250
  "#5598e7", // 350
  "#2a78d6", // 450
  "#1c5cab", // 550
  "#104281", // 650
] as const;

export const SEQUENTIAL_BLUE = "#2a78d6";

export const STATUS = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
} as const;

export const INK = {
  primary: "#0b0b0b",
  secondary: "#52514e",
  muted: "#898781",
  grid: "#e1e0d9",
};

export function colorFor(index: number): string {
  return CATEGORICAL[index % CATEGORICAL.length];
}

// Colores fijos por canal (keyeados por la etiqueta visible): no dependen del
// orden/ranking, así un canal siempre se ve del mismo color en todo el
// dashboard (global y por agrónomo).
export const CANAL_COLORS: Record<string, string> = Object.fromEntries(
  CANALES_CONTACTO.map((canal, i) => [CANAL_LABELS[canal], colorFor(i)])
);

// Construye un mapa label -> color a partir de un orden fijo (p.ej. el ranking
// global de especies), para reutilizar la misma identidad de color en vistas
// filtradas (por agrónomo) sin que un cambio de ranking repinte las barras.
export function buildColorMap(labelsInFixedOrder: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  labelsInFixedOrder.forEach((label, i) => {
    map[label] = colorFor(i);
  });
  return map;
}
