"use client";

// Dopamina — juego inmersivo del Club Creativo (rediseño "cielo" ago-2026).
// Página standalone (sin navbar/footer): lienzo redondeado a pantalla completa
// con UN solo fondo en todas las fases: cielo azul (FONDO_CIELO) con nubes
// caricatura que derivan con GSAP (componente Nubes) y letra blanca. Fases:
//   burbujas (3 rondas: explota una pompa de vidrio por categoría; los slots
//   punteados de arriba se van llenando) → reto + elección de tiempo (con un
//   reto extra OPCIONAL: restricción creativa, ver BloqueRetoExtra)
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
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import AnimatedLogo from "../AnimatedLogo";
import CampoBurbujas, { BURBUJAS_POR_RONDA } from "./CampoBurbujas";
import Cronometro from "./Cronometro";
import Confeti from "./Confeti";
import Nubes from "./Nubes";
import BloqueRetoExtra, { RetoExtraTexto } from "./BloqueRetoExtra";
import SelectorTiempo from "./SelectorTiempo";
import FraseReto from "./FraseReto";
import SlotsRonda, { PalabraVuela } from "./SlotsRonda";
import Destello, { type OrigenDestello } from "./Destello";
import { btnFantasma, btnTerciario } from "./estilos";
import {
  generaOpciones,
  sorteaParte,
  armaReto,
  capitaliza,
  recuerdaSeleccion,
  RONDAS,
  FONDO_CIELO,
} from "@/lib/dopamina/retos";
import { DURACIONES, type Burbuja, type CategoriaBurbuja, type Reto } from "@/lib/dopamina/tipos";
import { sorteaRetoExtra, type RetoExtra } from "@/lib/dopamina/retos-extra";
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

