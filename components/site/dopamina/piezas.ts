// Lo que comparten los óvalos punteados de Dopamina: los HUECOS de la pantalla
// de burbujas (SlotsRonda: se llenan al explotar) y las PIEZAS tocables de la
// pantalla del reto (FraseReto: se pueden volver a llenar). Mismo óvalo en las
// dos para que se lea como una sola cosa que viaja de una pantalla a la otra.

import { useLayoutEffect, type RefObject } from "react";

// Óvalo: todo en em, para que el aire escale con la letra. Siempre un renglón.
// El aire de ARRIBA es mayor que el de abajo a propósito: la caja de línea de
// la serif reserva sitio para descendentes (g, j, p) que la mayoría de las
// piezas casi no usa, así que con aire parejo el texto se veía subido. Con
// 0.44/0.30 la tinta queda centrada a la vista.
export const OVALO =
  "whitespace-nowrap rounded-full border border-dashed px-[0.95em] pt-[0.44em] pb-[0.3em] leading-[1.15]";

// Autoajuste de un stack de óvalos: si el más ancho (los que lleven
// `data-pieza`) no cabe en el renglón, baja el font-size del contenedor lo
// justo — todos juntos, para que sigan parejos. Hace falta porque hay piezas
// de hasta 33 caracteres ("cobrando en una caja registradora"). Se mide en un
// layout effect (antes de pintar: sin parpadeo), escribiendo directo al estilo
// del nodo (es una medida del DOM, no estado de React), y se re-mide si cambia
// el ancho o termina de cargar la tipografía. Sin `data-pieza` no hace nada.
export function useAjusteStack(stack: RefObject<HTMLElement | null>, deps: readonly unknown[]) {
  useLayoutEffect(() => {
    const el = stack.current;
    if (!el) return;
    const ajusta = () => {
      el.style.removeProperty("font-size"); // vuelve a la base antes de medir
      const cajas = [...el.querySelectorAll<HTMLElement>("[data-pieza]")];
      if (cajas.length === 0) return;
      const ancho = Math.max(...cajas.map((c) => c.offsetWidth));
      if (ancho > el.clientWidth) {
        const base = parseFloat(getComputedStyle(el).fontSize);
        el.style.setProperty("font-size", `${Math.floor(((base * el.clientWidth) / ancho) * 10) / 10}px`);
      }
    };
    ajusta();
    const ro = new ResizeObserver(ajusta);
    ro.observe(el);
    // La serif llega después del primer pintado y mide distinto que el respaldo.
    let vivo = true;
    document.fonts?.ready.then(() => vivo && ajusta());
    return () => {
      vivo = false;
      ro.disconnect();
    };
    // Las deps las decide quien llama (lo que cambia el contenido del stack).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
