"use client";

import { motion, useReducedMotion } from "framer-motion";
import { StarIcon } from "@heroicons/react/24/solid";
import { LIENZO, MARGEN_SEGURO, parDe, type AnuncioPublico } from "@/lib/publicidad";
import QrPlaca from "./QrPlaca";
import { T, crece, desliza, palabra, panel, rebota, sube, type Fase } from "./coreografia";

// Capa de textos de un anuncio (todo en px del lienzo 2160×3840). Todo va
// ABAJO, en una sola fila alineada a la base: el panel de color del par del
// Brand Book (contraste sobre la foto o el video) a la izquierda y el QR a la
// derecha. Así la foto respira arriba y no se corta lo importante de la
// imagen (oct-2026, a petición del dueño: el panel arriba tapaba demasiado).
// El logo NO va aquí: vive fijo arriba al centro (LogoFijo), fuera del
// crossfade. La entrada y la salida de cada pieza están en `coreografia.ts`.

const M = MARGEN_SEGURO;
/** Lado del QR en esta plantilla (más chico que la placa suelta, para caber junto al panel). */
const QR_LADO = 340;

export default function Plantilla({ anuncio, saliendo = false }: { anuncio: AnuncioPublico; saliendo?: boolean }) {
  const reduced = !!useReducedMotion();
  if (anuncio.plantilla === "libre" || anuncio.plantilla === "resumen") return null;
  const par = parDe(anuncio);
  const tieneQr = !!anuncio.qrUrl;
  const tienePanel = !!(anuncio.eyebrow || anuncio.titulo || anuncio.subtitulo || anuncio.fechaTexto || anuncio.precioTexto || anuncio.paqueteTexto || (!tieneQr && anuncio.ctaTexto));
  const fase: Fase = saliendo ? "salida" : "visible";
  const anima = { initial: "oculto", animate: fase } as const;

  // El reloj de la entrada avanza con lo que sí hay: sin etiqueta el título
  // arranca antes, y el subtítulo espera a que termine la última palabra.
  const palabras = anuncio.titulo.trim().split(/\s+/).filter(Boolean);
  let t: number = anuncio.eyebrow ? T.titulo : T.etiqueta;
  const tTitulo = t;
  if (palabras.length) t += palabras.length * T.palabra + 0.25;
  const tSub = t;
  if (anuncio.subtitulo) t += 0.2;
  const tFecha = t;
  const tPrecio = t + (anuncio.fechaTexto ? 0.2 : 0);
  const tPaquete = tPrecio + (anuncio.precioTexto ? 0.18 : 0);
  if (anuncio.fechaTexto || anuncio.precioTexto || anuncio.paqueteTexto) t += anuncio.paqueteTexto ? 0.5 : 0.3;
  const tCta = t;
  // El QR sube igual que el panel, un instante después (a petición del dueño,
  // oct-2026: entrar girando desde la derecha no le gustó).
  const tQr = tienePanel ? T.panel + 0.12 : T.panel;

  return (
    <div className="absolute inset-0" style={{ width: LIENZO.ancho, height: LIENZO.alto }}>
      <div className="absolute flex items-end justify-end" style={{ left: M, right: M, bottom: M + 40, gap: 48 }}>
        {tienePanel && (
          <motion.div
            {...anima}
            variants={panel(reduced)}
            custom={{ delay: T.panel, salida: 0.1 }}
            className="flex flex-col"
            style={{ flex: 1, minWidth: 0, padding: 88, borderRadius: 72, background: par.panel, color: par.tinta, boxShadow: "0 50px 140px rgba(0,0,0,.30)", transformOrigin: "50% 100%" }}
          >
            {anuncio.eyebrow && (
              <div className="flex items-center" style={{ gap: 28, marginBottom: 40 }}>
                <motion.span
                  {...anima}
                  variants={crece(reduced)}
                  custom={{ delay: T.etiqueta, salida: 0.1 }}
                  aria-hidden="true"
                  style={{ width: 72, height: 6, borderRadius: 3, background: par.acento, transformOrigin: "0 50%" }}
                />
                <motion.span
                  {...anima}
                  variants={desliza(reduced)}
                  custom={{ delay: T.etiqueta + 0.12, salida: 0.06 }}
                  className="label"
                  style={{ fontSize: 36, lineHeight: "46px", letterSpacing: "0.22em", color: par.tinta }}
                >
                  <span style={{ opacity: 0.9 }}>{anuncio.eyebrow}</span>
                </motion.span>
              </div>
            )}

            {palabras.length > 0 && (
              <h1 className="font-serif italic font-normal" style={{ fontSize: tituloPx(anuncio.titulo), lineHeight: 1.02, color: par.acento, letterSpacing: "-0.01em", textWrap: "balance" }}>
                {palabras.map((p, i) => (
                  <span key={i}>
                    {/* Máscara por palabra: el relleno deja espacio a acentos,
                        descendentes y la inclinación de la itálica; el margen
                        negativo lo devuelve para no mover el interlineado. */}
                    <span className="inline-block overflow-hidden align-bottom" style={{ padding: "0.12em 0.08em 0.16em", margin: "-0.12em -0.08em -0.16em" }}>
                      <motion.span {...anima} variants={palabra(reduced)} custom={{ delay: tTitulo + i * T.palabra, salida: i * 0.015 }} className="inline-block" style={{ transformOrigin: "0 100%" }}>
                        {p}
                      </motion.span>
                    </span>
                    {i < palabras.length - 1 ? " " : null}
                  </span>
                ))}
              </h1>
            )}

            {anuncio.subtitulo && (
              <motion.p {...anima} variants={sube(reduced, 50)} custom={{ delay: tSub, salida: 0.04 }} className="font-sans" style={{ fontSize: 52, lineHeight: 1.25, marginTop: 36, textWrap: "balance" }}>
                <span style={{ opacity: 0.92 }}>{anuncio.subtitulo}</span>
              </motion.p>
            )}

            {(anuncio.fechaTexto || anuncio.precioTexto) && (
              <div className="flex items-center flex-wrap" style={{ gap: 32, marginTop: 56 }}>
                {anuncio.fechaTexto && (
                  <motion.span {...anima} variants={desliza(reduced)} custom={{ delay: tFecha, salida: 0 }} className="font-sans font-medium" style={{ fontSize: 50, lineHeight: 1.15 }}>
                    {anuncio.fechaTexto}
                  </motion.span>
                )}
                {anuncio.precioTexto && (
                  <motion.span
                    {...anima}
                    variants={rebota(reduced)}
                    custom={{ delay: tPrecio, salida: 0 }}
                    className="font-serif inline-flex items-center rounded-full"
                    style={{ fontSize: 64, lineHeight: 1, padding: "20px 44px", background: par.tinta, color: par.panel }}
                  >
                    {anuncio.precioTexto}
                  </motion.span>
                )}
              </div>
            )}

            {/* El paquete en su propio renglón, con estrella para que destaque
                (a petición del dueño: junto al precio quedaba chico y encimado) */}
            {anuncio.paqueteTexto && (
              <motion.div {...anima} variants={rebota(reduced)} custom={{ delay: tPaquete, salida: 0 }} className="flex" style={{ marginTop: 40 }}>
                <span
                  className="inline-flex items-center"
                  style={{ gap: 26, padding: "22px 60px 24px 40px", borderRadius: 72, border: `6px solid ${par.tinta}`, color: par.tinta }}
                >
                  <StarIcon aria-hidden="true" style={{ width: 66, height: 66, color: par.acento, flexShrink: 0 }} />
                  <span className="flex flex-col">
                    <span className="font-sans font-semibold" style={{ fontSize: 58, lineHeight: 1.1 }}>
                      {anuncio.paqueteTexto}
                    </span>
                    {/* Regla del negocio (oct-2026): todos los paquetes incluyen los materiales.
                        Mismo texto que el encabezado de la columna en el Resumen. */}
                    <span className="font-sans font-medium" style={{ fontSize: 42, lineHeight: 1.2, marginTop: 6, opacity: 0.9 }}>
                      Incluye todos los materiales
                    </span>
                  </span>
                </span>
              </motion.div>
            )}

            {/* Sin QR, el llamado a la acción cierra el panel */}
            {!tieneQr && anuncio.ctaTexto && (
              <motion.p {...anima} variants={sube(reduced, 40)} custom={{ delay: tCta, salida: 0 }} className="font-serif italic" style={{ fontSize: 64, lineHeight: 1.1, marginTop: 48, color: par.acento }}>
                {anuncio.ctaTexto}
              </motion.p>
            )}
          </motion.div>
        )}

        {tieneQr && (
          <motion.div {...anima} variants={panel(reduced)} custom={{ delay: tQr, salida: 0.04 }} className="shrink-0 relative" style={{ transformOrigin: "50% 100%" }}>
            {/* Pulso suave detrás de la placa que invita a escanear */}
            {!reduced && !saliendo && (
              <motion.div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{ borderRadius: Math.round(64 * (QR_LADO / 480)), border: `10px solid ${par.tinte}` }}
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: [0, 0.55, 0], scale: [1, 1, 1.14] }}
                transition={{ duration: 1.8, times: [0, 0.15, 1], ease: "easeOut", delay: tQr + 1.6, repeat: Infinity, repeatDelay: 1.6 }}
              />
            )}
            <QrPlaca url={anuncio.qrUrl} campaign={anuncio.id} texto={anuncio.ctaTexto} tinta={par.tinta} acento={par.tinte} lado={QR_LADO} revelar={reduced ? undefined : tQr + 0.6} />
          </motion.div>
        )}
      </div>
    </div>
  );
}

/** Título de 128 a 176 px según el largo: comparte la fila con el QR. */
function tituloPx(t: string): number {
  if (t.length <= 14) return 176;
  if (t.length <= 24) return 152;
  return 128;
}
