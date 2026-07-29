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

// Cada cuánto revienta una pompa sola (ventana aleatoria) y cuánto tarda en
// brotar la que la reemplaza.
const SOLA_MIN_MS = 5500;
const SOLA_VAR_MS = 6500;
const SOLA_REGRESO_MS = 950;

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

// ── Vidrio de la pompa ───────────────────────────────────────────────────
// Una esfera creíble necesita CUATRO cosas, y aquí cada una es una capa propia
// (todas gradientes estáticos: se pintan una vez y no cuestan por frame):
//   1. cuerpo    → radial desplazado al 30/24% (valores del Figma) + sombras
//                  internas que le dan grosor: sin ellas la bola se ve plana.
//   2. rim       → el borde NO es parejo: brilla arriba-izquierda y se apaga
//                  abajo-derecha (degradado enmascarado en un aro de ~1.5px).
//   3. cáustica  → media luna luminosa pegada al borde inferior interno: es la
//                  luz que atraviesa la pompa y se concentra al salir.
//   4. reflejos  → el brillo especular (el "reflejo" de la fuente de luz) y su
//                  rebote chico abajo-derecha. Van ENCIMA de la palabra para
//                  que se lea como algo que pasa en la superficie del vidrio.
const VIDRIO: React.CSSProperties = {
  background:
    // Caída rápida desde el núcleo: el centro-derecha queda casi transparente
    // (se ve el fondo a través) y la pompa deja de leerse como canica opaca.
    "radial-gradient(83% 83% at 30% 24%, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.34) 18%, rgba(255,255,255,0.13) 40%, rgba(255,255,255,0.05) 64%, rgba(255,255,255,0.12) 86%, rgba(255,255,255,0.3) 100%)",
  boxShadow: [
    "inset -8px -12px 26px -8px rgba(255,255,255,0.5)", // luz que entra por abajo
    "inset 6px 8px 20px -6px rgba(255,255,255,0.45)", // brillo interno superior
    "inset 0 0 26px rgba(0,0,0,0.12)", // grosor del vidrio (neutro: sirve en las 3 rondas)
    "0 0 22px rgba(255,255,255,0.24)", // resplandor exterior
    "0 16px 32px rgba(0,0,0,0.2)", // sombra proyectada
  ].join(", "),
};

// Halo que respira detrás del vidrio (animación dopa-brilla en globals.css).
const HALO: React.CSSProperties = {
  background:
    "radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.14) 45%, transparent 70%)",
};

// Borde de vidrio: aro fino con degradado (brillante arriba-izquierda, casi
// nulo abajo-derecha). `circle closest-side` hace que 100% caiga EXACTO en la
// orilla de la pompa; el tramo suave evita que el aro se vea dentado.
const ANILLO_MASK =
  "radial-gradient(circle closest-side, transparent calc(100% - 2px), #000 calc(100% - 1px))";
const RIM: React.CSSProperties = {
  background:
    "linear-gradient(150deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.55) 28%, rgba(255,255,255,0.14) 60%, rgba(255,255,255,0.4) 100%)",
  WebkitMask: ANILLO_MASK,
  mask: ANILLO_MASK,
};

// Cáustica: aro luminoso recortado a la mitad de abajo → media luna interior.
const CAUSTICA: React.CSSProperties = {
  background:
    "radial-gradient(circle closest-side, transparent 60%, rgba(255,255,255,0.42) 88%, transparent 100%)",
  WebkitMask: "linear-gradient(to top, #000 0%, transparent 58%)",
  mask: "linear-gradient(to top, #000 0%, transparent 58%)",
};

// Rim iridiscente sutil (solo en el borde, centro enmascarado).
const IRIS_MASK = "radial-gradient(circle closest-side, transparent 62%, #000 92%)";
const IRIS: React.CSSProperties = {
  background:
    "conic-gradient(from 210deg, rgba(255,182,217,0.5), rgba(168,230,255,0.42), rgba(255,243,176,0.35), rgba(217,200,255,0.45), rgba(255,182,217,0.5))",
  WebkitMask: IRIS_MASK,
  mask: IRIS_MASK,
  opacity: 0.45,
};

// Reflejo especular: óvalo inclinado arriba-izquierda, con núcleo duro y caída
// larga (un blur real costaría; el gradiente ya da el difuminado).
const REFLEJO: React.CSSProperties = {
  top: "11%",
  left: "16%",
  width: "33%",
  height: "22%",
  borderRadius: "50%",
  transform: "rotate(-28deg)",
  background:
    "radial-gradient(closest-side, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.72) 26%, rgba(255,255,255,0.16) 62%, transparent 100%)",
};

