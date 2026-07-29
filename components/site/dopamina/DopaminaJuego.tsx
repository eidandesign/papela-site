"use client";

// Dopamina — juego inmersivo del Club Creativo (diseño Figma jul-2026).
// Página standalone (sin navbar/footer): lienzo redondeado a pantalla completa
// cuyo fondo cambia de color con cada ronda (morado → azul → rosa) y termina
// en verde para el cronómetro y el cierre. Fases:
//   burbujas (3 rondas: explota una pompa de vidrio por categoría; los slots
//   punteados de arriba se van llenando) → reto + elección de tiempo (rosa)
//   → cronómetro con 3·2·1 (verde) → reto completado (verde).
// No hay galería ni subida de dibujos: el juego termina en "Volver a jugar".
//
// Performance móvil: el cambio de fondo es un crossfade de capas sólidas por
// opacity (compositor, sin repaints por frame); burbujas sin backdrop-filter.
// Accesibilidad: región aria-live anuncia revelaciones y cambios de fase,
// burbujas son <button> con etiqueta, focos visibles, reduced-motion via
// MotionConfig y la media query de .dopa-flota.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ArrowLeftIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import AnimatedLogo from "../AnimatedLogo";
import CampoBurbujas, { BURBUJAS_POR_RONDA } from "./CampoBurbujas";
import Cronometro from "./Cronometro";
import {
  generaOpciones,
  armaReto,
  capitaliza,
  recuerdaSeleccion,
  RONDAS,
  FONDO_RETO,
  FONDO_VERDE,
} from "@/lib/dopamina/retos";
import { DURACIONES, type Burbuja, type CategoriaBurbuja, type Reto } from "@/lib/dopamina/tipos";
import { eventoDopa } from "@/lib/dopamina/analitica";

type Fase = "burbujas" | "reto" | "cronometro" | "final";

// Mientras eliges el tiempo, el lienzo va derivando por los colores de la
// marca: entra con el rosa de la ronda 3 (transición continua) y sigue rotando
// hasta que eliges. Es el mismo crossfade por opacity, solo que en bucle.
const COLORES_RETO = [FONDO_RETO, "#8C482A", "#483699", "#3E6D94", "#5E7E86"];
const PASO_COLOR_MS = 4200; // cuánto se queda cada color antes de derivar
const FUNDIDO_RETO_MS = 2200; // cruce largo: se siente como una deriva, no un corte

// Capas de color del lienzo (crossfade por opacity). Union sin repetidos: el
// rosa aparece tanto en la ronda 3 como en el reto, y cada capa lleva `key`.
const COLORES_LIENZO = [
  ...new Set([...RONDAS.map((r) => r.fondo), FONDO_VERDE, ...COLORES_RETO]),
];

// Puntitos efervescentes: suben por el lienzo como burbujas de refresco
// (animación dopa-sube en globals.css). Delays negativos = el campo ya está
// poblado al entrar, sin esperar el primer ciclo.
const PUNTOS = [
  { left: 8, d: 5, dur: 13, delay: -2, vaiven: 14 },
  { left: 18, d: 4, dur: 17, delay: -9, vaiven: -10 },
  { left: 31, d: 6, dur: 12, delay: -5, vaiven: 8 },
  { left: 44, d: 4, dur: 16, delay: -12, vaiven: -14 },
  { left: 55, d: 5, dur: 14, delay: -3, vaiven: 12 },
  { left: 66, d: 7, dur: 18, delay: -7, vaiven: -8 },
  { left: 77, d: 4, dur: 12, delay: -10, vaiven: 10 },
  { left: 88, d: 5, dur: 15, delay: -1, vaiven: -12 },
  { left: 95, d: 4, dur: 19, delay: -14, vaiven: 8 },
];

const btnCrema =
  "inline-flex items-center justify-center rounded-full bg-[var(--color-cremita)] text-[var(--color-verde)] font-sans text-[14px] font-semibold px-7 py-3 hover:opacity-90 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cremita)]";
const btnFantasma =
  "inline-flex items-center justify-center rounded-full border border-[rgba(243,230,207,0.5)] text-[var(--color-cremita)] font-sans text-[13px] font-medium px-6 py-2.5 hover:bg-white/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cremita)]";
// Terciario: link con ícono. Sin caja ni borde — el nivel más bajo de la
// jerarquía, para acciones que no son el camino principal de la pantalla.
const btnTerciario =
  "inline-flex items-center gap-2 font-sans text-[13px] font-medium text-[var(--color-cremita)]/70 hover:text-[var(--color-cremita)] underline underline-offset-[6px] decoration-[rgba(243,230,207,0.35)] hover:decoration-[var(--color-cremita)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cremita)] rounded-sm";

