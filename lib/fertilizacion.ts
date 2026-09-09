// Fórmulas de la "Estrategia de Fertilización de Poscosecha" (Garcés Fruit, Gerencia Agrícola, 2019)
// aplicada a cerezos. Cubre Nitrógeno y Potasio, que son los únicos elementos con fórmula de dosis
// explícita en el documento (Fósforo, Magnesio, Zinc y Boro solo se listan como elementos relevantes).

export const CONSTANTES_FERTILIZACION = {
  DEMANDA_N_POR_TON: 5.8, // Kg N2 / Ton fruta
  DEMANDA_K2O_POR_TON: 7.7, // Kg K2O / Ton fruta
  EXTRACCION_K2O_POR_TON: 2.7, // Kg K2O / Ton fruta
  PUREZA_UREA: 0.46, // Urea 46-0-0
  NOVATEC_CC_POR_KG_UREA: 13, // cc de Novatec One (inhibidor de nitrificación) por Kg de urea
  EFICIENCIA_N_DEFAULT: 0.5,
  EFICIENCIA_K_DEFAULT: 1,
  K_SUELO_UMBRAL_BAJO_PPM: 250, // < 250 ppm: aplicar Demanda de K
  K_SUELO_UMBRAL_ALTO_PPM: 350, // >= 350 ppm: no aplicar potasio
  CE_SUELO_UMBRAL: 2, // dS/m: define la fuente de potasio
} as const;

export type EstacionVariedad = "temprana" | "media-tardia";

// % de nitrógeno recomendado en pre vs. poscosecha según variedad (tabla "Parcialización del nitrógeno").
export const PARCIALIZACION_N: Record<EstacionVariedad, { precosecha: number; poscosecha: number; variedades: string }> = {
  temprana: { precosecha: 30, poscosecha: 70, variedades: "Royal Dawn, Glen Red, Royal Lee, Brooks" },
  "media-tardia": { precosecha: 50, poscosecha: 50, variedades: "Santina, Lapins, Bing, Rainier, Sweet Heart, Skeena, Regina, Kordia" },
};

export interface EntradaNitrogeno {
  produccionTonHa: number;
  nAplicadoPrecosechaKgHa: number;
  nResidualSueloMgKg: number; // mg/Kg del análisis de suelo; se multiplica x2 para obtener Kg N/ha disponibles
  nAguaKgHa: number;
  nMineralKgHa: number;
  eficiencia: number; // 0-1
}

export interface ResultadoNitrogeno {
  demandaTotalKgHa: number;
  dosisPoscosechaBrutaKgHa: number; // demanda total - N aplicado en precosecha
  nResidualSueloKgHa: number; // nResidualSueloMgKg x 2
  suministroKgHa: number; // nResidualSueloKgHa + agua + mineral
  dosisPoscosechaNetaKgHa: number; // dosis bruta - suministro (sin bajar de 0)
  dosisFinalKgHa: number; // dosis neta / eficiencia
  dosisUreaKgHa: number; // dosis final / 0.46
  novatecCcHa: number; // urea x 13 cc/Kg
}

export function calcularNitrogeno(input: EntradaNitrogeno): ResultadoNitrogeno {
  const { DEMANDA_N_POR_TON, PUREZA_UREA, NOVATEC_CC_POR_KG_UREA } = CONSTANTES_FERTILIZACION;

  const demandaTotalKgHa = input.produccionTonHa * DEMANDA_N_POR_TON;
  const dosisPoscosechaBrutaKgHa = demandaTotalKgHa - input.nAplicadoPrecosechaKgHa;
  const nResidualSueloKgHa = input.nResidualSueloMgKg * 2;
  const suministroKgHa = nResidualSueloKgHa + input.nAguaKgHa + input.nMineralKgHa;
  const dosisPoscosechaNetaKgHa = Math.max(dosisPoscosechaBrutaKgHa - suministroKgHa, 0);
  const eficiencia = input.eficiencia > 0 ? input.eficiencia : CONSTANTES_FERTILIZACION.EFICIENCIA_N_DEFAULT;
  const dosisFinalKgHa = dosisPoscosechaNetaKgHa / eficiencia;
  const dosisUreaKgHa = dosisFinalKgHa / PUREZA_UREA;
  const novatecCcHa = dosisUreaKgHa * NOVATEC_CC_POR_KG_UREA;

  return {
    demandaTotalKgHa,
    dosisPoscosechaBrutaKgHa,
    nResidualSueloKgHa,
    suministroKgHa,
    dosisPoscosechaNetaKgHa,
    dosisFinalKgHa,
    dosisUreaKgHa,
    novatecCcHa,
  };
}

export type EstrategiaPotasio = "demanda" | "extraccion" | "sin_aplicacion";
export type FuentePotasio = "K2SO4" | "KCl";

export interface EntradaPotasio {
  produccionTonHa: number;
  kSueloPpm: number;
  kAplicadoPrecosechaKgHa: number;
  ceSueloDsM: number | null; // dS/m, opcional: define la fuente recomendada
  eficiencia: number; // 0-1
}

export interface ResultadoPotasio {
  estrategia: EstrategiaPotasio;
  baseKgHa: number; // demanda o extracción total, antes de restar precosecha
  dosisBrutaKgHa: number; // base - K aplicado en precosecha (sin bajar de 0)
  dosisFinalKgHa: number; // dosis bruta / eficiencia
  fuenteRecomendada: FuentePotasio | null;
}

// El umbral entre "demanda" y "extracción" según la tabla original es < 250 ppm y 250-325 ppm,
// pero no define qué ocurre entre 325 y 350 ppm. Para no dejar un vacío, se aplica "extracción"
// en todo el rango 250-349 ppm, hasta el corte de "no aplicar" a partir de 350 ppm.
export function determinarEstrategiaPotasio(kSueloPpm: number): EstrategiaPotasio {
  const { K_SUELO_UMBRAL_BAJO_PPM, K_SUELO_UMBRAL_ALTO_PPM } = CONSTANTES_FERTILIZACION;
  if (kSueloPpm < K_SUELO_UMBRAL_BAJO_PPM) return "demanda";
  if (kSueloPpm < K_SUELO_UMBRAL_ALTO_PPM) return "extraccion";
  return "sin_aplicacion";
}

export function calcularPotasio(input: EntradaPotasio): ResultadoPotasio {
  const { DEMANDA_K2O_POR_TON, EXTRACCION_K2O_POR_TON, CE_SUELO_UMBRAL } = CONSTANTES_FERTILIZACION;

  const estrategia = determinarEstrategiaPotasio(input.kSueloPpm);
  const porTon = estrategia === "demanda" ? DEMANDA_K2O_POR_TON : estrategia === "extraccion" ? EXTRACCION_K2O_POR_TON : 0;
  const baseKgHa = input.produccionTonHa * porTon;
  const dosisBrutaKgHa = estrategia === "sin_aplicacion" ? 0 : Math.max(baseKgHa - input.kAplicadoPrecosechaKgHa, 0);
  const eficiencia = input.eficiencia > 0 ? input.eficiencia : CONSTANTES_FERTILIZACION.EFICIENCIA_K_DEFAULT;
  const dosisFinalKgHa = dosisBrutaKgHa / eficiencia;
  const fuenteRecomendada: FuentePotasio | null =
    input.ceSueloDsM == null ? null : input.ceSueloDsM > CE_SUELO_UMBRAL ? "K2SO4" : "KCl";

  return { estrategia, baseKgHa, dosisBrutaKgHa, dosisFinalKgHa, fuenteRecomendada };
}