// Rebote de luz: el reflejo chico del lado opuesto que delata la curvatura.
const REFLEJO_BAJO: React.CSSProperties = {
  bottom: "13%",
  right: "15%",
  width: "28%",
  height: "15%",
  borderRadius: "50%",
  transform: "rotate(-18deg)",
  background:
    "radial-gradient(closest-side, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.24) 50%, transparent 100%)",
};

// Capas bajo la palabra (borde, cáustica, iridiscencia).
function CapasVidrio() {
  return (
    <>
      <span aria-hidden="true" className="absolute inset-0 rounded-full" style={RIM} />
      <span aria-hidden="true" className="absolute inset-0 rounded-full" style={CAUSTICA} />
      <span aria-hidden="true" className="absolute inset-0 rounded-full" style={IRIS} />
    </>
  );
}

// Capas sobre la palabra (los reflejos viven en la superficie del vidrio).
function Reflejos() {
  return (
    <>
      <span aria-hidden="true" className="absolute" style={REFLEJO} />
      <span aria-hidden="true" className="absolute" style={REFLEJO_BAJO} />
    </>
  );
}

// El estallido, compartido por los dos casos en que una pompa se rompe: cuando
// la tocas (revela palabra) y cuando revienta sola. `suave` es la versión de
// las espontáneas: mismo lenguaje, menos volumen, para que no compita con el
// pop que sí importa.
function Estallido({ tam, suave = false }: { tam: string; suave?: boolean }) {
  const gotas = suave ? GOTAS.filter((_, j) => j % 2 === 0) : GOTAS;
  const f = suave ? 0.55 : 1; // factor de opacidad de la versión suave
  return (
    <>
      {/* 1 · Destello central: un flash breve que vende el "pop" */}
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.4) 40%, transparent 70%)",
        }}
        initial={{ scale: 0.4, opacity: f }}
        animate={{ scale: 1.6, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
      {/* 2 · Onda expansiva (doble en el pop real, sencilla en el espontáneo) */}
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-full border-2 border-[rgba(243,230,207,0.85)]"
        initial={{ scale: 0.5, opacity: 0.9 * f }}
        animate={{ scale: 2.1, opacity: 0 }}
        transition={{ duration: 0.55, ease: SALIDA_SUAVE }}
      />
      {!suave && (
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-full border border-white/60"
          initial={{ scale: 0.5, opacity: 0.7 }}
          animate={{ scale: 2.7, opacity: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease: SALIDA_SUAVE }}
        />
      )}
      {/* 3 · El vidrio se infla y estalla (con sus mismas capas) */}
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-full"
        style={VIDRIO}
        initial={{ scale: 1, opacity: 1 }}
        animate={{ scale: 1.45, opacity: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <CapasVidrio />
        <Reflejos />
      </motion.span>
      {/* 4 · Gotas: tamaños, distancias y tempos variados */}
      {gotas.map((v, j) => (
        <motion.span
          key={`g${j}`}
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: v.d,
            height: v.d,
            backgroundColor: v.crema ? "rgba(243,230,207,0.95)" : "rgba(255,255,255,0.9)",
          }}
          initial={{ x: "-50%", y: "-50%", opacity: f, scale: 1 }}
          animate={{
            x: `calc(-50% + ${v.x} * (${tam} / 2 + 30px) * ${v.dist})`,
            y: `calc(-50% + ${v.y} * (${tam} / 2 + 30px) * ${v.dist})`,
            opacity: 0,
            scale: 0.25,
          }}
          transition={{ duration: v.dur, ease: SALIDA_SUAVE }}
        />
      ))}
      {/* 5 · Chispas diminutas que llegan más lejos (solo el pop real) */}
      {!suave &&
        CHISPAS.map((v, j) => (
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
          initial={{ x: "-50%", y: "-50%", opacity: 0.9 * f, scale: 0.6 }}
          animate={{
            x: `calc(-50% + ${v.x} * (${tam} / 2 + 26px))`,
            y: `calc(-50% + ${v.y} * (${tam} / 2 + 44px))`,
            opacity: 0,
            scale: 1,
          }}
          transition={{ duration: 0.85, delay: 0.06, ease: SALIDA_SUAVE }}
        />
      ))}
    </>
  );
}

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
  // Pompa que está reventando sola (decorativo) y las que ya volvieron.
  const [solaId, setSolaId] = useState<string | null>(null);
  const [renacidas, setRenacidas] = useState<Set<string>>(new Set());

  // El componente NO se remonta entre rondas (el key vive en el div interno):
  // al cambiar la ronda se reinicia el conteo aquí, durante el render
  // (patrón "adjusting state when props change" de React).
  const [rondaPrevia, setRondaPrevia] = useState(rondaKey);
  if (rondaPrevia !== rondaKey) {
    setRondaPrevia(rondaKey);
    setVisibles(BURBUJAS_INICIALES);
    setSolaId(null);
    setRenacidas(new Set());
  }

  useEffect(() => {
    if (visibles >= burbujas.length || reventadaId !== null) return;
    const t = setTimeout(() => setVisibles((v) => v + 1), BROTE_MS);
    return () => clearTimeout(t);
  }, [visibles, burbujas.length, reventadaId]);

  // ── Pompas que revientan solas ──
  // Cada tanto una se rompe sin revelar nada, como pasa de verdad. La palabra
  // no se pierde: al ratito brota otra en la misma posición con el mismo
  // contenido — y como el texto va borroso, nadie nota que es la misma.
  useEffect(() => {
    if (reventadaId !== null || solaId !== null) return;
    if (visibles < 3) return; // con el campo casi vacío se notaría demasiado
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(
      () => {
        const candidatas = burbujas.slice(0, visibles);
        setSolaId(candidatas[Math.floor(Math.random() * candidatas.length)].id);
      },
      SOLA_MIN_MS + Math.random() * SOLA_VAR_MS
    );
    return () => clearTimeout(t);
  }, [reventadaId, solaId, visibles, burbujas]);

  // …y vuelve a brotar (sin el retraso de entrada escalonada).
  useEffect(() => {
    if (solaId === null) return;
    const t = setTimeout(() => {
      setRenacidas((prev) => new Set(prev).add(solaId));
      setSolaId(null);
    }, SOLA_REGRESO_MS);
    return () => clearTimeout(t);
  }, [solaId]);

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
          const rompeSola = !explotada && solaId === b.id;
          // Sin stagger de entrada: las que brotaron tarde y las que renacieron.
          const brote = i >= BURBUJAS_INICIALES || renacidas.has(b.id);
          const tam = `calc(${p.d}px * var(--burbuja-escala, 1))`;
          return (
            <div
              key={b.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ top: `${p.top}%`, left: `${p.left}%`, width: tam, height: tam }}
            >
              {explotada ? (
                <>
                  <Estallido tam={tam} />
                  {/* La palabra revelada, con su propio halo */}
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
              ) : rompeSola ? (
                <Estallido tam={tam} suave />
              ) : (
                // Dos envoltorios de movimiento: deriva lateral por fuera y
                // flote+jiggle por dentro. Van separados porque cada animación
                // necesita su propio `transform`, y el botón se queda con el
                // suyo libre para el hover/tap de framer.
                <span
                  className="dopa-deriva absolute inset-0 block"
                  style={{
                    animationDelay: `${-((i * 2.3) % 13)}s`,
                    animationDuration: `${11 + (i % 4) * 2.5}s`,
                  }}
                >
                  <span
                    className="dopa-flota absolute inset-0 block"
                    style={{
                      animationDelay: `${-((i * 0.9) % 5)}s`,
                      animationDuration: `${4.5 + (i % 3) * 0.9}s`,
                    }}
                  >
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
                      className="relative block w-full h-full rounded-full select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cremita)]"
                      style={VIDRIO}
                      whileHover={reventadaId ? undefined : { scale: 1.07 }}
                      whileTap={reventadaId ? undefined : { scale: 0.92 }}
                      initial={{ opacity: 0, scale: 0.4 }}
                      // La onda expansiva "empuja" al resto: se encogen y atenúan un poco
                      animate={{ opacity: reventadaId ? 0.45 : 1, scale: reventadaId ? 0.93 : 1 }}
                      transition={{ delay: brote ? 0 : 0.05 + i * 0.05, type: "spring", stiffness: 220, damping: 18 }}
                    >
                      <CapasVidrio />
                      {/* La palabra vive dentro del vidrio pero borrosa: se intuye, no se lee */}
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 flex items-center justify-center px-2 text-center font-serif italic text-[13px] leading-tight text-white/60"
                        style={{ filter: "blur(5px)" }}
                      >
                        {b.texto}
                      </span>
                      <Reflejos />
                    </motion.button>
                  </span>
                </span>
              )}
            </div>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
}