// Slots del reto: tres huecos punteados que se llenan con cada revelación.
function Slots({ seleccion }: { seleccion: Burbuja[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5">
      {RONDAS.map((r, idx) => {
        const b = seleccion.find((s) => s.categoria === r.id);
        return b ? (
          <motion.span
            key={r.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif italic text-[14px] md:text-[15px] leading-none text-[var(--color-cremita)] whitespace-nowrap px-1"
          >
            {/* Los slots se leen como oración: solo la primera palabra va en mayúscula */}
            {idx === 0 ? capitaliza(b.texto) : b.texto}
          </motion.span>
        ) : (
          <span
            key={r.id}
            aria-label={`${r.etiqueta} por descubrir`}
            className="inline-block w-[74px] md:w-[92px] h-[20px] rounded-full border border-dashed border-[rgba(243,230,207,0.55)]"
          />
        );
      })}
    </div>
  );
}

export default function DopaminaJuego() {
  const [fase, setFase] = useState<Fase>("burbujas");
  const [opciones, setOpciones] = useState<Record<CategoriaBurbuja, Burbuja[]> | null>(null);
  const [ronda, setRonda] = useState(0);
  const [reventada, setReventada] = useState<string | null>(null);
  const [seleccion, setSeleccion] = useState<Burbuja[]>([]);
  const [reto, setReto] = useState<Reto | null>(null);
  const [duracion, setDuracion] = useState(0);
  const [anuncio, setAnuncio] = useState("");
  // Índice del color que recorre la pantalla del reto (0 = rosa de entrada).
  const [pasoColor, setPasoColor] = useState(0);
  // Guard SÍNCRONO contra taps casi simultáneos (multitouch): el estado
  // `reventada` vive en el closure del render y dos toques en el mismo tick
  // lo verían null a la vez, programando dos timeouts de avance de ronda.
  const reventando = useRef(false);

  const reparte = () => {
    reventando.current = false;
    setOpciones(generaOpciones(BURBUJAS_POR_RONDA));
    setRonda(0);
    setReventada(null);
    setSeleccion([]);
    setReto(null);
    setFase("burbujas");
    eventoDopa("inicio_partida");
  };

  useEffect(() => {
    const desde = new URLSearchParams(window.location.search).get("desde") ?? "directo";
    eventoDopa("entrada", { desde });
    // Intencional: las opciones usan Math.random, así que solo pueden
    // generarse en el cliente tras el mount (evita mismatch de hidratación).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reparte();
  }, []);

  // Deriva de color de la pantalla del reto: avanza un paso cada tanto y el
  // crossfade de las capas hace el resto. Se apaga con reduced-motion (es una
  // animación en bucle) y al salir de la fase.
  useEffect(() => {
    if (fase !== "reto") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const int = setInterval(() => setPasoColor((p) => p + 1), PASO_COLOR_MS);
    return () => clearInterval(int);
  }, [fase]);

  // Explota una burbuja: la palabra queda en su lugar y llena su slot; tras
  // una pausa cambia la ronda (y el color del lienzo) o pasa al reto.
  const tocaBurbuja = (b: Burbuja) => {
    if (reventando.current || reventada !== null) return;
    reventando.current = true;
    // Háptica sutil en móviles: el "pop" también se siente.
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(30);
    setReventada(b.id);
    const nueva = [...seleccion, b];
    setSeleccion(nueva);
    setAnuncio(`Descubriste: ${b.texto}`);
    if (nueva.length === RONDAS.length) {
      eventoDopa("burbujas_completas");
      recuerdaSeleccion(nueva); // estas 3 palabras no volverán a salir pronto
      const armado = armaReto(nueva);
      setTimeout(() => {
        setReto(armado);
        setPasoColor(0); // entra con el rosa de la ronda 3 y de ahí deriva
        setFase("reto");
        setAnuncio(`Tu reto: ${armado.frase}`);
      }, 1900);
    } else {
      setTimeout(() => {
        setRonda((r) => r + 1);
        setReventada(null);
        reventando.current = false;
      }, 1400);
    }
  };

  const eligeTiempo = (seg: number) => {
    setDuracion(seg);
    eventoDopa("duracion_elegida", { seg });
    setFase("cronometro");
    setAnuncio("El cronómetro va a empezar");
  };

  const terminaReto = (antes: boolean) => {
    eventoDopa("reto_terminado", { antes });
    setFase("final");
    setAnuncio(antes ? "Reto completado" : "Se acabó el tiempo. Reto completado");
  };

  const cat = RONDAS[Math.min(ronda, RONDAS.length - 1)];
  const enBurbujas = fase === "burbujas";
  const enReto = fase === "reto";
  const fondo = enBurbujas
    ? cat.fondo
    : enReto
      ? COLORES_RETO[pasoColor % COLORES_RETO.length]
      : FONDO_VERDE;

  return (
    <MotionConfig reducedMotion="user">
      <main className="min-h-[100dvh] bg-[var(--color-bg)] p-2.5 md:p-4">
        {/* El fondo base sigue al color activo: a media transición lo que se
            asoma entre las dos capas es el color destino, no un tercero. */}
        <section
          className="dopa-canvas relative overflow-hidden rounded-[24px] md:rounded-[32px] min-h-[calc(100dvh-20px)] md:min-h-[calc(100dvh-32px)] flex flex-col"
          style={{ backgroundColor: fondo }}
        >
          {/* Fondo: capas sólidas con crossfade por opacity (barato en móvil) */}
          {COLORES_LIENZO.map((color) => (
            <div
              key={color}
              aria-hidden="true"
              className="absolute inset-0 transition-opacity ease-out"
              style={{
                backgroundColor: color,
                opacity: color === fondo ? 1 : 0,
                transitionDuration: enReto ? `${FUNDIDO_RETO_MS}ms` : "700ms",
              }}
            />
          ))}

          {/* Burbujitas efervescentes subiendo */}
          {PUNTOS.map((p, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="dopa-punto"
              style={{
                left: `${p.left}%`,
                width: p.d,
                height: p.d,
                "--dur": `${p.dur}s`,
                "--vaiven": `${p.vaiven}px`,
                animationDelay: `${p.delay}s`,
              } as React.CSSProperties}
            />
          ))}

          {/* Logo: grande al centro durante las burbujas, chico arriba después */}
          <div
            aria-hidden="true"
            className={`absolute pointer-events-none transition-all duration-700 ease-out left-1/2 -translate-x-1/2 ${
              enBurbujas
                ? "top-1/2 -translate-y-1/2 w-[180px] md:w-[300px] opacity-90"
                : "top-6 translate-y-0 w-[84px] md:w-[100px] opacity-90"
            }`}
          >
            <AnimatedLogo color="var(--color-cremita)" className="w-full aspect-square" />
          </div>

          {/* Salir */}
          <Link
            href="/club-creativo"
            aria-label="Salir del juego y volver a Club Creativo"
            className="absolute left-4 top-4 md:left-6 md:top-6 z-30 inline-flex items-center gap-1.5 rounded-full bg-white text-[var(--color-verde)] text-[11px] font-semibold uppercase tracking-widest px-4 py-2.5 shadow-[0_6px_18px_rgba(0,0,0,0.15)] hover:opacity-90 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <ArrowLeftIcon className="w-3 h-3" />
            Salir
          </Link>

          {/* Anuncios para lectores de pantalla */}
          <div aria-live="polite" className="sr-only">
            {anuncio}
          </div>

          {/* Campo de burbujas: ocupa todo el lienzo */}
          {enBurbujas && opciones && (
            <CampoBurbujas
              rondaKey={cat.id}
              burbujas={opciones[cat.id]}
              reventadaId={reventada}
              onToca={tocaBurbuja}
            />
          )}

          {/* Contenido por fase */}
          <div className="relative z-20 flex-1 flex flex-col pointer-events-none">
            {enBurbujas ? (
              <header className="flex flex-col items-center text-center gap-4 px-6 pt-[72px] md:pt-14">
                <p className="label text-[var(--color-cremita)]/70">
                  Burbuja {Math.min(ronda + 1, RONDAS.length)} de {RONDAS.length}
                </p>
                <h1 className="font-sans text-[clamp(1.25rem,3vw,1.9rem)] font-medium leading-snug text-[var(--color-cremita)] max-w-2xl">
                  Explota una burbuja y descubre tu siguiente creación
                </h1>
                <Slots seleccion={seleccion} />
              </header>
            ) : (
              <div
                className={`flex-1 flex flex-col items-center justify-center px-6 pointer-events-auto ${
                  enReto ? "pt-24 pb-14" : "py-24"
                }`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={fase}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    // En el reto el bloque ocupa todo el alto: el reto se centra
                    // en el espacio libre (my-auto) y los tiempos caen al fondo.
                    className={`w-full flex flex-col items-center text-center ${enReto ? "flex-1" : ""}`}
                  >
                    {fase === "reto" && reto && (
                      <>
                        {/* Bloque 1 — el reto, centrado en el espacio libre.
                            Coreografía de entrada: label → frase palabra por
                            palabra → "otras burbujas" → pregunta → tiempos. */}
                        <div className="my-auto flex flex-col items-center w-full">
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05, duration: 0.4 }}
                          className="label text-[var(--color-cremita)]/70 mb-5"
                        >
                          Tu reto
                        </motion.p>
                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.12, type: "spring", stiffness: 200, damping: 20 }}
                          className="w-full max-w-3xl"
                        >
                          {/* Sin caja: la frase es el héroe de la pantalla, con
                              el mismo tratamiento que los heroes del sitio
                              (serif italic cremita, leading apretado). El clamp
                              va por debajo del de los heroes porque aquí no es
                              un título de 3 palabras, es una oración larga. */}
                          <p className="font-serif italic text-[clamp(2rem,4.8vw,3.75rem)] leading-[1.05] text-[var(--color-cremita)]">
                            {/* La frase se arma palabra por palabra, como las burbujas */}
                            {reto.frase.split(" ").map((palabra, i) => (
                              <motion.span
                                key={i}
                                className="inline-block"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                              >
                                {palabra}
                                {" "}
                              </motion.span>
                            ))}
                          </p>
                        </motion.div>

                        {/* Terciario: descartar el reto es la salida, no la
                            acción. Va pegado a la frase (es sobre ELLA) y como
                            link para no competir con los botones de tiempo. */}
                        <motion.button
                          type="button"
                          onClick={reparte}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.9, duration: 0.4 }}
                          className={`${btnTerciario} mt-7`}
                        >
                          <ArrowPathIcon className="w-3.5 h-3.5" />
                          Probar otras burbujas
                        </motion.button>
                        </div>

                        {/* Bloque 2 — al fondo: el paso que falta para seguir */}
                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.55, duration: 0.4 }}
                          className="mt-12 w-full max-w-sm md:max-w-xl"
                        >
                          <p className="font-serif italic text-[17px] leading-snug text-[var(--color-cremita)] mb-4">
                            Elige tu tiempo y que comience la creatividad
                          </p>
                          {/* 5 opciones: 3 + 2 centradas en mobile, una sola fila
                              en desktop. Con borde y relieve para que se lean
                              como botones: son el paso obligatorio para avanzar. */}
                          <div className="flex flex-wrap justify-center gap-2.5">
                            {DURACIONES.map((d, i) => (
                              <motion.button
                                key={d.seg}
                                type="button"
                                onClick={() => eligeTiempo(d.seg)}
                                aria-label={`Empezar con ${d.valor} ${d.unidad}`}
                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: 0.62 + i * 0.07, type: "spring", stiffness: 260, damping: 20 }}
                                whileHover={{ y: -3 }}
                                whileTap={{ scale: 0.95 }}
                                className="group basis-[calc(33.333%-7px)] md:basis-[calc(20%-8px)] flex flex-col items-center gap-0.5 rounded-2xl border border-[rgba(243,230,207,0.55)] bg-[rgba(243,230,207,0.14)] hover:bg-[var(--color-cremita)] hover:border-[var(--color-cremita)] shadow-[0_8px_20px_rgba(0,0,0,0.14)] py-4 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-cremita)]"
                              >
                                <span className="font-serif text-[26px] leading-none text-[var(--color-cremita)] group-hover:text-[#403C3C] transition-colors">
                                  {d.valor}
                                </span>
                                <span className="font-sans text-[10px] font-semibold uppercase tracking-widest text-[var(--color-cremita)]/75 group-hover:text-[#403C3C]/70 transition-colors">
                                  {d.unidad}
                                </span>
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      </>
                    )}

                    {fase === "cronometro" && reto && (
                      <>
                        <p className="font-serif text-[clamp(1.15rem,2.4vw,1.5rem)] leading-snug text-[var(--color-cremita)] max-w-xl mb-10">
                          {reto.frase}
                        </p>
                        <Cronometro duracionSeg={duracion} onTermina={terminaReto} />
                      </>
                    )}

                    {fase === "final" && (
                      <>
                        <h1 className="font-serif text-[clamp(2rem,4.5vw,2.8rem)] leading-tight text-[var(--color-cremita)] mb-3">
                          Reto completado
                        </h1>
                        <p className="font-sans text-[13px] text-[var(--color-cremita)]/80 mb-7">
                          Cada partida genera una combinación distinta: ninguna idea se repite.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            eventoDopa("volver_jugar");
                            reparte();
                          }}
                          className={btnCrema}
                        >
                          Volver a jugar
                        </button>
                        <div aria-hidden="true" className="w-64 h-px bg-white/20 my-9" />
                        <p className="font-sans text-[12px] text-[var(--color-cremita)]/75 mb-4">
                          Explora más actividades del Club Creativo.
                        </p>
                        <Link href="/club-creativo" onClick={() => eventoDopa("ver_club")} className={btnFantasma}>
                          Ver Club Creativo
                        </Link>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </div>
        </section>
      </main>
    </MotionConfig>
  );
}
