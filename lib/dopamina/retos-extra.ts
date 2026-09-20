// Retos opcionales de Dopamina: una restricción creativa que el jugador PUEDE
// sumar a su combinación (objeto + acción + cierre) en la pantalla del reto.
// Son datos sueltos, separados de la lógica principal (retos.ts / bancos.ts):
// para ampliar la biblioteca basta con agregar, quitar o editar líneas aquí.
//
// ⚠️ Reglas de redacción (se ven después de "Reto:", en la tarjeta y en el
// cronómetro — el jugador los lee mientras dibuja):
// - Cada uno es una INSTRUCCIÓN en imperativo, nunca un sustantivo suelto
//   ("Puntillismo.") ni una narración ("Algo acaba de salir mal."): sin el
//   verbo se leen como etiqueta o como mensaje de error, no como algo que
//   hacer. Si el estilo tiene nombre técnico, va entre paréntesis al final.
// - Una sola idea por reto y corto: caben ~2 renglones en mobile.
// - Sirven con CUALQUIER combinación: nada que dependa de un objeto, una
//   acción o un lugar en particular.
// - Los que cambian el escenario arrancan con "Cambia el lugar/la época":
//   el cierre de la frase ya puso uno ("en un restaurante lujoso") y sin ese
//   aviso el reto se lee como contradicción en vez de como giro.
// - Sin choques entre retos: dibujar de una línea ya vive en "mano" como "No
//   levantes el lápiz", así que no se repite en "estilo".
// Correr `npx tsx scripts/verifica-bancos.ts` después de editar.

export type CategoriaRetoExtra = "mano" | "color" | "estilo" | "restriccion" | "caos";

export interface RetoExtra {
  id: string;
  texto: string;
  categoria: CategoriaRetoExtra;
}

export const RETOS_EXTRA: Record<CategoriaRetoExtra, { etiqueta: string; retos: readonly string[] }> = {
  mano: {
    etiqueta: "Mano y movimiento",
    retos: [
      "Dibuja con tu mano no dominante.",
      "No levantes el lápiz del papel: todo de una sola línea.",
      "Usa solo líneas rectas.",
      "Usa solo líneas curvas.",
      "Empieza por abajo y sube.",
      "Gira la hoja de lado y dibuja así.",
      "Empieza con una mano y cámbiala a la mitad.",
      "Empieza por los detalles y deja la silueta para el final.",
      "Que alguien más haga el primer trazo.",
    ],
  },
  color: {
    etiqueta: "Color",
    retos: [
      "Usa máximo 3 colores.",
      "Usa máximo 2 colores.",
      "Usa solo blanco y negro.",
      "Usa un solo color.",
      "Usa solo colores cálidos.",
      "Usa solo colores fríos.",
      "Usa solo colores primarios: rojo, azul y amarillo.",
      "Usa solo colores secundarios: verde, naranja y morado.",
      "No puedes usar negro.",
      "Píntalo con colores que no le tocan.",
    ],
  },
  estilo: {
    etiqueta: "Estilo",
    retos: [
      "Arma todo con puntitos, sin líneas (puntillismo).",
      "Hazlo como rayoneo de cuaderno (doodle).",
      "Hazlo minimalista: lo mínimo para que se entienda.",
      "Rompe todo en planos y caras, como el cubismo.",
      "Hazlo en caricatura, con los rasgos exagerados.",
      "Hazlo kawaii: todo redondito y tierno.",
      "Móntalo como viñeta de cómic, con su globo de diálogo.",
      "Hazlo en pixel art, cuadrito por cuadrito.",
      // Referencias de estilo, no de personaje: se pide el TRAZO, para que
      // sigan funcionando cuando el objeto ya es de esa casa (OBJETOS trae
      // personajes de Disney/Pixar).
      "Hazlo con el trazo de una peli de Disney.",
      "Hazlo con el aire de una peli de Ghibli.",
      "Hazlo como escena de videojuego.",
      "Hazlo abstracto: que se sienta, no que se reconozca.",
      "Arma todo con figuras geométricas.",
      "Deja solo siluetas, sin detalle adentro.",
      "Sombrea todo con rayitas (hatching).",
    ],
  },
  restriccion: {
    etiqueta: "Restricciones",
    retos: [
      "No puedes borrar nada.",
      "Máximo 20 trazos.",
      "Que todo se toque: nada suelto en la hoja.",
      "Que todo quepa dentro de un círculo.",
      "Deja el centro de la hoja vacío.",
      "Exagera una parte y deja el resto normal.",
      "Haz una parte enorme y todo lo demás diminuto.",
      "No cierres ninguna figura: déjalas todas abiertas.",
    ],
  },
  caos: {
    etiqueta: "Caos / sorpresa",
    retos: [
      "Mete un gato en la escena.",
      "Haz que todo se vea triste.",
      "Cambia el lugar: que todo pase dentro de una taza.",
      "Agrega algo que no tenga nada que ver.",
      "Ponle cara a un objeto y vuélvelo personaje.",
      "Cambia la época: llévalo al futuro.",
      "Cambia la época: llévalo a la Edad Media.",
      "Cambia el lugar: que todo pase en la playa.",
      "Agrega comida a la escena.",
      "Haz que todo se vea exageradamente elegante.",
      "Cambia el lugar: que todo pase dentro de una caja diminuta.",
    ],
  },
};

// Lista plana con id estable (categoría + posición). El sorteo es uniforme
// sobre TODOS los retos: una categoría con más entradas sale más seguido.
const TODOS: RetoExtra[] = (Object.keys(RETOS_EXTRA) as CategoriaRetoExtra[]).flatMap((categoria) =>
  RETOS_EXTRA[categoria].retos.map((texto, i) => ({ id: `${categoria}:${i}`, texto, categoria }))
);

// Sortea un reto distinto al anterior (`evitaId`): ni "Cambiar reto" ni una
// partida nueva repiten el que acaba de salir.
export function sorteaRetoExtra(evitaId?: string | null): RetoExtra {
  const pool = TODOS.length > 1 ? TODOS.filter((r) => r.id !== evitaId) : TODOS;
  return pool[Math.floor(Math.random() * pool.length)];
}
