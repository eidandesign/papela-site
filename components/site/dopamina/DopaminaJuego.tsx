"use client";

// Dopamina — juego inmersivo del Club Creativo (rediseño "cielo" ago-2026).
// Página standalone (sin navbar/footer): lienzo redondeado a pantalla completa
// con UN solo fondo en todas las fases: cielo azul (FONDO_CIELO) con nubes
// caricatura que derivan con GSAP (componente Nubes) y letra blanca. Fases:
//   burbujas (3 rondas: explota una pompa de vidrio por categoría; los slots
//   punteados de arriba se van llenando) → reto + elección de tiempo
//   → cronómetro con 3·2·1 → reto completado (confeti + compartir foto).
//
// Performance móvil: fondo sólido estático (ya no hay crossfade de capas —
// se quitó con el cambio de color por ronda); nubes y burbujas solo animan
// transform/opacity; burbujas sin backdrop-filter.
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
import Confeti from "./Confeti";
import Nubes from "./Nubes";
import {
  generaOpciones,
  armaReto,
  capitaliza,
  recuerdaSeleccion,
  RONDAS,
  FONDO_CIELO,
} from "@/lib/dopamina/retos";
import { DURACIONES, type Burbuja, type CategoriaBurbuja, type Reto } from "@/lib/dopamina/tipos";
import { eventoDopa } from "@/lib/dopamina/analitica";
import { CURVA_SUAVE } from "@/lib/dopamina/animacion";

type Fase = "burbujas" | "reto" | "cronometro" | "final";

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

// (El primario de la pantalla final es el CTA blanco de Instagram, inline.)
const btnFantasma =
  "inline-flex items-center justify-center rounded-full border border-[rgba(255,255,255,0.5)] text-white font-sans text-[13px] font-medium px-6 py-2.5 hover:bg-white/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";
