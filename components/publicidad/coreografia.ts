import type { Transition, Variants } from "framer-motion";

// Coreografía de la info de un anuncio (oct-2026, a petición del dueño: el
// cambio se sentía como un fundido plano). Tres tiempos:
//   1. SALIDA (SALIDA_MS, antes del crossfade): todo se desvanece con un
//      desliz mínimo (el panel y el QR apenas hacia abajo).
//   2. Crossfade de la foto o video (CROSSFADE_MS).
//   3. ENTRADA, ya con la foto nueva casi entera: sube el panel, luego la
//      etiqueta, el título palabra por palabra, el subtítulo, fecha y precio,
//      con el QR subiendo junto al panel y "escaneándose" de arriba abajo.
// Solo se anima transform/opacity (la pantalla es 4K en un navegador de TV).
// Con prefers-reduced-motion todo es un fundido corto sin desplazamientos.

export const EASE_SALE = [0.16, 1, 0.3, 1] as const;
/** Ojo: cada salida fija TODOS los valores que la entrada animó (scale,
 *  rotate…); los que falten, framer los regresa de golpe al estado `oculto`.
 *  La salida es discreta (oct-2026, a petición del dueño: la primera versión
 *  "aventaba" las piezas): casi solo un fundido con un desliz de pocos px. */
const EASE_SALIDA = [0.4, 0, 0.2, 1] as const;
function sale(c: Cue, duracion = 0.4): Transition {
  return { duration: duracion, delay: c.salida ?? 0, ease: EASE_SALIDA };
}

/** Segundos desde que monta la capa nueva (= arranque del crossfade). */
export const T = {
  panel: 0.35,
  etiqueta: 0.6,
  titulo: 0.72,
  /** Entre palabra y palabra del título. */
  palabra: 0.07,
} as const;

export type Fase = "visible" | "salida";

/** Elemento que sube con fundido. `custom` = { delay, salida } (salida = retraso al irse). */
export function sube(reduced: boolean, distancia = 60): Variants {
  if (reduced) return fundido();
  return {
    oculto: { opacity: 0, y: distancia },
    visible: (c: Cue) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: c.delay, ease: EASE_SALE } }),
    salida: (c: Cue) => ({ opacity: 0, y: 12, transition: sale(c) }),
  };
}

/** Palabra del título: sale de detrás de una máscara (el span padre lleva overflow hidden). */
export function palabra(reduced: boolean): Variants {
  if (reduced) return fundido();
  return {
    oculto: { y: "112%", rotate: 4 },
    visible: (c: Cue) => ({ y: "0%", rotate: 0, transition: { duration: 0.85, delay: c.delay, ease: EASE_SALE } }),
    salida: (c: Cue) => ({ opacity: 0, y: "-14%", rotate: 0, transition: sale(c) }),
  };
}

/** Desde la izquierda (fecha, etiqueta). */
export function desliza(reduced: boolean): Variants {
  if (reduced) return fundido();
  return {
    oculto: { opacity: 0, x: -70 },
    visible: (c: Cue) => ({ opacity: 1, x: 0, transition: { duration: 0.75, delay: c.delay, ease: EASE_SALE } }),
    salida: (c: Cue) => ({ opacity: 0, x: -10, transition: sale(c) }),
  };
}

/** Pastilla del precio: aparece con un pequeño rebote. */
export function rebota(reduced: boolean): Variants {
  if (reduced) return fundido();
  return {
    oculto: { opacity: 0, scale: 0.55 },
    visible: (c: Cue) => ({ opacity: 1, scale: 1, transition: { type: "spring", stiffness: 260, damping: 15, delay: c.delay } as Transition }),
    salida: (c: Cue) => ({ opacity: 0, scale: 0.97, transition: sale(c) }),
  };
}

/** Línea decorativa de la etiqueta: crece de izquierda a derecha. */
export function crece(reduced: boolean): Variants {
  if (reduced) return fundido();
  return {
    oculto: { scaleX: 0 },
    visible: (c: Cue) => ({ scaleX: 1, transition: { duration: 0.7, delay: c.delay, ease: EASE_SALE } }),
    salida: (c: Cue) => ({ opacity: 0, scaleX: 1, transition: sale(c) }),
  };
}

/** El panel de color: sube desde abajo y se asienta; al irse se hunde. */
export function panel(reduced: boolean): Variants {
  if (reduced) return fundido();
  return {
    oculto: { opacity: 0, y: 240, scale: 0.94 },
    visible: (c: Cue) => ({ opacity: 1, y: 0, scale: 1, transition: { duration: 1, delay: c.delay, ease: EASE_SALE } }),
    salida: (c: Cue) => ({ opacity: 0, y: 24, scale: 1, transition: sale(c, 0.5) }),
  };
}

export type Cue = { delay: number; salida?: number };

function fundido(): Variants {
  return {
    oculto: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4, delay: 0.3 } },
    salida: { opacity: 0, transition: { duration: 0.25 } },
  };
}
