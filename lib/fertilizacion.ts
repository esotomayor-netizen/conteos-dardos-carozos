// Fórmulas de la "Estrategia de Fertilización de Poscosecha" (Garcés Fruit, Gerencia Agrícola, 2019)
// aplicada a cerezos. Cubre Nitrógeno, Potasio, Fósforo y Magnesio, que son los elementos con
// fórmula de dosis explícita en el documento (Zinc y Boro solo se listan como elementos relevantes,
// sin fórmula de cálculo en ninguna de las 22 páginas).

export const CONSTANTES_FERTILIZACION = {
  DEMANDA_N_POR_TON: 5.8, // Kg N2 / Ton fruta
  DEMANDA_K2O_POR_TON: 7.7, // Kg K2O / Ton fruta
  EXTRACCION_K2O_POR_TON: 2.7, // Kg K2O / Ton fruta
  DEMANDA_P2O5_POR_TON: 1.4, // Kg P2O5 / Ton fruta
  EXTRACCION_P2O5_POR_TON: 0.5, // Kg P2O5 / Ton fruta
  EXTRACCION_MGO_POR_TON: 1.5, // Kg MgO / Ton fruta (cuando no corresponde aplicar K)
  DOSIS_MGO_PCT_DE_K2O: 0.2, // la dosis de Mg siempre es 20% de la dosis de K2O calculada
  PUREZA_UREA: 0.46, // Urea 46-0-0
  NOVATEC_CC_POR_KG_UREA: 13, // cc de Novatec One (inhibidor de nitrificación) por Kg de urea
  EFICIENCIA_N_DEFAULT: 0.5,
  EFICIENCIA_K_DEFAULT: 1,
  EFICIENCIA_P_DEFAULT: 1,
  K_SUELO_UMBRAL_BAJO_PPM: 250, // < 250 ppm: aplicar Demanda de K
  K_SUELO_UMBRAL_ALTO_PPM: 350, // >= 350 ppm: no aplicar potasio
  P_OLSEN_UMBRAL_BAJO_PPM: 30, // < 30 ppm: aplicar Demanda de P
  P_OLSEN_UMBRAL_ALTO_PPM: 39, // >= 39 ppm: no aplicar fósforo
  CE_SUELO_UMBRAL: 2, // dS/m: define la fuente de potasio
} as const;

// Tabla "Fertilización — no se aplicará la demanda de nutrientes cuando estos valores sean menores a"
// (Kg nutriente / ha), específica para cerezo.
export const NIVEL_MINIMO_CEREZO = {
  N2: 10,
  P2O5: 5,
  K2O: 10,
  MgO: 5,
} as const;

export type EstacionVariedad = "temprana" | "media-tardia";

// % de nitrógeno recomendado en pre vs. poscosecha según variedad (tabla "Parcialización del nitrógeno").
// Para K, P y Mg el documento indica 100% precosecha / 0% poscosecha para ambas estaciones.
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
  dosisFinalKgHa: number; // dosis neta / eficiencia, o 0 si queda bajo el nivel mínimo
  bajoNivelMinimo: boolean;
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
  const dosisCalculadaKgHa = dosisPoscosechaNetaKgHa / eficiencia;
  const bajoNivelMinimo = dosisCalculadaKgHa < NIVEL_MINIMO_CEREZO.N2;
  const dosisFinalKgHa = bajoNivelMinimo ? 0 : dosisCalculadaKgHa;
  const dosisUreaKgHa = dosisFinalKgHa / PUREZA_UREA;
  const novatecCcHa = dosisUreaKgHa * NOVATEC_CC_POR_KG_UREA;

  return {
    demandaTotalKgHa,
    dosisPoscosechaBrutaKgHa,
    nResidualSueloKgHa,
    suministroKgHa,
    dosisPoscosechaNetaKgHa,
    dosisFinalKgHa,
    bajoNivelMinimo,
    dosisUreaKgHa,
    novatecCcHa,
  };
}

export type EstrategiaNutriente = "demanda" | "extraccion" | "sin_aplicacion";
export type FuentePotasio = "K2SO4" | "KCl";

export interface EntradaPotasio {
  produccionTonHa: number;
  kSueloPpm: number;
  kAplicadoPrecosechaKgHa: number;
  ceSueloDsM: number | null; // dS/m, opcional: define la fuente recomendada
  eficiencia: number; // 0-1
}

export interface ResultadoPotasio {
  estrategia: EstrategiaNutriente;
  baseKgHa: number; // demanda o extracción total, antes de restar precosecha
  dosisBrutaKgHa: number; // base - K aplicado en precosecha (sin bajar de 0)
  dosisFinalKgHa: number; // dosis bruta / eficiencia, o 0 si queda bajo el nivel mínimo
  bajoNivelMinimo: boolean;
  fuenteRecomendada: FuentePotasio | null;
}

