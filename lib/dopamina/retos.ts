// Banco de burbujas y armado del reto de Dopamina.
// Tres rondas: OBJETO (quién/qué, con artículo) → ACCIÓN (gerundio) →
// CIERRE (dónde/cuándo, invariante en género). La plantilla
// "Dibuja {objeto} {acción} {cierre}." es gramatical con CUALQUIER combinación.
//
// ⚠️ Reglas de curaduría (para que todo combine sin frases ilógicas):
// - Objetos sin estados que choquen con las acciones (nada de "dormida", etc.).
// - Acciones independientes del lugar (nada de "volando", "nadando"...):
//   leer, hornear o tejer funcionan en cualquier escenario sin absurdos.
// - Cierres solo de lugar/momento, sin género (evitan "rodeado/rodeada").
// - Vocabulario disjunto entre categorías: ninguna palabra clave se repite
//   (era lo que producía "una luna curiosa... en la luna").

import { OBJETOS, ACCIONES, CIERRES } from "./bancos";
import type { Burbuja, CategoriaBurbuja, Reto } from "./tipos";

// Las listas (~200+ por categoría) viven en bancos.ts y se validan con
// scripts/verifica-bancos.ts (conteos, duplicados y colisiones entre bancos).
const BANCOS: Record<CategoriaBurbuja, readonly string[]> = {
  objeto: OBJETOS,
  accion: ACCIONES,
  cierre: CIERRES,
};

// Orden de las rondas del juego.
export const RONDAS: { id: CategoriaBurbuja; etiqueta: string }[] = [
  { id: "objeto", etiqueta: "Objeto" },
  { id: "accion", etiqueta: "Acción" },
  { id: "cierre", etiqueta: "Cierre" },
];

// Lienzo del juego (rediseño ago-2026): un solo cielo azul con nubes en TODAS
// las fases — ya no hay cambio de color por ronda ni deriva en el reto.
export const FONDO_CIELO = "#2B7CE4";

// Para mostrar una palabra suelta (slots, revelación sobre la burbuja):
// primera letra en mayúscula. Dentro de la frase van en minúscula.
export function capitaliza(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function baraja<T>(arr: T[]): T[] {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// ── Memoria anti-repetición ──────────────────────────────────────────────
// Lo que ya le salió al jugador (palabras reveladas) se guarda en el
// dispositivo y se excluye de las próximas partidas, para que "una jirafa"
// no aparezca tres veces seguidas. Solo cliente (localStorage).
const KEY_RECIENTES = "papela_dopa_recientes";
const MAX_RECIENTES = 45; // ~15 partidas de historial (los bancos dan de sobra)

function leeRecientes(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const crudas = JSON.parse(window.localStorage.getItem(KEY_RECIENTES) ?? "[]");
    return Array.isArray(crudas) ? crudas.filter((t): t is string => typeof t === "string") : [];
  } catch {
    return [];
  }
}

// Llamar al completar el reto: las 3 palabras reveladas van al historial.
export function recuerdaSeleccion(burbujas: Burbuja[]) {
  if (typeof window === "undefined") return;
  try {
    const lista = [...new Set([...burbujas.map((b) => b.texto), ...leeRecientes()])].slice(0, MAX_RECIENTES);
    window.localStorage.setItem(KEY_RECIENTES, JSON.stringify(lista));
  } catch {
    // Sin storage (modo privado estricto): el juego sigue, solo sin memoria.
  }
}

// Opciones de una partida: `porCategoria` burbujas por banco, excluyendo lo
// reciente. Si el banco no alcanza tras excluir, se rellena con lo excluido.
export function generaOpciones(porCategoria = 9): Record<CategoriaBurbuja, Burbuja[]> {
  const recientes = new Set(leeRecientes());
  const opciones = {} as Record<CategoriaBurbuja, Burbuja[]>;
  for (const cat of Object.keys(BANCOS) as CategoriaBurbuja[]) {
    const frescas = BANCOS[cat].filter((t) => !recientes.has(t));
    const pool = frescas.length >= porCategoria ? frescas : [...frescas, ...BANCOS[cat].filter((t) => recientes.has(t))];
    opciones[cat] = baraja(pool)
      .slice(0, porCategoria)
      .map((texto) => ({ id: `${cat}:${texto}`, texto, categoria: cat }));
  }
  return opciones;
}

export function armaReto(seleccion: Burbuja[]): Reto {
  const por = (cat: CategoriaBurbuja) => seleccion.find((b) => b.categoria === cat);
  const objeto = por("objeto");
  const accion = por("accion");
  const cierre = por("cierre");
  const frase =
    objeto && accion && cierre
      ? `Dibuja ${objeto.texto} ${accion.texto} ${cierre.texto}.`
      : `Dibuja ${seleccion.map((b) => b.texto).join(" + ")}.`;
  return { burbujas: seleccion, frase };
}
