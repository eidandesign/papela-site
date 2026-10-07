"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/solid";

/**
 * Hoja de detalle: bottom sheet en mobile, ventana centrada en desktop (mismo
 * lenguaje que ReservaModal). Escape, clic fuera y botón ✕ la cierran; bloquea
 * el scroll del fondo y regresa el foco a quien la abrió. Va un nivel abajo de
 * ReservaModal (z 100050) para que "Pagar en línea" pueda abrir el calendario
 * encima sin pelearse con ella.
 */
export default function HojaInferior({
  abierta,
  onClose,
  titulo,
  children,
  pie,
  encabezado,
  variante = "centro",
}: {
  abierta: boolean;
  onClose: () => void;
  titulo: string;
  children: React.ReactNode;
  // Acciones fijas al pie (CTAs).
  pie?: React.ReactNode;
  // Algo antes del título (ej. "← Otras opciones").
  encabezado?: React.ReactNode;
  // "centro" = ventana centrada en desktop · "drawer" = panel a la derecha a
  // todo el alto en desktop. En mobile las dos son bottom sheet.
  variante?: "centro" | "drawer";
}) {
  const [esDesktop, setEsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const sync = () => setEsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  const drawer = variante === "drawer" && esDesktop;
  const [montado, setMontado] = useState(false);
  const tituloId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previoRef = useRef<HTMLElement | null>(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMontado(true), []);

  useEffect(() => {
    if (!abierta) return;
    previoRef.current = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Foco al panel para lectores de pantalla y teclado.
    requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previoRef.current?.focus?.();
    };
  }, [abierta, onClose]);

  if (!montado) return null;

  return createPortal(
    <AnimatePresence>
      {abierta && (
        <div
          className={`fixed inset-0 z-[100040] flex items-end justify-center ${drawer ? "sm:items-stretch sm:justify-end" : "sm:items-center sm:p-6"}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={tituloId}
        >
          <motion.button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            initial={drawer ? { x: "100%" } : { y: "100%" }}
            animate={drawer ? { x: 0 } : { y: 0 }}
            exit={drawer ? { x: "100%" } : { y: "100%" }}
            transition={{ type: "tween", ease: [0.32, 0.72, 0, 1], duration: 0.36 }}
            className={`relative z-10 w-full flex flex-col bg-white shadow-2xl outline-none ${
              drawer ? "h-full sm:max-w-[520px]" : "max-h-[90vh] rounded-t-[28px] sm:max-w-xl sm:rounded-[28px]"
            }`}
          >
            {/* Asa visual en mobile */}
            <div className="sm:hidden mx-auto mt-3 h-1.5 w-10 rounded-full bg-[var(--color-border)]" aria-hidden />
            {encabezado && <div className="px-6 pt-4 sm:pt-6">{encabezado}</div>}
            <div className={`flex items-start justify-between gap-4 px-6 ${encabezado ? "pt-2" : "pt-4 sm:pt-7"}`}>
              <h2 id={tituloId} className="font-serif text-[clamp(1.6rem,4vw,2rem)] leading-tight text-[#403c3c]">
                {titulo}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f2f0e9] text-[var(--color-text)] hover:bg-[#e7d6cf] transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">{children}</div>
            {pie && (
              <div className="border-t border-[var(--color-border)] px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{pie}</div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
