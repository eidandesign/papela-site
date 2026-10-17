"use client";

import { useEffect, type RefObject } from "react";

/**
 * Comportamiento compartido de todo diálogo modal del sitio (auditoría
 * 2026-10-16, Fase 1 #10 — WCAG 2.4.3 / 2.1.2 / 4.1.2). Extraído de HojaInferior
 * y usado también por ProductDrawer, CartDrawer, ReservaModal y el menú mobile
 * del Navbar:
 *
 * - **Foco inicial** al panel (`panelRef`, con `tabIndex={-1}`) al abrir, y
 *   **foco restaurado** al elemento que lo abrió al cerrar.
 * - **Escape** cierra.
 * - **`inert`** en todo lo que queda fuera del diálogo: lo marca como no
 *   interactivo para teclado, lectores de pantalla y ratón, así el foco no se
 *   escapa al contenido de atrás. Se aplica a los hermanos de cada ancestro de
 *   `raizRef` (el contenedor del portal: velo + panel), nunca al propio
 *   diálogo. Elementos con `data-dialogo-permitir` (p. ej. la hamburguesa del
 *   navbar, que dibuja la ✕ del menú) se dejan activos.
 * - Opcional: bloquear el scroll del fondo (`bloquearScroll`).
 *
 * El `role="dialog" aria-modal="true"` + `aria-label`/`aria-labelledby` van en
 * el JSX de cada componente.
 */
// Cuántos diálogos abiertos marcaron cada elemento como inert. Dos diálogos
// pueden traslaparse un instante (ProductDrawer → "Agregar" → abre CartDrawer y
// cierra el de producto): si el que cierra quitara el inert a secas, dejaría
// al que sigue abierto sin protección. Solo se quita cuando el contador llega a 0.
const marcas = new WeakMap<HTMLElement, number>();

function inertar(el: HTMLElement) {
  const n = marcas.get(el) ?? 0;
  marcas.set(el, n + 1);
  el.inert = true;
}

function desinertar(el: HTMLElement) {
  const n = (marcas.get(el) ?? 1) - 1;
  if (n <= 0) {
    marcas.delete(el);
    el.inert = false;
  } else {
    marcas.set(el, n);
  }
}

export default function useDialogo({
  abierto,
  onClose,
  panelRef,
  raizRef,
  bloquearScroll = false,
}: {
  abierto: boolean;
  onClose: () => void;
  // Nodo que recibe el foco al abrir (con tabIndex={-1}).
  panelRef: RefObject<HTMLElement | null>;
  // Contenedor de todo el diálogo (velo + panel). Si falta, se usa panelRef.
  raizRef?: RefObject<HTMLElement | null>;
  bloquearScroll?: boolean;
}) {
  useEffect(() => {
    if (!abierto) return;

    const previo = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);

    const overflow = document.body.style.overflow;
    if (bloquearScroll) document.body.style.overflow = "hidden";

    // inert fuera del diálogo. El panel puede montarse un frame después
    // (AnimatePresence), por eso se resuelve dentro del rAF.
    const inertados: HTMLElement[] = [];
    let raf = requestAnimationFrame(() => {
      const raiz = raizRef?.current ?? panelRef.current;
      if (raiz) {
        const permitidos = Array.from(document.querySelectorAll<HTMLElement>("[data-dialogo-permitir]"));
        const conserva = (el: Element) => el.contains(raiz) || permitidos.some((p) => el.contains(p));
        const marcar = (contenedor: Element) => {
          for (const hijo of Array.from(contenedor.children)) {
            if (!(hijo instanceof HTMLElement)) continue;
            if (hijo === raiz || permitidos.includes(hijo)) continue;
            if (conserva(hijo)) {
              marcar(hijo);
            } else if (hijo.tagName !== "SCRIPT" && hijo.tagName !== "STYLE" && (marcas.has(hijo) || !hijo.inert)) {
              // (un inert ajeno —no puesto por un diálogo— se respeta y no se toca)
              inertar(hijo);
              inertados.push(hijo);
            }
          }
        };
        marcar(document.body);
      }
      raf = requestAnimationFrame(() => panelRef.current?.focus({ preventScroll: true }));
    });

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      if (bloquearScroll) document.body.style.overflow = overflow;
      for (const el of inertados) desinertar(el);
      // Devolver el foco a quien abrió (si sigue en el documento) — salvo que
      // otro diálogo ya lo haya tomado (el foco está fuera de este panel y no
      // en el body): no se lo robamos.
      const activo = document.activeElement;
      const raiz = raizRef?.current ?? panelRef.current;
      const focoLibre = !activo || activo === document.body || (raiz ? raiz.contains(activo) : true);
      if (focoLibre && previo && previo.isConnected) previo.focus?.({ preventScroll: true });
    };
  }, [abierto, onClose, panelRef, raizRef, bloquearScroll]);
}
