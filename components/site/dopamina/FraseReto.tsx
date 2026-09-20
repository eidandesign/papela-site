"use client";

// La frase del reto: el héroe de la pantalla y su <h1>. Se pinta APILADA:
//
//        DIBUJA            ← etiqueta (`label`): el verbo fijo de la plantilla
//     ( Un comal )         ← objeto
//  ( haciendo origami )    ← acción
//    ( en las nubes )      ← cierre
//
// Una pieza por renglón, cada una en su óvalo punteado — el mismo lenguaje de
// los huecos punteados de la pantalla de burbujas: ahí se llenaban, aquí se
// pueden volver a llenar. Con `onCambiaParte` cada óvalo es un botón: tocarlo
// re-sortea SOLO esa pieza (al jugador le gustó el quién y el dónde, pero no el
// qué). Antes la frase iba corrida con los óvalos en línea: una pieza larga
// partía renglón y su óvalo quedaba cortado contra la orilla del lienzo.
//
//   · La primera pieza va con mayúscula (abre la oración) y ya no hay punto
//     final: apilada no es un párrafo. El lector de pantalla sí oye la oración
//     completa ("Dibuja un comal haciendo origami en las nubes.").
//   · SIEMPRE un renglón por pieza (nowrap). La letra base es moderada y el
//     óvalo lleva aire generoso; cuando toca una pieza larga (las hay de 33
//     caracteres: "cobrando en una caja registradora") el stack ENTERO baja de
//     tamaño lo justo para que quepa — las tres piezas juntas, para que sigan
//     parejas. Se mide en un layout effect (antes de pintar: sin parpadeo) y
//     se re-mide si cambia el ancho o termina de cargar la tipografía.
//   · Pieza cambiada: sus palabras nuevas entran una por una.
//   · Sin `onCambiaParte` (cronómetro): mismo apilado con "DIBUJA", pero ahí
//     nada se toca, así que no hay óvalos ni regla de un renglón: la letra va
//     a su tamaño GRANDE (`TAM_FIJA`) sin autoajuste, y una pieza larga
//     simplemente envuelve, balanceada. (Pedido del usuario: con el tamaño
//     autoajustado la frase se veía chica y perdida sobre el aro.)
//   · El wrapper lleva layout="position": si el reto extra cambia de número de
//     renglones, la frase se desliza a su nuevo centro en vez de brincar.
//
// Accesibilidad: el h1 lleva la oración entera en aria-label; lo visual va
// aria-hidden salvo los botones, que se anuncian "Cambiar: …". Son <button>
// reales (foco, Enter/Espacio gratis) de ≥44px de alto.

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { capitaliza, RONDAS } from "@/lib/dopamina/retos";
import { CURVA_SUAVE } from "@/lib/dopamina/animacion";
import type { CategoriaBurbuja, Reto } from "@/lib/dopamina/tipos";
import { OVALO, useAjusteStack } from "./piezas";

// Tamaño BASE (el autoajuste solo lo baja). min(vw, vh): en desktop también
// mira el ALTO de la ventana — tres óvalos apilados + reto extra + tiempo no
// caben en una laptop de 800px de alto al tamaño de un hero. En mobile manda el
// piso de 1.625rem (26px).
const TAM = "text-[clamp(1.625rem,min(3.4vw,3.5vh),2.75rem)]";
// Cronómetro: tamaño de lectura, el que tenía la frase antes de los óvalos.
const TAM_FIJA = "text-[clamp(2rem,min(4.4vw,5vh),3.25rem)]";

export default function FraseReto({
  reto,
  estatica = false,
  onCambiaParte,
}: {
  reto: Reto;
  estatica?: boolean;
  onCambiaParte?: (categoria: CategoriaBurbuja) => void;
}) {
  // Con qué texto nació cada pieza: las palabras de una pieza CAMBIADA entran
  // de inmediato; las del armado inicial esperan a que brote su óvalo.
  const [inicial] = useState(() => new Map(reto.burbujas.map((b) => [b.categoria, b.texto])));

  const piezas = RONDAS.map((r) => reto.burbujas.find((b) => b.categoria === r.id)).filter(
    (b): b is NonNullable<typeof b> => Boolean(b)
  );
  // Respaldo (armaReto sin las 3 piezas): la frase entera como una sola línea.
  const completa = piezas.length === RONDAS.length;

  // Autoajuste (ver piezas.ts): solo los óvalos llevan data-pieza, así que en
  // el cronómetro no ajusta nada.
  const stack = useRef<HTMLHeadingElement>(null);
  useAjusteStack(stack, [reto.frase, onCambiaParte]);

  return (
    <motion.div
      layout="position"
      initial={estatica ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12, type: "spring", stiffness: 200, damping: 20 }}
      className="w-full max-w-3xl"
    >
      <h1
        ref={stack}
        aria-label={reto.frase}
        className={`flex flex-col items-center font-serif italic text-white ${
          onCambiaParte ? `gap-2 md:gap-2.5 ${TAM}` : `gap-1.5 ${TAM_FIJA}`
        }`}
      >
        <motion.span
          aria-hidden="true"
          initial={estatica ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.4 }}
          className="label not-italic text-white mb-2 md:mb-3"
        >
          Dibuja
        </motion.span>

        {!completa && (
          <span aria-hidden="true" className="leading-[1.15] text-balance">
            {reto.frase}
          </span>
        )}

        {completa &&
          piezas.map((b, k) => {
            const nueva = inicial.get(b.categoria) !== b.texto;
            const texto = k === 0 ? capitaliza(b.texto) : b.texto;
            // Palabra por palabra (inline-block con el espacio ENTRE ellas: al
            // final de un inline-block puede colapsarse y quedaban pegadas).
            const palabras = texto.split(" ").flatMap((w, j) => {
              const span = (
                <motion.span
                  key={`${b.texto}:${j}`}
                  aria-hidden="true"
                  className="inline-block"
                  initial={estatica ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: nueva ? 0.04 + j * 0.06 : 0.38 + k * 0.14 + j * 0.05,
                    duration: 0.35,
                    ease: CURVA_SUAVE,
                  }}
                >
                  {w}
                </motion.span>
              );
              return j === 0 ? [span] : [" ", span];
            });
            if (!onCambiaParte) {
              return (
                <span key={b.categoria} className="leading-[1.12] text-balance">
                  {palabras}
                </span>
              );
            }
            return (
              <motion.button
                key={b.categoria}
                data-pieza
                type="button"
                aria-label={`Cambiar: ${b.texto}`}
                onClick={() => onCambiaParte(b.categoria)}
                // Los óvalos brotan uno tras otro, de arriba hacia abajo.
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + k * 0.14, type: "spring", stiffness: 260, damping: 22 }}
                whileTap={{ scale: 0.96 }}
                // min-h-11: cuando el autoajuste encoge la letra, el óvalo no
                // baja de 44px de blanco táctil.
                className={`${OVALO} min-h-11 border-[rgba(255,255,255,0.6)] cursor-pointer select-none transition-colors hover:border-white hover:bg-[rgba(255,255,255,0.1)] active:bg-[rgba(255,255,255,0.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
              >
                {palabras}
              </motion.button>
            );
          })}
      </h1>
    </motion.div>
  );
}
