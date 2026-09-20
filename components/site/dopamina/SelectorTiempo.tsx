"use client";

// Tiempo del reto (fondo de la pantalla del reto): control segmentado +
// "¡Comenzar!". Antes eran 5 tarjetas grandes que arrancaban al tocarlas;
// ahora los tiempos SOLO seleccionan y el arranque es un botón aparte — la
// decisión (cuánto) y la acción (empezar) dejan de ser el mismo toque, y el
// bloque pasa de ~200px a ~150px de alto en mobile.
//
// Accesibilidad: son radios NATIVOS (input sr-only + label): flechas para
// moverse, un solo tab stop, "seleccionado" anunciado por el lector — nada de
// eso hay que reimplementarlo. Cada segmento mide 44px de alto (blanco táctil
// mínimo) y el foco de teclado se pinta sobre el segmento (peer-focus-visible).
// Siempre hay un tiempo elegido, así que "¡Comenzar!" nunca está deshabilitado.

import { useId } from "react";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { DURACIONES } from "@/lib/dopamina/tipos";

export default function SelectorTiempo({
  valor,
  onCambia,
  onComienza,
}: {
  valor: number;
  onCambia: (seg: number) => void;
  onComienza: () => void;
}) {
  const id = useId();
  return (
    <div className="w-full max-w-sm md:max-w-md">
      <p id={`${id}-titulo`} className="font-serif italic text-[17px] leading-snug text-white mb-3">
        Elige tu tiempo
      </p>

      <div
        role="radiogroup"
        aria-labelledby={`${id}-titulo`}
        // Pista OSCURA translúcida, no blanca: con blanco al 14% los tiempos no
        // elegidos (blanco, 13px) caían a 3.8:1; con negro al 12% dan 5.9:1 y la
        // pastilla blanca del elegido resalta más.
        className="flex rounded-full border border-[rgba(255,255,255,0.45)] bg-[rgba(0,0,0,0.12)] p-1 shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
      >
        {DURACIONES.map((d) => {
          const elegido = d.seg === valor;
          return (
            <label key={d.seg} className="relative flex-1 cursor-pointer select-none">
              <input
                type="radio"
                name={`${id}-tiempo`}
                value={d.seg}
                checked={elegido}
                onChange={() => onCambia(d.seg)}
                className="peer sr-only"
              />
              {/* La pastilla blanca se DESLIZA al segmento elegido (layoutId) */}
              {elegido && (
                <motion.span
                  layoutId={`${id}-pastilla`}
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.18)]"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span
                className={`relative z-10 flex h-11 items-center justify-center rounded-full font-sans text-[13px] md:text-[14px] font-semibold whitespace-nowrap transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-white ${
                  elegido ? "text-[#403C3C]" : "text-white"
                }`}
              >
                {/* A la vista va abreviado; el lector oye la unidad completa */}
                <span aria-hidden="true">
                  {d.valor} {d.unidad === "hora" ? "h" : "min"}
                </span>
                <span className="sr-only">
                  {d.valor} {d.unidad}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      <motion.button
        type="button"
        onClick={onComienza}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        className="group mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white font-sans text-[15px] font-semibold text-[var(--color-verde)] shadow-[0_10px_24px_rgba(0,0,0,0.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        ¡Comenzar!
        <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </motion.button>
    </div>
  );
}
