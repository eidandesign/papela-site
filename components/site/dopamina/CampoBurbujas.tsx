"use client";

// Campo de burbujas de Dopamina (diseño Figma): pompas de vidrio líquido
// dispersas por TODO el lienzo, con la palabra borrosa dentro (ilegible hasta
// explotar). Al tocar una, revienta con onda + partículas y la palabra queda
// revelada en su lugar mientras llena su slot arriba.
//
// Performance móvil: el vidrio es puro gradiente + sombras (nada de
// backdrop-filter, que se vuelve carísimo con varias capas) y el blur del
// texto interior es un filter estático que se rasteriza una sola vez. Todas
// las animaciones son transform/opacity (compositor).

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { capitaliza, RONDAS } from "@/lib/dopamina/retos";
import type { Burbuja } from "@/lib/dopamina/tipos";

// Posiciones dispersas (porcentajes del lienzo) que rodean el logo central y
// respetan el encabezado. El tamaño base escala en mobile vía la variable
// --burbuja-escala definida en globals.css (.dopa-canvas).
const POSICIONES = [
  { top: 34, left: 10, d: 104 },
  { top: 27, left: 88, d: 88 },
  { top: 47, left: 17, d: 128 },
  { top: 44, left: 83, d: 112 },
  { top: 68, left: 9, d: 78 },
  { top: 79, left: 27, d: 132 },
  { top: 72, left: 63, d: 140 },
  { top: 88, left: 48, d: 108 },
  { top: 74, left: 89, d: 90 },
];

export const BURBUJAS_POR_RONDA = POSICIONES.length;

// Aparición progresiva: la ronda abre con unas cuantas pompas y cada tanto
// brota una nueva hasta llenar el campo — se siente vivo mientras decides.
const BURBUJAS_INICIALES = 4;
const BROTE_MS = 1100;

// ── Piezas de la explosión (todas deterministas, calculadas una sola vez) ──
// Gotas principales: 10 direcciones con jitter, distancia/tamaño/tempo variados.
const GOTAS = Array.from({ length: 10 }, (_, i) => {
  const angulo = (i / 10) * Math.PI * 2 + (i % 3) * 0.25;
  return {
    x: Math.cos(angulo),
    y: Math.sin(angulo),
    dist: 1 + ((i * 37) % 5) / 10, // 1.0–1.4 radios
    d: 5 + ((i * 53) % 3) * 2, // 5–9px
    dur: 0.5 + ((i * 29) % 3) * 0.08,
    crema: i % 2 === 0,
  };
});
// Chispas lejanas: diminutas, salen después y llegan más lejos.
const CHISPAS = Array.from({ length: 6 }, (_, i) => {
  const angulo = (i / 6) * Math.PI * 2 + 0.5;
  return { x: Math.cos(angulo), y: Math.sin(angulo) };
});
// Mini-burbujas: el vidrio se rompe en pompitas que escapan hacia arriba.
const MINIS = [
  { x: -0.8, y: -1.15, d: 16 },
  { x: 0.9, y: -0.9, d: 12 },
  { x: -0.3, y: -1.45, d: 10 },
  { x: 0.45, y: -1.3, d: 14 },
];
const SALIDA_SUAVE = [0.16, 1, 0.3, 1] as const;

// Vidrio líquido barato: brillo superior, reflejo inferior, borde tenue y un
// resplandor exterior fijo (el pulso lo pone la capa .dopa-brillo).
const VIDRIO: React.CSSProperties = {
  background:
    "radial-gradient(circle at 30% 24%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.12) 34%, rgba(255,255,255,0.03) 58%, rgba(255,255,255,0.1) 88%, rgba(255,255,255,0.22) 100%)",
  boxShadow:
    "inset 0 -12px 20px rgba(255,255,255,0.16), inset 0 3px 10px rgba(255,255,255,0.38), 0 0 22px rgba(255,255,255,0.28), 0 14px 30px rgba(0,0,0,0.2)",
  border: "1px solid rgba(255,255,255,0.32)",
};

// Halo que respira detrás del vidrio (animación dopa-brilla en globals.css).
const HALO: React.CSSProperties = {
  background:
    "radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.14) 45%, transparent 70%)",
};

