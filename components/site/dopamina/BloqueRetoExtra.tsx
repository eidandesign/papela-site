"use client";

// Reto opcional de Dopamina (pantalla del reto). Es una extensión, no un
// paso: el jugador puede ignorarlo y elegir su tiempo. Dos caras:
//   sin reto → flota una pompa ESPECIAL (vidrio que cambia de color, con la
//              palabra "Reto" legible — las normales van borrosas) y debajo la
//              invitación "Agrega diversión con un reto adicional". Al tocarla
//              NO estalla como las demás: avisa al juego (`onExplota`) y éste
//              la INFLA hasta poner la pantalla en blanco (Destello).
//   con reto → etiqueta "Reto" (pastilla) + el reto escrito a máquina, letra
//              por letra, en la MISMA voz que la frase (serif itálica) pero
//              un escalón más chico: la frase sigue siendo el héroe. Debajo,
//              "Cambiar reto": SIN destello — el reto actual se borra como
//              con la tecla de retroceso y se escribe el nuevo en su lugar.
// El reto sorteado y el destello son de DopaminaJuego (cambian el layout de
// toda la pantalla y el cronómetro los necesita); aquí solo vive el avance de
// la máquina de escribir.

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { CapasVidrio, Reflejos, VIDRIO } from "./CampoBurbujas";
import type { RetoExtra } from "@/lib/dopamina/retos-extra";

// Tamaño propio (no usa --burbuja-escala): aquí la pompa está sola y es el
// único blanco del dedo, no puede encogerse a los 48px de las del campo. En
// mobile va contenida (76px): la pantalla del reto ya viene justa de alto.
const TAM = "clamp(76px, 10vw, 108px)";

// Lo que la distingue: un baño de COLOR bajo las capas del vidrio, con su halo
// en el mismo tono, que va cambiando: dorado → coral → lila → menta → dorado.
// Cada color es una capa de gradiente estático (se pinta una vez) y el cambio
// es un fundido de opacidades (.dopa-reto-color en globals.css): nada se
// repinta por frame. Paleta curada contra el azul del cielo — un tinte azul
// desaparecería — y con opacidades altas a propósito: sobre ese azul un color
// tenue se mezcla hacia gris perla y deja de leerse como "especial".
// Orden = orden de apilado: la que entra siempre queda encima de la que sale.
const tinte = (a: string, b: string, c: string) =>
  `radial-gradient(90% 90% at 34% 28%, rgba(${a},0.92) 0%, rgba(${b},0.78) 48%, rgba(${c},0.7) 100%)`;
const halo = (a: string, b: string) =>
  `radial-gradient(circle, rgba(${a},0.6) 0%, rgba(${b},0.22) 45%, transparent 70%)`;
const COLORES = [
  { tinte: tinte("255,232,140", "255,190,70", "255,138,92"), halo: halo("255,226,140", "255,200,110") }, // dorado
  { tinte: tinte("255,206,214", "255,122,150", "238,84,140"), halo: halo("255,170,190", "255,120,160") }, // coral
  { tinte: tinte("238,214,255", "186,134,255", "146,96,232"), halo: halo("214,180,255", "180,130,255") }, // lila
  { tinte: tinte("214,255,228", "96,226,172", "44,192,160"), halo: halo("160,245,205", "96,226,172") }, // menta
];
const CICLO_S = 10; // vuelta completa: ~2.5 s por color, con ~1 s de fundido