// Terciario: link con ícono. Sin caja ni borde — el nivel más bajo de la
// jerarquía, para acciones que no son el camino principal de la pantalla.
const btnTerciario =
  "inline-flex items-center gap-2 font-sans text-[13px] font-medium text-white/70 hover:text-white underline underline-offset-[6px] decoration-[rgba(255,255,255,0.35)] hover:decoration-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white rounded-sm";

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
            className="font-serif italic text-[14px] md:text-[15px] leading-none text-white whitespace-nowrap px-1"
          >
            {/* Los slots se leen como oración: solo la primera palabra va en mayúscula */}
            {idx === 0 ? capitaliza(b.texto) : b.texto}
          </motion.span>
        ) : (
          <span
            key={r.id}
            aria-label={`${r.etiqueta} por descubrir`}
            className="inline-block w-[74px] md:w-[92px] h-[20px] rounded-full border border-dashed border-[rgba(255,255,255,0.55)]"
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

  // Explota una burbuja: la palabra queda en su lugar y llena su slot; tras
  // una pausa cambia la ronda o pasa al reto.
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

  return (
    <MotionConfig reducedMotion="user">
      <main className="min-h-[100dvh] bg-[var(--color-bg)] p-2.5 md:p-4">
        <section
          className="dopa-canvas relative overflow-hidden rounded-[24px] md:rounded-[32px] min-h-[calc(100dvh-20px)] md:min-h-[calc(100dvh-32px)] flex flex-col"
          style={{ backgroundColor: FONDO_CIELO }}
        >
          {/* Cielo: nubes caricatura con deriva GSAP, en todas las fases.
              Fuera de burbujas se repliegan arriba: el reto/cronómetro/final
              ponen su contenido al centro y ninguna nube debe taparlo. */}
          <Nubes despejado={!enBurbujas} />

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
            <AnimatedLogo color="#FFFFFF" className="w-full aspect-square" />
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

          {/* Confeti de celebración al completar el reto */}
          {fase === "final" && <Confeti />}

          {/* Campo de burbujas: ocupa todo el lienzo. Al terminar la última
              burbuja sale deslizándose hacia abajo (paneo de cámara: el mundo
              baja mientras la cámara sube a la siguiente pantalla). */}
          <AnimatePresence>
            {enBurbujas && opciones && (
              <motion.div
                key="campo"
                className="absolute inset-0"
                exit={{ y: 70, opacity: 0 }}
                transition={{ duration: 0.75, ease: CURVA_SUAVE }}
              >
                <CampoBurbujas
                  rondaKey={cat.id}
                  burbujas={opciones[cat.id]}
                  reventadaId={reventada}
                  onToca={tocaBurbuja}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Contenido por fase */}
          <div className="relative z-20 flex-1 flex flex-col pointer-events-none">
            {enBurbujas ? (
              <header className="flex flex-col items-center text-center gap-4 px-6 pt-[72px] md:pt-14">
                <p className="label text-white/70">
                  Burbuja {Math.min(ronda + 1, RONDAS.length)} de {RONDAS.length}
                </p>
                <h1 className="font-sans text-[clamp(1.25rem,3vw,1.9rem)] font-medium leading-snug text-white max-w-3xl">
                  Explota una burbuja y descubre tu siguiente creación
                </h1>
                <Slots seleccion={seleccion} />
              </header>
            ) : (
              <div
                className={`flex-1 flex flex-col items-center justify-center px-6 pointer-events-auto ${
                  // pt-[120px]+ libra el logo chico (top-6 + 84/100px de alto):
                  // en la pantalla final el contenido es alto (formulario) y con
                  // py-24 el título se encimaba con el logo.
                  enReto ? "pt-24 pb-14" : "pt-[120px] md:pt-[136px] pb-16"
                }`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={fase}
                    // Paneo de cámara hacia arriba: lo nuevo baja desde arriba
                    // y lo viejo sale por abajo, igual que las capas de nubes.
                    initial={{ opacity: 0, y: -22 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 16 }}
                    transition={{ duration: 0.45, ease: CURVA_SUAVE }}
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
                          className="label text-white/70 mb-5"
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
                              (serif italic blanca, leading apretado). El clamp
                              va por debajo del de los heroes porque aquí no es
                              un título de 3 palabras, es una oración larga. */}
                          <p className="font-serif italic text-[clamp(2rem,4.8vw,3.75rem)] leading-[1.05] text-white">
                            {/* La frase se arma palabra por palabra, como las burbujas */}
                            {reto.frase.split(" ").map((palabra, i) => (
                              <motion.span
                                key={i}
                                className="inline-block"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + i * 0.05, duration: 0.35, ease: CURVA_SUAVE }}
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
                          <p className="font-serif italic text-[17px] leading-snug text-white mb-4">
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
                                className="group basis-[calc(33.333%-7px)] md:basis-[calc(20%-8px)] flex flex-col items-center gap-0.5 rounded-2xl border border-[rgba(255,255,255,0.55)] bg-[rgba(255,255,255,0.14)] hover:bg-white hover:border-white shadow-[0_8px_20px_rgba(0,0,0,0.14)] py-4 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                              >
                                <span className="font-serif text-[26px] leading-none text-white group-hover:text-[#403C3C] transition-colors">
                                  {d.valor}
                                </span>
                                <span className="font-sans text-[10px] font-semibold uppercase tracking-widest text-white/75 group-hover:text-[#403C3C]/70 transition-colors">
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
                        <p className="font-serif text-[clamp(1.15rem,2.4vw,1.5rem)] leading-snug text-white max-w-xl mb-10">
                          {reto.frase}
                        </p>
                        <Cronometro duracionSeg={duracion} onTermina={terminaReto} />
                      </>
                    )}

                    {fase === "final" && (
                      <>
                        <motion.h1
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: "spring", stiffness: 220, damping: 18 }}
                          className="font-serif text-[clamp(2rem,4.5vw,2.8rem)] leading-tight text-white mb-3"
                        >
                          ¡Reto completado!
                        </motion.h1>
                        <p className="font-sans text-[14px] leading-relaxed text-white/90 max-w-sm mb-6">
                          Tómale foto a tu dibujo, súbela a Instagram y
                          etiquétanos — quienes lo hagan se llevan una sorpresa.
                        </p>
                        <a
                          href="https://instagram.com/papela.atelier"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => eventoDopa("ig_comparte")}
                          className="inline-flex items-center gap-2 rounded-full bg-white text-[var(--color-verde)] font-sans text-[14px] font-semibold px-7 py-3 hover:opacity-90 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                        >
                          Etiqueta a @papela.atelier
                        </a>
                        <div aria-hidden="true" className="w-64 h-px bg-white/20 my-9" />
                        <div className="flex flex-wrap items-center justify-center gap-4">
                          <button
                            type="button"
                            onClick={() => {
                              eventoDopa("volver_jugar");
                              reparte();
                            }}
                            className={btnFantasma}
                          >
                            Volver a jugar
                          </button>
                          <Link href="/club-creativo" onClick={() => eventoDopa("ver_club")} className={btnTerciario}>
                            Ver Club Creativo
                          </Link>
                        </div>
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
