"use client";

// Destello: un círculo blanco que nace en un punto del lienzo (la pompa de
// reto) y se INFLA hasta tapar todo; con la
// pantalla en blanco el juego cambia la escena (`onCubierto`) y el blanco se
// disuelve sobre lo nuevo (`onFin`). Es el "corte de cámara" del reto extra:
// lo que pasa detrás del blanco nunca se ve brincar.
//
// Performance: solo se anima transform (scale) y opacity de UN elemento. Nada
// de clip-path ni de animar el tamaño real — repintarían el lienzo por frame.
// Mientras vive captura los toques (z-40): nadie puede pulsar ¡Comenzar! ni
// volver a disparar otro destello a media transición.
//
// Accesibilidad: es decorativo (aria-hidden; el reto se anuncia por la región
// aria-live del juego). Con prefers-reduced-motion NO se monta — DopaminaJuego
// cambia la escena en seco: un fundido a blanco de pantalla completa es justo
// lo que esa preferencia pide evitar. Nunca encadena más de ~1 blanco por
// segundo (no se puede re-disparar mientras corre), lejos del umbral de
// destellos de WCAG 2.3.1.

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export interface OrigenDestello {
  // Centro del origen y tamaño del lienzo, en px relativos al lienzo.
  x: number;
  y: number;
  tam: number; // diámetro inicial (el de la pompa)
  ancho: number;
  alto: number;
}

// La pompa de reto inflándose ("crece y crece") → respiro en blanco → disolver.
const TEMPO = { crece: 2, espera: 0.12, sale: 0.8 } as const;

// Diámetro base del círculo. Va grande y se arranca encogido (scale < 1) para
// que al inflarse la textura no se pixelee tanto como una de 76px a ×25.
const BASE = 320;

export default function Destello({
  origen,
  onCubierto,
  onFin,
}: {
  origen: OrigenDestello;
  onCubierto: () => void;
  onFin: () => void;
}) {
  const [saliendo, setSaliendo] = useState(false);
  const t = TEMPO;
  // framer puede avisar "completo" más de una vez si el componente re-renderiza:
  // la escena solo debe cambiarse UNA vez por destello.
  const cubierto = useRef(false);
  const espera = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (espera.current && clearTimeout(espera.current)), []);

  // Escala final: que el círculo alcance la esquina MÁS lejana del lienzo.
  const lejos = Math.hypot(Math.max(origen.x, origen.ancho - origen.x), Math.max(origen.y, origen.alto - origen.y));
  const inicio = origen.tam / BASE;
  const fin = ((lejos * 2) / BASE) * 1.12;

  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-0 z-40 overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: saliendo ? 0 : 1 }}
      transition={{ duration: t.sale, ease: "easeOut" }}
      onAnimationComplete={() => {
        if (saliendo) onFin();
      }}
    >
      <motion.span
        className="absolute rounded-full bg-white"
        style={{
          left: origen.x - BASE / 2,
          top: origen.y - BASE / 2,
          width: BASE,
          height: BASE,
          // Borde luminoso: se infla con el círculo y suaviza la orilla.
          boxShadow: "0 0 60px 24px rgba(255,255,255,0.75)",
        }}
        // Nace transparente sobre la pompa (parece que ELLA se pone blanca),
        // toma aire con un encogimiento breve y luego se infla acelerando:
        // lento al principio, imparable al final. La curva es easeInCubic y
        // no una más extrema: con [0.7,0,0.84,0] la pompa se quedaba casi
        // quieta 0.8 s y luego tronaba de golpe — debe verse CRECER desde ya.
        initial={{ scale: inicio, opacity: 0 }}
        animate={{ scale: [inicio, inicio * 0.88, fin], opacity: [0, 1, 1] }}
        transition={{
          duration: t.crece,
          times: [0, 0.14, 1],
          ease: ["easeOut", [0.32, 0, 0.67, 0]],
        }}
        onAnimationComplete={() => {
          if (cubierto.current) return;
          cubierto.current = true;
          onCubierto();
          // Un respiro en blanco pleno antes de disolver: la escena nueva ya
          // está montada debajo cuando empieza a verse.
          espera.current = setTimeout(() => setSaliendo(true), t.espera * 1000);
        }}
      />
    </motion.div>
  );
}