// Rim iridiscente sutil (solo en el borde, centro enmascarado).
const IRIS: React.CSSProperties = {
  background:
    "conic-gradient(from 210deg, rgba(255,182,217,0.5), rgba(168,230,255,0.42), rgba(255,243,176,0.35), rgba(217,200,255,0.45), rgba(255,182,217,0.5))",
  WebkitMask: "radial-gradient(circle, transparent 58%, black 78%)",
  mask: "radial-gradient(circle, transparent 58%, black 78%)",
  opacity: 0.45,
};

export default function CampoBurbujas({
  rondaKey,
  burbujas,
  reventadaId,
  onToca,
}: {
  rondaKey: string;
  burbujas: Burbuja[];
  reventadaId: string | null;
  onToca: (b: Burbuja) => void;
}) {
  // Cuántas pompas se muestran ya; crece sola hasta cubrir todas las opciones.
  const [visibles, setVisibles] = useState(BURBUJAS_INICIALES);

  // El componente NO se remonta entre rondas (el key vive en el div interno):
  // al cambiar la ronda se reinicia el conteo aquí, durante el render
  // (patrón "adjusting state when props change" de React).
  const [rondaPrevia, setRondaPrevia] = useState(rondaKey);
  if (rondaPrevia !== rondaKey) {
    setRondaPrevia(rondaKey);
    setVisibles(BURBUJAS_INICIALES);
  }

  useEffect(() => {
    if (visibles >= burbujas.length || reventadaId !== null) return;
    const t = setTimeout(() => setVisibles((v) => v + 1), BROTE_MS);
    return () => clearTimeout(t);
  }, [visibles, burbujas.length, reventadaId]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={rondaKey}
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {burbujas.slice(0, visibles).map((b, i) => {
          const p = POSICIONES[i % POSICIONES.length];
          const explotada = reventadaId === b.id;
          const brote = i >= BURBUJAS_INICIALES; // llegó después, sin stagger
          const tam = `calc(${p.d}px * var(--burbuja-escala, 1))`;
          return (
            <div
              key={b.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ top: `${p.top}%`, left: `${p.left}%`, width: tam, height: tam }}
            >
              {explotada ? (
                <>
                  {/* 1 · Destello central: un flash breve que vende el "pop" */}
                  <motion.span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.4) 40%, transparent 70%)",
                    }}
                    initial={{ scale: 0.4, opacity: 1 }}
                    animate={{ scale: 1.6, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                  {/* 2 · Doble onda expansiva */}
                  <motion.span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full border-2 border-[rgba(243,230,207,0.85)]"
                    initial={{ scale: 0.5, opacity: 0.9 }}
                    animate={{ scale: 2.1, opacity: 0 }}
                    transition={{ duration: 0.55, ease: SALIDA_SUAVE }}
                  />
                  <motion.span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full border border-white/60"
                    initial={{ scale: 0.5, opacity: 0.7 }}
                    animate={{ scale: 2.7, opacity: 0 }}
                    transition={{ duration: 0.7, delay: 0.08, ease: SALIDA_SUAVE }}
                  />
                  {/* 3 · El vidrio se infla y estalla */}
                  <motion.span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full"
                    style={VIDRIO}
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 1.45, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  />
                  {/* 4 · Gotas: tamaños, distancias y tempos variados */}
                  {GOTAS.map((v, j) => (
                    <motion.span
                      key={`g${j}`}
                      aria-hidden="true"
                      className="absolute left-1/2 top-1/2 rounded-full"
                      style={{
                        width: v.d,
                        height: v.d,
                        backgroundColor: v.crema ? "rgba(243,230,207,0.95)" : "rgba(255,255,255,0.9)",
                      }}
                      initial={{ x: "-50%", y: "-50%", opacity: 1, scale: 1 }}
                      animate={{
                        x: `calc(-50% + ${v.x} * (${tam} / 2 + 30px) * ${v.dist})`,
                        y: `calc(-50% + ${v.y} * (${tam} / 2 + 30px) * ${v.dist})`,
                        opacity: 0,
                        scale: 0.25,
                      }}
                      transition={{ duration: v.dur, ease: SALIDA_SUAVE }}
                    />
                  ))}
                  {/* 5 · Chispas diminutas que llegan más lejos */}
                  {CHISPAS.map((v, j) => (
                    <motion.span
                      key={`c${j}`}
                      aria-hidden="true"
                      className="absolute left-1/2 top-1/2 w-[3px] h-[3px] rounded-full bg-white"
                      initial={{ x: "-50%", y: "-50%", opacity: 1 }}
                      animate={{
                        x: `calc(-50% + ${v.x} * (${tam} / 2 + 30px) * 1.9)`,
                        y: `calc(-50% + ${v.y} * (${tam} / 2 + 30px) * 1.9)`,
                        opacity: 0,
                      }}
                      transition={{ duration: 0.7, delay: 0.05, ease: SALIDA_SUAVE }}
                    />
                  ))}
                  {/* 6 · Mini-pompas de vidrio que escapan flotando hacia arriba */}
                  {MINIS.map((v, j) => (
                    <motion.span
                      key={`m${j}`}
                      aria-hidden="true"
                      className="absolute left-1/2 top-1/2 rounded-full"
                      style={{ width: v.d, height: v.d, ...VIDRIO, boxShadow: "inset 0 1px 4px rgba(255,255,255,0.5)" }}
                      initial={{ x: "-50%", y: "-50%", opacity: 0.9, scale: 0.6 }}
                      animate={{
                        x: `calc(-50% + ${v.x} * (${tam} / 2 + 26px))`,
                        y: `calc(-50% + ${v.y} * (${tam} / 2 + 44px))`,
                        opacity: 0,
                        scale: 1,
                      }}
                      transition={{ duration: 0.85, delay: 0.06, ease: SALIDA_SUAVE }}
                    />
                  ))}
                  {/* 7 · La palabra revelada, con su propio halo */}
                  <motion.span
                    aria-hidden="true"
                    className="absolute -inset-5 rounded-full pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.1) 50%, transparent 72%)",
                    }}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.16, duration: 0.4, ease: "easeOut" }}
                  />
                  <motion.span
                    initial={{ scale: 0.3, y: 8, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ delay: 0.18, type: "spring", stiffness: 300, damping: 16 }}
                    className="absolute inset-0 flex items-center justify-center text-center font-serif italic text-[15px] md:text-[17px] leading-tight text-[var(--color-cremita)] whitespace-nowrap"
                    style={{ textShadow: "0 0 18px rgba(255,255,255,0.45)" }}
                  >
                    {/* Mayúscula solo en la primera ronda: es el inicio de la oración */}
                    {b.categoria === RONDAS[0].id ? capitaliza(b.texto) : b.texto}
                  </motion.span>
                </>
              ) : (
                <>
                  {/* Halo pulsante detrás del vidrio (sibling anterior = queda debajo) */}
                  <span
                    aria-hidden="true"
                    className="dopa-brillo absolute -inset-4 rounded-full pointer-events-none"
                    style={{ ...HALO, animationDelay: `${-((i * 0.7) % 3.2)}s` }}
                  />
                  <motion.button
                  type="button"
                  onClick={() => onToca(b)}
                  disabled={reventadaId !== null}
                  aria-label={`Burbuja misteriosa ${i + 1} de ${burbujas.length}`}
                  className="dopa-flota block w-full h-full rounded-full select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cremita)]"
                  style={{
                    ...VIDRIO,
                    animationDelay: `${-((i * 0.9) % 5)}s`,
                    animationDuration: `${4.5 + (i % 3) * 0.9}s`,
                  }}
                  whileHover={reventadaId ? undefined : { scale: 1.07 }}
                  whileTap={reventadaId ? undefined : { scale: 0.92 }}
                  initial={{ opacity: 0, scale: 0.4 }}
                  // La onda expansiva "empuja" al resto: se encogen y atenúan un poco
                  animate={{ opacity: reventadaId ? 0.45 : 1, scale: reventadaId ? 0.93 : 1 }}
                  transition={{ delay: brote ? 0 : 0.05 + i * 0.05, type: "spring", stiffness: 220, damping: 18 }}
                >
                  <span aria-hidden="true" className="absolute inset-0 rounded-full" style={IRIS} />
                  {/* La palabra vive dentro del vidrio pero borrosa: se intuye, no se lee */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center px-2 text-center font-serif italic text-[13px] leading-tight text-white/60"
                    style={{ filter: "blur(5px)" }}
                  >
                    {b.texto}
                  </span>
                  </motion.button>
                </>
              )}
            </div>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
}
