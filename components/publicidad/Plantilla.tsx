"use client";

import { motion, useReducedMotion } from "framer-motion";
import { LIENZO, MARGEN_SEGURO, parDe, type AnuncioPublico } from "@/lib/publicidad";
import QrPlaca from "./QrPlaca";

// Capa de textos de un anuncio (todo en px del lienzo 2160×3840). Todo va
// ABAJO, en una sola fila alineada a la base: el panel de color del par del
// Brand Book (contraste sobre la foto o el video) a la izquierda y el QR a la
// derecha. Así la foto respira arriba y no se corta lo importante de la
// imagen (oct-2026, a petición del dueño: el panel arriba tapaba demasiado).
// El logo NO va aquí: vive fijo arriba al centro (LogoFijo), fuera del
// crossfade. Las entradas animan solo transform/opacity y respetan
// prefers-reduced-motion.

const M = MARGEN_SEGURO;
/** Lado del QR en esta plantilla (más chico que la placa suelta, para caber junto al panel). */
const QR_LADO = 340;

export default function Plantilla({ anuncio }: { anuncio: AnuncioPublico }) {
  const reduced = useReducedMotion();
  if (anuncio.plantilla === "libre" || anuncio.plantilla === "resumen") return null;
  const par = parDe(anuncio);
  const tieneQr = !!anuncio.qrUrl;
  const tienePanel = !!(anuncio.eyebrow || anuncio.titulo || anuncio.subtitulo || anuncio.fechaTexto || anuncio.precioTexto || (!tieneQr && anuncio.ctaTexto));

  const oculto = reduced ? { opacity: 0 } : { opacity: 0, y: 60 };
  const visible = { opacity: 1, y: 0 };
  const entra = (delay: number) => ({ initial: oculto, animate: visible, transition: { duration: reduced ? 0.3 : 0.7, delay: reduced ? 0 : delay, ease: [0.22, 1, 0.36, 1] as const } });

  return (
    <div className="absolute inset-0" style={{ width: LIENZO.ancho, height: LIENZO.alto }}>
      <div className="absolute flex items-end justify-end" style={{ left: M, right: M, bottom: M + 40, gap: 48 }}>
        {tienePanel && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0.3 : 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col"
            style={{ flex: 1, minWidth: 0, padding: 88, borderRadius: 72, background: par.panel, color: par.tinta, boxShadow: "0 50px 140px rgba(0,0,0,.30)" }}
          >
            {anuncio.eyebrow && (
              <motion.span {...entra(0.15)} className="label" style={{ fontSize: 36, lineHeight: "46px", letterSpacing: "0.22em", color: par.tinta, opacity: 0.9, marginBottom: 40 }}>
                {anuncio.eyebrow}
              </motion.span>
            )}

            {anuncio.titulo && (
              <motion.h1 {...entra(0.25)} className="font-serif italic font-normal" style={{ fontSize: tituloPx(anuncio.titulo), lineHeight: 1.02, color: par.acento, letterSpacing: "-0.01em", textWrap: "balance" }}>
                {anuncio.titulo}
              </motion.h1>
            )}

            {anuncio.subtitulo && (
              <motion.p {...entra(0.35)} className="font-sans" style={{ fontSize: 52, lineHeight: 1.25, marginTop: 36, opacity: 0.92, textWrap: "balance" }}>
                {anuncio.subtitulo}
              </motion.p>
            )}

            {(anuncio.fechaTexto || anuncio.precioTexto) && (
              <motion.div {...entra(0.45)} className="flex items-center flex-wrap" style={{ gap: 32, marginTop: 56 }}>
                {anuncio.fechaTexto && (
                  <span className="font-sans font-medium" style={{ fontSize: 50, lineHeight: 1.15 }}>
                    {anuncio.fechaTexto}
                  </span>
                )}
                {anuncio.precioTexto && (
                  <span className="font-serif inline-flex items-center rounded-full" style={{ fontSize: 64, lineHeight: 1, padding: "20px 44px", background: par.tinta, color: par.panel }}>
                    {anuncio.precioTexto}
                  </span>
                )}
              </motion.div>
            )}

            {/* Sin QR, el llamado a la acción cierra el panel */}
            {!tieneQr && anuncio.ctaTexto && (
              <motion.p {...entra(0.55)} className="font-serif italic" style={{ fontSize: 64, lineHeight: 1.1, marginTop: 48, color: par.acento }}>
                {anuncio.ctaTexto}
              </motion.p>
            )}
          </motion.div>
        )}

        {tieneQr && (
          <motion.div {...entra(0.55)} className="shrink-0">
            <QrPlaca url={anuncio.qrUrl} campaign={anuncio.id} texto={anuncio.ctaTexto} tinta={par.tinta} acento={par.tinte} lado={QR_LADO} />
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
