// Tipos compartidos de Dopamina, el juego creativo del Club Creativo.

export type CategoriaBurbuja = "objeto" | "accion" | "cierre";

export interface Burbuja {
  id: string;
  texto: string;
  categoria: CategoriaBurbuja;
}

export interface Reto {
  burbujas: Burbuja[];
  frase: string;
}

// Opciones de tiempo del reto. `valor`/`unidad` se pintan por separado en la
// tarjeta (número grande + etiqueta chica), por eso no basta con seg/60: la
// última opción se lee "1 hora", no "60 minutos".
export const DURACIONES = [
  { seg: 300, valor: "5", unidad: "minutos" },
  { seg: 600, valor: "10", unidad: "minutos" },
  { seg: 1200, valor: "20", unidad: "minutos" },
  { seg: 1800, valor: "30", unidad: "minutos" },
  { seg: 3600, valor: "1", unidad: "hora" },
] as const;