// Capas de color de la pompa (`tinte`) o de su halo. Desfase: la capa i va
// i/N de ciclo detrás, y todo arranca en el 20% del keyframe: la pompa nace
// ya en dorado pleno (no fundiéndose desde el vidrio pelón) y con la última
// capa, que va encima, ya apagada (su 45%).
function CapasColor({ de }: { de: "tinte" | "halo" }) {
  return (
    <>
      {COLORES.map((c, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="dopa-reto-color absolute inset-0 rounded-full"
          style={
            {
              background: c[de],
              "--ciclo": `${CICLO_S}s`,
              "--op-reposo": i === 0 ? 1 : 0,
              animationDelay: `${-CICLO_S * ((1.2 - i / COLORES.length) % 1)}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </>
  );
}

// Máquina de escribir. El texto COMPLETO está en el DOM desde el primer frame:
// lo ya escrito visible y el resto invisible (ocupa su lugar). Así el párrafo
// envuelve igual de principio a fin y nada brinca mientras se escribe — si
// solo se pintara lo escrito, cada salto de línea empujaría toda la pantalla
// (el bloque va centrado). Ritmo: ~28 ms por letra con una pausa tras la
// puntuación, como quien teclea; el más largo (64 caracteres) tarda ~2 s.
//
// Cambio de reto: el componente NO se remonta. Cuando llega un `texto` nuevo
// borra el que está a la vista letra por letra (rápido, como retroceso
// sostenido), y solo con el renglón vacío lo cambia y escribe el nuevo. Lo que
// se ve (`mostrado`) siempre CONVERGE a `texto`: si tocan "Cambiar reto" a
// media escritura, el efecto reinicia desde donde iba (refs) hacia el último
// reto pedido — nunca se queda a la vista un reto distinto al del cronómetro.
//
// Lectores de pantalla: leen el reto real entero (sr-only); las piezas
// animadas van aria-hidden. `animado={false}` (cronómetro) o reduced-motion =
// aparece ya escrito, sin cursor.
const MS_LETRA = 28;
const MS_PAUSA = 170;
const MS_BORRA = 11;

// Etiqueta "Reto" + el reto en la voz de la frase. Compartido por la pantalla
// del reto (animado) y la del cronómetro (fijo): mismo formato en las dos.
export function RetoExtraTexto({
  texto,
  animado = true,
  retraso = 0,
}: {
  texto: string;
  animado?: boolean;
  retraso?: number;
}) {
  const sinMovimiento = useReducedMotion();
  const quieto = !animado || !!sinMovimiento;
  const [mostrado, setMostrado] = useState(texto);
  const [n, setN] = useState(0);
  // Por dónde va la máquina, a salvo de los reinicios del efecto.
  const pos = useRef(0);
  const actual = useRef(texto);

  useEffect(() => {
    if (quieto) return;
    let t: ReturnType<typeof setTimeout>;
    const teclea = () => {
      pos.current++;
      setN(pos.current);
      if (pos.current < texto.length) {
        t = setTimeout(teclea, /[,:;.]/.test(texto[pos.current - 1]) ? MS_PAUSA : MS_LETRA);
      }
    };
    const borra = () => {
      if (pos.current > 0) {
        pos.current--;
        setN(pos.current);
        t = setTimeout(borra, MS_BORRA);
      } else {
        actual.current = texto;
        setMostrado(texto);
        t = setTimeout(teclea, 140); // un respiro con el renglón vacío
      }
    };
    t = actual.current === texto ? setTimeout(teclea, retraso * 1000) : setTimeout(borra, 0);
    return () => clearTimeout(t);
  }, [texto, retraso, quieto]);

  const visible = quieto ? texto : mostrado;
  const visibles = quieto ? texto.length : n;
  return (
    <>
      {/* "Reto" como etiqueta (pastilla `label`, como las categorías de las
          cards del sitio). Entra una sola vez; al cambiar de reto se queda. */}
      <motion.span
        layout="position"
        initial={animado ? { opacity: 0, scale: 0.6 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 20 }}
        // Relleno OSCURO translúcido, no blanco: un blanco al 16% aclara el fondo
        // local y el texto blanco de 11px caía a 3.6:1; con negro al 10% da 5.7:1.
        className="label mb-3 md:mb-4 rounded-full border border-[rgba(255,255,255,0.55)] bg-[rgba(0,0,0,0.1)] px-3.5 py-1 text-white"
      >
        Reto
      </motion.span>
      {/* Siempre un escalón por DEBAJO de la frase (FraseReto: base 1.625rem,
          min(3.4vw,3.5vh), tope 2.75rem): si se tocan esos valores, mover estos. */}
      <p className="font-serif italic text-[clamp(1.375rem,min(2.8vw,3vh),2.25rem)] leading-[1.12] text-white max-w-2xl text-balance">
        <span className="sr-only">{texto}</span>
        <span aria-hidden="true">{visible.slice(0, visibles)}</span>
        {!quieto && (
          // Visible mientras teclea o borra; al terminar parpadea un momento
          // y se apaga.
          <span
            aria-hidden="true"
            className={`dopa-cursor transition-opacity duration-500 ${
              visibles < visible.length || mostrado !== texto ? "" : "opacity-0 delay-[1200ms]"
            }`}
          />
        )}
        <span aria-hidden="true" className="invisible">
          {visible.slice(visibles)}
        </span>
      </p>
    </>
  );
}

export default function BloqueRetoExtra({
  reto,
  cubriendo,
  onExplota,
  onCambia,
  retraso = 0,
}: {
  reto: RetoExtra | null;
  // Hay un destello en curso: la pompa se queda quieta bajo el blanco que crece.
  cubriendo: boolean;
  // El juego recibe la pompa tocada para saber DESDE DÓNDE inflar el blanco.
  onExplota: (origen: HTMLElement) => void;
  // Pide otro reto: sin destello, la máquina de escribir borra y reescribe.
  onCambia: () => void;
  // Delay de entrada, para entrar en la coreografía de la pantalla del reto.
  retraso?: number;
}) {
  // La pompa desaparece tras el destello: el foco pasa a "Cambiar reto" para
  // que el teclado no se quede en el vacío (ref callback = al montar).
  const enfoca = useCallback((el: HTMLButtonElement | null) => el?.focus({ preventScroll: true }), []);

  if (reto) {
    return (
      <div className="flex flex-col items-center">
        {/* Empieza a escribirse cuando el blanco del destello ya se disuelve. */}
        <RetoExtraTexto texto={reto.texto} retraso={0.35} />
        {/* layout="position": si el reto nuevo ocupa otro número de renglones,
            el botón (y la frase, en DopaminaJuego) se DESLIZAN a su sitio en
            vez de brincar. El cambio de alto ocurre con el renglón vacío. */}
        <motion.button
          layout="position"
          ref={enfoca}
          type="button"
          onClick={onCambia}
          className="mt-2 inline-flex min-h-11 items-center gap-1.5 font-sans text-[13px] font-medium text-white underline underline-offset-[6px] decoration-[rgba(255,255,255,0.5)] hover:decoration-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white rounded-sm"
        >
          <ArrowPathIcon className="w-3 h-3" />
          Cambiar reto
        </motion.button>
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { delay: retraso, duration: 0.4 } }}
    >
      <div className="relative" style={{ width: TAM, height: TAM }}>
        {/* Quieta mientras el blanco crece: el destello nace en su centro y
            no debe despegarse de ella. */}
        <span
          className="dopa-flota absolute inset-0 block"
          style={{ animationPlayState: cubriendo ? "paused" : "running" }}
        >
          {/* El halo respira (dopa-brillo) por fuera y cambia de color por
              dentro: dos opacidades, dos elementos. */}
          <span aria-hidden="true" className="dopa-brillo absolute -inset-4 rounded-full pointer-events-none">
            <CapasColor de="halo" />
          </span>
          <motion.button
            type="button"
            onClick={(e) => {
              if (cubriendo) return;
              // Háptica: el mismo toque que las pompas del campo.
              if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(30);
              onExplota(e.currentTarget);
            }}
            aria-label="Agrega diversión con un reto adicional: explota la burbuja para descubrirlo"
            className="relative block w-full h-full rounded-full select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            style={VIDRIO}
            whileHover={cubriendo ? undefined : { scale: 1.07 }}
            whileTap={cubriendo ? undefined : { scale: 0.92 }}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: retraso, type: "spring", stiffness: 220, damping: 18 }}
          >
            <CapasColor de="tinte" />
            <CapasVidrio />
            <span
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center font-serif italic text-[17px] md:text-[19px] leading-none text-white"
              style={{ textShadow: "0 1px 10px rgba(0,0,0,0.28)" }}
            >
              Reto
            </span>
            <Reflejos />
          </motion.button>
        </span>
      </div>
      {/* Rótulo bajo la pompa (el nombre accesible ya lo lleva el botón). Tocar
          el rótulo cuenta como tocar la pompa: el destello nace de ELLA. */}
      <span
        aria-hidden="true"
        onClick={(e) => {
          const pompa = e.currentTarget.parentElement?.querySelector("button");
          if (!cubriendo && pompa) onExplota(pompa);
        }}
        className={`mt-3 md:mt-4 max-w-[20rem] text-balance font-sans text-[14px] md:text-[15px] leading-snug text-white cursor-pointer select-none transition-opacity duration-200 ${
          cubriendo ? "opacity-0" : ""
        }`}
      >
        Agrega diversión con un reto adicional
      </span>
    </motion.div>
  );
}