export default function DopaminaJuego() {
  const [fase, setFase] = useState<Fase>("burbujas");
  const [opciones, setOpciones] = useState<Record<CategoriaBurbuja, Burbuja[]> | null>(null);
  const [ronda, setRonda] = useState(0);
  const [reventada, setReventada] = useState<string | null>(null);
  const [seleccion, setSeleccion] = useState<Burbuja[]>([]);
  const [reto, setReto] = useState<Reto | null>(null);
  // Reto extra opcional (restricción creativa). Nunca se elige solo: nace
  // cuando el jugador explota la pompa de reto y muere al repartir.
  const [retoExtra, setRetoExtra] = useState<RetoExtra | null>(null);
  // Sobrevive al reparto a propósito: la partida siguiente tampoco repite
  // el último reto extra que salió.
  const ultimoRetoExtra = useRef<string | null>(null);
  // Destello en curso: el blanco que se infla desde la pompa de reto y tras el
  // cual se cambia la escena. ("Cambiar reto" NO lo usa: ahí la máquina de
  // escribir borra y reescribe.)
  const [destello, setDestello] = useState<OrigenDestello | null>(null);
  // Vuelo de la palabra revelada: de donde tronó la pompa a su hueco del
  // centro. `llegadas` = huecos que ya recibieron su palabra (SlotsRonda solo
  // pinta esos); `vuelo` = la que va en el aire.
  const [llegadas, setLlegadas] = useState<ReadonlySet<CategoriaBurbuja>>(new Set());
  const [vuelo, setVuelo] = useState<{
    texto: string;
    categoria: CategoriaBurbuja;
    desde: { x: number; y: number };
    hasta: { x: number; y: number };
    escala: number;
  } | null>(null);
  const despegue = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lienzo = useRef<HTMLElement>(null);
  const sinMovimiento = useReducedMotion();
  // Tiempo elegido en el selector (solo selecciona; arranca "¡Comenzar!").
  // Nace en 10 min para que el botón nunca esté deshabilitado, y NO se reinicia
  // al repartir: la siguiente partida recuerda la preferencia del jugador.
  const [duracion, setDuracion] = useState<number>(DURACIONES[1].seg);
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
    setRetoExtra(null);
    setDestello(null);
    if (despegue.current) clearTimeout(despegue.current);
    setVuelo(null);
    setLlegadas(new Set());
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

  const aterriza = (categoria: CategoriaBurbuja) => {
    setLlegadas((prev) => new Set(prev).add(categoria));
    setVuelo(null);
  };

  // La palabra ya se reveló sobre su pompa: ahora despega hacia su hueco. Se
  // mide en el momento (la pompa venía subiendo y los huecos dependen del
  // viewport): origen = la tinta de la palabra revelada, destino = el centro
  // del texto dentro del hueco. Si algo no está, el hueco se llena sin vuelo.
  const despega = (b: Burbuja, texto: string) => {
    const l = lienzo.current;
    const palabra = l?.querySelector("[data-palabra-revelada]");
    const hueco = l?.querySelector<HTMLElement>(`[data-slot="${b.categoria}"]`);
    if (!l || !palabra || !hueco) {
      aterriza(b.categoria);
      return;
    }
    const tinta = document.createRange();
    tinta.selectNodeContents(palabra);
    const rp = tinta.getBoundingClientRect();
    const rh = hueco.getBoundingClientRect();
    const rl = l.getBoundingClientRect();
    const pxHueco = parseFloat(getComputedStyle(hueco).fontSize);
    const pxPalabra = parseFloat(getComputedStyle(palabra).fontSize);
    setVuelo({
      texto,
      categoria: b.categoria,
      desde: { x: rp.left + rp.width / 2 - rl.left, y: rp.top + rp.height / 2 - rl.top },
      // +0.07em: el óvalo lleva más aire arriba que abajo (piezas.ts), así que
      // el texto vive un pelo por debajo del centro de la caja.
      hasta: { x: rh.left + rh.width / 2 - rl.left, y: rh.top + rh.height / 2 - rl.top + pxHueco * 0.07 },
      escala: pxHueco / pxPalabra,
    });
  };

  // Explota una burbuja: la palabra se revela en su lugar, vuela a su hueco y,
  // tras una pausa, cambia la ronda o pasa al reto.
  const tocaBurbuja = (b: Burbuja) => {
    if (reventando.current || reventada !== null) return;
    reventando.current = true;
    // Háptica sutil en móviles: el "pop" también se siente.
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(30);
    setReventada(b.id);
    const nueva = [...seleccion, b];
    setSeleccion(nueva);
    setAnuncio(`Descubriste: ${b.texto}`);
    // Sin movimiento el hueco se llena de una vez; si no, la palabra posa un
    // momento sobre su pompa (la revelación) y luego despega.
    if (sinMovimiento) aterriza(b.categoria);
    else {
      const texto = seleccion.length === 0 ? capitaliza(b.texto) : b.texto;
      despegue.current = setTimeout(() => despega(b, texto), 720);
    }
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
        // 1650 (antes 1400): revelación 0.7 s + vuelo 0.6 s + un respiro con el
        // hueco ya lleno antes de cambiar de ronda.
      }, 1650);
    }
  };

  // Cambia UNA pieza de la frase (tocándola en la pantalla del reto): las otras
  // dos se quedan. No reparte burbujas ni toca el reto extra ni el tiempo. La
  // pieza nueva también entra a la memoria anti-repetición.
  const cambiaParte = (categoria: CategoriaBurbuja) => {
    if (!reto) return;
    const actual = reto.burbujas.find((b) => b.categoria === categoria);
    const nueva = sorteaParte(categoria, actual ? [actual.texto] : []);
    const burbujas = reto.burbujas.map((b) => (b.categoria === categoria ? nueva : b));
    const armado = armaReto(burbujas);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(20);
    recuerdaSeleccion([nueva]);
    setSeleccion(burbujas);
    setReto(armado);
    setAnuncio(`Nueva frase: ${armado.frase}`);
    eventoDopa("parte_cambiada", { categoria });
  };

  // Sortea el reto extra (al explotar su pompa o con "Cambiar reto"), siempre
  // distinto al anterior. No toca la combinación ni el flujo principal.
  const sorteaExtra = (cambio: boolean) => {
    const nuevo = sorteaRetoExtra(ultimoRetoExtra.current);
    ultimoRetoExtra.current = nuevo.id;
    setRetoExtra(nuevo);
    setAnuncio(`Reto extra: ${nuevo.texto}`);
    eventoDopa(cambio ? "reto_extra_cambiado" : "reto_extra_agregado", { categoria: nuevo.categoria });
  };

  // Arranca el destello desde la pompa tocada. El reto NO se sortea aquí sino
  // cuando la pantalla ya está en blanco (onCubierto): así el cambio de layout
  // ocurre tapado. Con reduced-motion no hay destello: se cambia en seco (un
  // fundido a blanco de pantalla completa es justo lo que esa preferencia pide
  // evitar).
  const lanzaDestello = (pompa: HTMLElement) => {
    if (destello) return;
    const l = lienzo.current?.getBoundingClientRect();
    if (!l || sinMovimiento) {
      sorteaExtra(false);
      return;
    }
    const r = pompa.getBoundingClientRect();
    setDestello({
      x: r.left + r.width / 2 - l.left,
      y: r.top + r.height / 2 - l.top,
      tam: r.width,
      ancho: l.width,
      alto: l.height,
    });
  };

  const comienza = () => {
    eventoDopa("duracion_elegida", { seg: duracion, reto_extra: retoExtra !== null });
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
  // Reto y cronómetro comparten estructura: textos centrados en el aire libre
  // y un bloque al fondo (tiempo + ¡Comenzar! / aro + ¡Terminé!). Mismo formato
  // de textos en las dos, así al comenzar nada se encoge ni cambia de sitio.
  const conTextos = enReto || fase === "cronometro";

  return (
    <MotionConfig reducedMotion="user">
      <main className="min-h-[100dvh] bg-[var(--color-bg)] p-2.5 md:p-4">
        <section
          ref={lienzo}
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

          {/* Logo: chico y arriba en TODAS las fases (antes iba grande al
              centro durante las burbujas; ahora el centro es del título). */}
          <div
            aria-hidden="true"
            className="absolute pointer-events-none left-1/2 -translate-x-1/2 top-6 w-[84px] md:w-[100px] opacity-90"
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

          {/* Destello del reto extra: tapa TODO el lienzo (z-40, sobre Salir) */}
          {destello && (
            <Destello origen={destello} onCubierto={() => sorteaExtra(false)} onFin={() => setDestello(null)} />
          )}

          {/* La palabra revelada volando a su hueco */}
          {vuelo && (
            <PalabraVuela
              key={vuelo.categoria}
              texto={vuelo.texto}
              desde={vuelo.desde}
              hasta={vuelo.hasta}
              escala={vuelo.escala}
              onLlega={() => aterriza(vuelo.categoria)}
            />
          )}

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
                  // Al despegar (y ya aterrizada) la palabra deja su pompa.
                  palabraSeFue={vuelo !== null || (reventada !== null && llegadas.size === seleccion.length)}
                  onToca={tocaBurbuja}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Contenido por fase */}
          <div className="relative z-20 flex-1 flex flex-col pointer-events-none">
            {enBurbujas ? (
              // Al centro del lienzo (my-auto), como un HUD: va SOBRE el campo
              // (z-20) y sin pointer-events, así que las pompas que pasan por
              // detrás se siguen pudiendo tocar. La sombra de texto lo separa
              // del vidrio cuando una pompa le cruza por atrás.
              <header
                className="my-auto flex flex-col items-center text-center gap-4 px-6"
                style={{ textShadow: "0 1px 14px rgba(18,64,150,0.55)" }}
              >
                <p className="label text-white">
                  Burbuja {Math.min(ronda + 1, RONDAS.length)} de {RONDAS.length}
                </p>
                {/* Se atenúa mientras una pompa revela su palabra: si tronó
                    sobre el centro, la palabra no pelea con el título. */}
                <h1
                  className={`font-sans text-[clamp(1.25rem,3vw,1.9rem)] font-medium leading-snug text-white max-w-3xl transition-opacity duration-300 ${
                    reventada !== null ? "opacity-25" : ""
                  }`}
                >
                  Explota una burbuja y descubre tu siguiente creación
                </h1>
                <SlotsRonda seleccion={seleccion} llegadas={llegadas} />
              </header>
            ) : (
              <div
                className={`flex-1 flex flex-col items-center justify-center px-6 pointer-events-auto ${
                  // pt-[120px]+ libra el logo chico (top-6 + 84/100px de alto):
                  // en la pantalla final el contenido es alto (formulario) y con
                  // py-24 el título se encimaba con el logo.
                  // En el reto el contenido ya NO se centra: "Tu reto" arranca
                  // arriba, así que el pt debe librar el logo con aire en
                  // ambos breakpoints (acaba en 108px mobile / 124px desktop).
                  conTextos ? "pt-[128px] md:pt-[148px] pb-8 md:pb-9" : "pt-[120px] md:pt-[136px] pb-16"
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
                    // En el reto el bloque ocupa todo el alto: el reto va arriba,
                    // el reto extra se centra en el espacio libre (my-auto) y el
                    // tiempo + ¡Comenzar! caen al fondo.
                    className={`w-full flex flex-col items-center text-center ${conTextos ? "flex-1" : ""}`}
                  >
                    {fase === "reto" && reto && (
                      <>
                        {/* Dos layouts, de arriba hacia abajo (pensados en mobile):
                            SIN reto extra → 1 · el reto (piezas tocables) · 2 · la
                            pompa de reto flotando en el aire libre · 3 · tiempo.
                            CON reto extra (inmersivo) → la pantalla se limpia:
                            solo frase + reto al centro y el tiempo al fondo. El
                            paso de uno a otro ocurre tapado por el Destello. */}
                        {retoExtra ? (
                          <div className="my-auto w-full flex flex-col items-center py-6 md:py-4">
                            <FraseReto reto={reto} onCambiaParte={cambiaParte} />
                            <div className="mt-6 w-full">
                              <BloqueRetoExtra
                                reto={retoExtra}
                                cubriendo={destello !== null}
                                onExplota={lanzaDestello}
                                onCambia={() => sorteaExtra(true)}
                              />
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* 1 — el reto. Ya no lleva la etiqueta "Tu reto":
                                el verbo "Dibuja" de la propia frase hace de
                                etiqueta (vive dentro de FraseReto). */}
                            {/* mt: aire bajo el logo — aquí la frase arranca
                                arriba (no va centrada) y "DIBUJA" quedaba
                                pegado a él. */}
                            <div className="mt-6 md:mt-3 w-full flex justify-center">
                              <FraseReto reto={reto} onCambiaParte={cambiaParte} />
                            </div>

                            {/* Pista: los óvalos punteados de la frase se tocan.
                                Solo aquí; en el layout limpio (con reto extra)
                                el jugador ya lo aprendió y sobra. Ya no hay
                                "Probar otras burbujas": cambiar por piezas lo
                                reemplaza (tres toques = frase nueva). */}
                            <motion.p
                              layout="position"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.85, duration: 0.4 }}
                              className="mt-4 font-sans text-[13px] leading-snug text-white"
                            >
                              Toca una parte de la frase para cambiarla
                            </motion.p>

                            {/* 2 — reto extra opcional: flota en el espacio
                                libre entre el reto y el tiempo (my-auto). */}
                            <div className="my-auto w-full py-5 md:py-3">
                              <BloqueRetoExtra
                                reto={null}
                                cubriendo={destello !== null}
                                onExplota={lanzaDestello}
                                onCambia={() => sorteaExtra(true)}
                                retraso={1}
                              />
                            </div>
                          </>
                        )}

                        {/* 3 — al fondo: el paso que falta para seguir */}
                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.55, duration: 0.4 }}
                          className="w-full flex justify-center"
                        >
                          <SelectorTiempo valor={duracion} onCambia={setDuracion} onComienza={comienza} />
                        </motion.div>
                      </>
                    )}

                    {fase === "cronometro" && reto && (
                      <>
                        {/* Mismo formato EXACTO que la pantalla del reto (frase
                            + etiqueta + reto, mismos tamaños): solo cambia lo
                            de abajo, que pasa de tiempo/¡Comenzar! a aro/
                            ¡Terminé!. Aquí ya no se anima nada del texto. */}
                        <div className="my-auto w-full flex flex-col items-center py-6 md:py-4">
                          <FraseReto reto={reto} estatica />
                          {retoExtra && (
                            <div className="mt-6 w-full flex flex-col items-center">
                              <RetoExtraTexto texto={retoExtra.texto} animado={false} />
                            </div>
                          )}
                        </div>
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
                        <p className="font-sans text-[14px] leading-relaxed text-white max-w-sm mb-6">
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
