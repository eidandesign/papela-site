"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Toggle "Clases recurrentes / Talleres especiales" de /colabora/maestros: una
// modalidad a la vez para no saturar la sección. Patrón de pestañas WAI-ARIA
// (role=tablist, flechas ←/→, Inicio/Fin). Los dos paneles los arma el
// servidor (traen las cifras confidenciales y solo existen con sesión); aquí
// solo se elige cuál se ve.
//
// El toggle se queda PEGADO arriba (sticky) mientras dure la sección, para
// cambiar de modalidad sin tener que subir. Su contenedor es el <div> raíz, así
// que se suelta solo cuando termina el panel. Al cambiar estando pegado, la
// página regresa al inicio del panel nuevo (si no, se abriría a media tarjeta).

type Opcion = { id: string; label: string; panel: ReactNode };

export default function ModalidadesToggle({ opciones }: { opciones: Opcion[] }) {
  const base = useId();
  const [activa, setActiva] = useState(opciones[0]?.id);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const sinMovimiento = useReducedMotion();
  const raiz = useRef<HTMLDivElement>(null);
  const barra = useRef<HTMLDivElement>(null);

  function elegir(id: string) {
    if (id === activa) return;
    setActiva(id);
    requestAnimationFrame(() => {
      const r = raiz.current;
      const b = barra.current;
      if (!r || !b) return;
      // `top` del sticky (16 px en celular, 88 px en escritorio bajo el navbar).
      const pegadoEn = parseFloat(getComputedStyle(b).top) || 0;
      const inicio = r.getBoundingClientRect().top;
      if (inicio < pegadoEn) {
        window.scrollTo({ top: window.scrollY + inicio - pegadoEn, behavior: sinMovimiento ? "auto" : "smooth" });
      }
    });
  }

  function teclas(e: KeyboardEvent, i: number) {
    let j: number | null = null;
    if (e.key === "ArrowRight") j = (i + 1) % opciones.length;
    else if (e.key === "ArrowLeft") j = (i - 1 + opciones.length) % opciones.length;
    else if (e.key === "Home") j = 0;
    else if (e.key === "End") j = opciones.length - 1;
    if (j === null) return;
    e.preventDefault();
    elegir(opciones[j].id);
    tabs.current[j]?.focus({ preventScroll: true });
  }

  return (
    <div ref={raiz}>
      {/* pointer-events-none en la franja: solo la pastilla recibe clics, lo de
          los lados sigue siendo de la tarjeta que pasa por debajo. */}
      <div ref={barra} className="sticky top-4 md:top-[88px] z-30 flex justify-center mb-6 md:mb-8 pointer-events-none">
        <div
          role="tablist"
          aria-label="Formas de colaborar"
          className="pointer-events-auto inline-flex rounded-full bg-white border border-[var(--color-border)] p-1.5 gap-1 shadow-[0_8px_24px_rgba(66,37,38,0.12)]"
        >
          {opciones.map((o, i) => {
            const sel = o.id === activa;
            return (
              <button
                key={o.id}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`${base}-tab-${o.id}`}
                aria-selected={sel}
                aria-controls={`${base}-panel-${o.id}`}
                tabIndex={sel ? 0 : -1}
                onClick={() => elegir(o.id)}
                onKeyDown={(e) => teclas(e, i)}
                className={`cursor-pointer relative h-12 px-4 sm:px-7 rounded-full font-sans text-[14px] sm:text-[15px] font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-verde)] ${
                  sel ? "text-[var(--color-cremita)]" : "text-[var(--color-text)] hover:bg-[var(--color-verde-light)]"
                }`}
              >
                {/* La pastilla verde se DESLIZA a la pestaña elegida (mismo
                    patrón que SelectorTiempo de Dopamina, layoutId). */}
                {sel && (
                  <motion.span
                    layoutId={`${base}-pastilla`}
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-[var(--color-verde)]"
                    transition={sinMovimiento ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative z-10">{o.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {opciones.map((o) => (
        <div
          key={o.id}
          role="tabpanel"
          id={`${base}-panel-${o.id}`}
          aria-labelledby={`${base}-tab-${o.id}`}
          hidden={o.id !== activa}
          className="max-w-3xl mx-auto"
        >
          {o.panel}
        </div>
      ))}
    </div>
  );
}
