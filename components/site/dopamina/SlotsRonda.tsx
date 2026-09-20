"use client";

// Huecos de la pantalla de burbujas: tres óvalos punteados APILADOS, uno por
// ronda (objeto → acción → cierre), con el mismo óvalo y el mismo orden que
// tendrá la frase en la pantalla siguiente (FraseReto) — lo que aquí se llena
// es lo que allá se podrá cambiar. Antes eran tres pastillitas en fila.
//
// Un hueco NO se llena al explotar la burbuja sino cuando su palabra ATERRIZA:
// `PalabraVuela` la trae volando desde donde tronó la pompa (`llegadas` lo
// marca DopaminaJuego al terminar el vuelo). Como la palabra voladora llega
// con el mismo texto, tamaño y centro, el relevo no se nota; el óvalo solo da
// un latido al recibirla.
//
// Cada hueco expone `data-slot` (el juego mide ahí el destino del vuelo) y los
// llenos llevan `data-pieza` para el autoajuste de piezas.ts.

import { useRef } from "react";
import { motion } from "framer-motion";
import { capitaliza, RONDAS } from "@/lib/dopamina/retos";
import { CURVA_SUAVE, SALIDA_SUAVE } from "@/lib/dopamina/animacion";
import type { Burbuja, CategoriaBurbuja } from "@/lib/dopamina/tipos";
import { OVALO, useAjusteStack } from "./piezas";

// Un escalón por debajo de las piezas de FraseReto (1.625rem): aquí conviven
// con el título de la ronda y con las pompas que les pasan por detrás.
const TAM = "text-[clamp(1.375rem,min(3vw,3.1vh),2.25rem)]";

export default function SlotsRonda({
  seleccion,
  llegadas,
}: {
  seleccion: Burbuja[];
  llegadas: ReadonlySet<CategoriaBurbuja>;
}) {
  const stack = useRef<HTMLDivElement>(null);
  useAjusteStack(stack, [llegadas.size]);

  return (
    <div ref={stack} className={`w-full flex flex-col items-center gap-2 font-serif italic ${TAM} text-white`}>
      {RONDAS.map((r, k) => {
        const b = seleccion.find((s) => s.categoria === r.id);
        const llena = b && llegadas.has(r.id);
        return llena ? (
          <motion.span
            key={r.id}
            data-slot={r.id}
            data-pieza
            // Latido al recibir la palabra (el texto NO anima: ya venía volando).
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 16 }}
            className={`${OVALO} border-[rgba(255,255,255,0.7)]`}
          >
            {/* Se lee como oración: solo la primera palabra va en mayúscula */}
            {k === 0 ? capitaliza(b.texto) : b.texto}
          </motion.span>
        ) : (
          <span
            key={r.id}
            data-slot={r.id}
            aria-label={`${r.etiqueta} por descubrir`}
            className={`${OVALO} min-w-[8.5em] border-[rgba(255,255,255,0.55)]`}
          >
            {/* Un carácter invisible le da al hueco el alto de un renglón. */}
            <span aria-hidden="true" className="invisible">
              ·
            </span>
          </span>
        );
      })}
    </div>
  );
}

// La palabra revelada viajando de la pompa a su hueco. Coordenadas en px
// relativas al lienzo. Misma letra que la palabra que quedó sobre la pompa
// (CampoBurbujas la oculta justo al despegar) y `escala` la lleva al tamaño de
// los huecos, así que tanto el despegue como el aterrizaje son relevos
// invisibles. x e y llevan curvas distintas: el camino sale en arco, no recto.
// Solo transform (compositor). Con reduced-motion no se monta: DopaminaJuego
// llena el hueco directo.
export function PalabraVuela({
  texto,
  desde,
  hasta,
  escala,
  onLlega,
}: {
  texto: string;
  desde: { x: number; y: number };
  hasta: { x: number; y: number };
  escala: number;
  onLlega: () => void;
}) {
  return (
    <motion.span
      aria-hidden="true"
      className="absolute z-30 pointer-events-none whitespace-nowrap font-serif italic text-[15px] md:text-[17px] leading-tight text-white"
      style={{ left: desde.x, top: desde.y, textShadow: "0 0 18px rgba(255,255,255,0.45)" }}
      initial={{ x: "-50%", y: "-50%", scale: 1 }}
      animate={{
        x: `calc(-50% + ${hasta.x - desde.x}px)`,
        y: `calc(-50% + ${hasta.y - desde.y}px)`,
        scale: escala,
      }}
      transition={{
        x: { duration: 0.62, ease: CURVA_SUAVE },
        y: { duration: 0.62, ease: SALIDA_SUAVE },
        scale: { duration: 0.62, ease: CURVA_SUAVE },
      }}
      onAnimationComplete={onLlega}
    >
      {texto}
    </motion.span>
  );
}