// El umbral entre "demanda" y "extracción" según la tabla original es < 250 ppm y 250-325 ppm,
// pero no define qué ocurre entre 325 y 350 ppm. Para no dejar un vacío, se aplica "extracción"
// en todo el rango 250-349 ppm, hasta el corte de "no aplicar" a partir de 350 ppm.
export function determinarEstrategiaPotasio(kSueloPpm: number): EstrategiaNutriente {
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
  const dosisCalculadaKgHa = dosisBrutaKgHa / eficiencia;
  const bajoNivelMinimo = dosisCalculadaKgHa < NIVEL_MINIMO_CEREZO.K2O;
  const dosisFinalKgHa = bajoNivelMinimo ? 0 : dosisCalculadaKgHa;
  const fuenteRecomendada: FuentePotasio | null =
    input.ceSueloDsM == null ? null : input.ceSueloDsM > CE_SUELO_UMBRAL ? "K2SO4" : "KCl";

  return { estrategia, baseKgHa, dosisBrutaKgHa, dosisFinalKgHa, bajoNivelMinimo, fuenteRecomendada };
}

export interface EntradaFosforo {
  produccionTonHa: number;
  pOlsenPpm: number;
  pAplicadoPrecosechaKgHa: number;
  eficiencia: number; // 0-1
}

export interface ResultadoFosforo {
  estrategia: EstrategiaNutriente;
  baseKgHa: number; // demanda o extracción total, antes de restar precosecha
  dosisBrutaKgHa: number; // base - P aplicado en precosecha (sin bajar de 0)
  dosisFinalKgHa: number; // dosis bruta / eficiencia, o 0 si queda bajo el nivel mínimo
  bajoNivelMinimo: boolean;
}

export function determinarEstrategiaFosforo(pOlsenPpm: number): EstrategiaNutriente {
  const { P_OLSEN_UMBRAL_BAJO_PPM, P_OLSEN_UMBRAL_ALTO_PPM } = CONSTANTES_FERTILIZACION;
  if (pOlsenPpm < P_OLSEN_UMBRAL_BAJO_PPM) return "demanda";
  if (pOlsenPpm < P_OLSEN_UMBRAL_ALTO_PPM) return "extraccion";
  return "sin_aplicacion";
}

export function calcularFosforo(input: EntradaFosforo): ResultadoFosforo {
  const { DEMANDA_P2O5_POR_TON, EXTRACCION_P2O5_POR_TON } = CONSTANTES_FERTILIZACION;

  const estrategia = determinarEstrategiaFosforo(input.pOlsenPpm);
  const porTon = estrategia === "demanda" ? DEMANDA_P2O5_POR_TON : estrategia === "extraccion" ? EXTRACCION_P2O5_POR_TON : 0;
  const baseKgHa = input.produccionTonHa * porTon;
  const dosisBrutaKgHa = estrategia === "sin_aplicacion" ? 0 : Math.max(baseKgHa - input.pAplicadoPrecosechaKgHa, 0);
  const eficiencia = input.eficiencia > 0 ? input.eficiencia : CONSTANTES_FERTILIZACION.EFICIENCIA_P_DEFAULT;
  const dosisCalculadaKgHa = dosisBrutaKgHa / eficiencia;
  const bajoNivelMinimo = dosisCalculadaKgHa < NIVEL_MINIMO_CEREZO.P2O5;
  const dosisFinalKgHa = bajoNivelMinimo ? 0 : dosisCalculadaKgHa;

  return { estrategia, baseKgHa, dosisBrutaKgHa, dosisFinalKgHa, bajoNivelMinimo };
}

export interface ResultadoMagnesio {
  origen: "porcentaje_de_k" | "extraccion_fruto"; // según si hay dosis de K o no
  dosisFinalKgHa: number; // 0 si queda bajo el nivel mínimo
  bajoNivelMinimo: boolean;
}

// La dosis de Mg siempre es 20% de la dosis de K2O ya calculada (después de su propio nivel
// mínimo). Cuando el Potasio a aplicar es cero (suelo con alto contenido de K), se usa en su
// lugar la Extracción de Magnesio del fruto (1,5 Kg MgO/Ton fruta).
export function calcularMagnesio(dosisFinalK2OKgHa: number, produccionTonHa: number): ResultadoMagnesio {
  const { EXTRACCION_MGO_POR_TON, DOSIS_MGO_PCT_DE_K2O } = CONSTANTES_FERTILIZACION;

  const origen: ResultadoMagnesio["origen"] = dosisFinalK2OKgHa > 0 ? "porcentaje_de_k" : "extraccion_fruto";
  const dosisCalculadaKgHa =
    origen === "porcentaje_de_k" ? dosisFinalK2OKgHa * DOSIS_MGO_PCT_DE_K2O : produccionTonHa * EXTRACCION_MGO_POR_TON;
  const bajoNivelMinimo = dosisCalculadaKgHa < NIVEL_MINIMO_CEREZO.MgO;
  const dosisFinalKgHa = bajoNivelMinimo ? 0 : dosisCalculadaKgHa;

  return { origen, dosisFinalKgHa, bajoNivelMinimo };
}
