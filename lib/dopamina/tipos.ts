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

export const DURACIONES = [
  { seg: 120, etiqueta: "2 minutos" },
  { seg: 300, etiqueta: "5 minutos" },
  { seg: 600, etiqueta: "10 minutos" },
] as const;
