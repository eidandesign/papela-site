"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  LIENZO,
  MARGEN_SEGURO,
  parDe,
  RESUMEN_MAX,
  entradasResumen,
  type AnuncioPublico,
  type GrupoResumen,
  montoDe,
  detallePaquete,
} from "@/lib/publicidad";
import QrPlaca from "./QrPlaca";
import { LOGO_LADO } from "./LogoFijo";

// Slide "Resumen": el menú de todo lo que hay en Papela, armado SOLO con los
// demás anuncios de la lista que está reproduciendo la pantalla (agrupados
// por plantilla, en el orden de la lista). Nada se captura aquí: el título,
// el horario, el precio y la foto de cada renglón vienen de su anuncio.
// Todo en px del lienzo 2160×3840. El logo fijo vive arriba (LogoFijo), así
// que el contenido arranca debajo de él. Los tamaños se ajustan a cuántos
// renglones hay para que siempre quepa sin cortar.

const M = MARGEN_SEGURO;
const QR_LADO = 340;
/** Ancho de cada columna de precio (por clase · por paquete) en las secciones con paquetes. */
const COL = 420;
/** Aire mínimo entre la línea de una columna y su contenido. */
const COL_AIRE = 40;
/** Donde empieza el contenido: debajo del logo fijo + aire. */
const TOP = M + LOGO_LADO + 80;
/** Alto reservado abajo para la fila de QR + llamado a la acción. */
const ABAJO = M + 40 + QR_LADO + 220;

export default function Resumen({
  anuncio,
  contexto,
  saliendo = false,
}: {
  anuncio: AnuncioPublico;
  contexto: AnuncioPublico[];
  /** El reproductor está por cambiar: el menú se desvanece. */
  saliendo?: boolean;
}) {
  const reduced = useReducedMotion();
  // El fondo del resumen es SU color; cada renglón usa el color de su anuncio.
  const par = parDe(anuncio);
  const grupos = entradasResumen(contexto, anuncio.id);

  const { visibles, mostrados, ocultos, ultimo } = recortar(grupos);

  const titulo = anuncio.titulo.trim() || "Todo lo que hay";
  const tituloPx = titulo.length <= 16 ? 200 : titulo.length <= 26 ? 168 : 140;
  const encabezado = (anuncio.eyebrow ? 80 : 0) + tituloPx * 1.1 + 100;

  // Alto de renglón según cuántos hay: llena el espacio sin pasarse.
  const disponible =
    LIENZO.alto - TOP - ABAJO - encabezado - (ocultos ? 90 : 0);
  const porGrupo = 104;
  // Cada renglón es una tarjeta con aire entre una y otra. Pocos renglones =
  // más grandes (hasta 380 px); muchos = hasta 150 px.
  const separacion = 48;
  const fila = Math.max(
    150,
    Math.min(
      380,
      Math.floor(
        (disponible - visibles.length * porGrupo - mostrados * separacion) /
          Math.max(1, mostrados),
      ),
    ),
  );
  // La foto llena el alto de la tarjeta menos su margen interno.
  const pad = Math.round(fila * 0.12);
  const foto = fila - pad * 2;
  const tituloItem = Math.round(fila * 0.3);
  const meta = Math.max(38, Math.round(fila * 0.17));
  const precio = Math.max(40, Math.round(fila * 0.2));

  const oculto = reduced ? { opacity: 0 } : { opacity: 0, y: 40 };
  const entra = (i: number) => ({
    initial: oculto,
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduced ? 0.3 : 0.6,
      delay: reduced ? 0 : Math.min(0.15 + i * 0.07, 1.2),
      ease: [0.22, 1, 0.36, 1] as const,
    },
  });

  return (
    <motion.div
      className="absolute inset-0"
      style={{ width: LIENZO.ancho, height: LIENZO.alto, color: par.tinta }}
      initial={false}
      animate={saliendo ? { opacity: 0, y: reduced ? 0 : -16 } : { opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.25 : 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <div
        className="absolute flex flex-col"
        style={{ top: TOP, left: M, right: M, bottom: ABAJO }}
      >
        {anuncio.eyebrow && (
          <motion.span
            {...entra(0)}
            className="label text-center"
            style={{
              fontSize: 44,
              lineHeight: "56px",
              letterSpacing: "0.22em",
              opacity: 0.9,
              marginBottom: 24,
            }}
          >
            {anuncio.eyebrow}
          </motion.span>
        )}
        <motion.h1
          {...entra(1)}
          className="font-serif italic font-normal text-center"
          style={{
            fontSize: tituloPx,
            lineHeight: 1.05,
            color: par.acento,
            textWrap: "balance",
            marginBottom: 72,
          }}
        >
          {titulo}
        </motion.h1>

        {/* La lista se centra en el espacio que queda entre el título y el QR */}
        <div
          className="flex-1 flex flex-col justify-center"
          style={{ minHeight: 0 }}
        >
          {visibles.map((g) => (
            <section key={g.plantilla} style={{ marginBottom: 32 }}>
              <motion.div
                {...entra(g.orden)}
                className="flex items-center"
                style={{ gap: 32, minHeight: porGrupo - 32, marginBottom: conPaquete(g) ? 16 : 0 }}
              >
                {/* Título del grupo grande y sin línea (oct-2026, a petición del dueño: "Clases" no se leía) */}
                <span
                  className="font-serif italic flex-1 min-w-0"
                  style={{
                    fontSize: 84,
                    lineHeight: 1.05,
                    color: par.acento,
                    paddingLeft: pad,
                  }}
                >
                  {g.titulo}
                </span>
                {/* Encabezados de las columnas de precio, alineados con las celdas de cada renglón */}
                {conPaquete(g) && (
                  <span className="flex shrink-0 self-stretch" style={{ paddingRight: pad }}>
                    <EncabezadoCol titulo="Precio por clase" acento={par.acento} />
                    <EncabezadoCol titulo="Precio por paquete" nota="Incluye todos los materiales" acento={par.acento} />
                  </span>
                )}
              </motion.div>
              <ul>
                {g.items.map((a, i) => {
                  const src =
                    a.fondo.tipo === "video" ? a.fondo.poster : a.fondo.url;
                  const c = parDe(a);
                  return (
                    <motion.li
                      key={a.id}
                      {...entra(g.orden + 1 + i)}
                      className="flex items-center"
                      style={{
                        height: fila,
                        marginBottom: separacion,
                        gap: 40,
                        padding: `0 ${conPaquete(g) ? 0 : pad + 8}px 0 ${pad}px`,
                        borderRadius: Math.min(56, Math.round(fila * 0.2)),
                        background: c.panel,
                        color: c.tinta,
                      }}
                    >
                      <span
                        className="shrink-0 overflow-hidden"
                        style={{
                          // Con columnas de precio la foto cede un poco de ancho al título.
                          width: conPaquete(g) ? Math.round(foto * 0.8) : foto,
                          height: conPaquete(g) ? Math.round(foto * 0.8) : foto,
                          borderRadius: Math.min(40, Math.round(foto * 0.16)),
                          background: c.tinte,
                        }}
                      >
                        {src && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={src}
                            alt=""
                            className="w-full h-full object-cover"
                            style={{
                              objectPosition: `${a.fondo.enfoqueX}% ${a.fondo.enfoqueY}%`,
                            }}
                          />
                        )}
                      </span>
                      <span
                        className="flex-1 min-w-0 flex flex-col"
                        style={{ gap: Math.round(fila * 0.05) }}
                      >
                        <span
                          className="font-serif"
                          style={{
                            // Títulos largos un poco más chicos: caben en 2 líneas sin "…".
                            // Con las columnas de precio queda menos ancho: un escalón más chico.
                            fontSize: Math.round(
                              tituloItem *
                                (conPaquete(g)
                                  ? a.titulo.length > 26
                                    ? 0.54
                                    : 0.7
                                  : a.titulo.length > 26
                                    ? 0.78
                                    : 1),
                            ),
                            lineHeight: 1.05,
                            color: c.acento,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {a.titulo}
                        </span>
                        {a.fechaTexto && (
                          <span
                            className="font-sans font-medium truncate"
                            style={{
                              fontSize: conPaquete(g) ? Math.round(meta * 0.88) : meta,
                              lineHeight: 1.2,
                              opacity: 0.9,
                            }}
                          >
                            {a.fechaTexto}
                          </span>
                        )}
                      </span>
                      {conPaquete(g) ? (
                        <span className="flex shrink-0 self-stretch" style={{ paddingRight: pad }}>
                          <span className="relative flex items-center justify-center" style={{ width: COL, padding: `0 ${COL_AIRE}px` }}>
                            <Divisor />
                            {a.precioTexto ? (
                              <span
                                className="font-serif rounded-full whitespace-nowrap"
                                style={{
                                  fontSize: precio,
                                  lineHeight: 1,
                                  padding: `${Math.round(precio * 0.32)}px ${Math.round(precio * 0.7)}px`,
                                  background: c.tinta,
                                  color: c.panel,
                                }}
                              >
                                {montoDe(a.precioTexto)}
                              </span>
                            ) : (
                              <Guion size={precio} />
                            )}
                          </span>
                          <span className="relative flex flex-col items-center justify-center" style={{ width: COL, padding: `0 ${COL_AIRE}px`, gap: Math.round(fila * 0.05) }}>
                            <Divisor />
                            {a.paqueteTexto ? (
                              <>
                                <span
                                  className="font-serif rounded-full whitespace-nowrap"
                                  style={{
                                    fontSize: precio,
                                    lineHeight: 1,
                                    padding: `${Math.round(precio * 0.32) - 4}px ${Math.round(precio * 0.7) - 4}px`,
                                    border: `4px solid ${c.tinta}`,
                                    color: c.tinta,
                                  }}
                                >
                                  {montoDe(a.paqueteTexto)}
                                </span>
                                {detallePaquete(a.paqueteTexto) && (
                                  <span
                                    className="font-sans font-medium whitespace-nowrap"
                                    style={{ fontSize: Math.round(meta * 0.72), lineHeight: 1.1, opacity: 0.9 }}
                                  >
                                    {detallePaquete(a.paqueteTexto)}
                                  </span>
                                )}
                              </>
                            ) : (
                              <Guion size={precio} />
                            )}
                          </span>
                        </span>
                      ) : a.precioTexto && (
                        <span
                          className="font-serif shrink-0 rounded-full whitespace-nowrap"
                          style={{
                            fontSize: precio,
                            lineHeight: 1,
                            padding: `${Math.round(precio * 0.32)}px ${Math.round(precio * 0.7)}px`,
                            background: c.tinta,
                            color: c.panel,
                          }}
                        >
                          {a.precioTexto}
                        </span>
                      )}
                    </motion.li>
                  );
                })}
              </ul>
            </section>
          ))}

          {ocultos > 0 && (
            <motion.p
              {...entra(ultimo)}
              className="font-serif italic text-center"
              style={{ fontSize: 60, opacity: 0.85, marginTop: 8 }}
            >
              y {ocultos} más en papela-atelier.com
            </motion.p>
          )}
        </div>
      </div>

      {/* Abajo: llamado a la acción + QR, alineados a la base */}
      {(anuncio.ctaTexto || anuncio.qrUrl) && (
        <div
          className="absolute flex items-end"
          style={{
            left: M,
            right: M,
            bottom: M + 40,
            gap: 48,
            justifyContent: anuncio.qrUrl ? "space-between" : "center",
          }}
        >
          {anuncio.ctaTexto && (
            <motion.p
              {...entra(ultimo + 1)}
              className="font-serif italic"
              style={{
                fontSize: 96,
                lineHeight: 1.05,
                color: par.acento,
                textAlign: anuncio.qrUrl ? "left" : "center",
                flex: 1,
                minWidth: 0,
                textWrap: "balance",
              }}
            >
              {anuncio.ctaTexto}
            </motion.p>
          )}
          {anuncio.qrUrl && (
            <motion.div {...entra(ultimo + 2)} className="shrink-0">
              <QrPlaca
                url={anuncio.qrUrl}
                campaign={anuncio.id}
                texto=""
                tinta={par.tinta}
                acento={par.acento}
                lado={QR_LADO}
                revelar={reduced ? undefined : Math.min(0.15 + (ultimo + 2) * 0.07, 1.2) + 0.4}
              />
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}

/** La sección lleva columnas de precio si alguno de sus anuncios tiene paquete. */
function conPaquete(g: GrupoResumen): boolean {
  return g.items.some((a) => !!a.paqueteTexto);
}

function EncabezadoCol({ titulo, nota, acento }: { titulo: string; nota?: string; acento: string }) {
  return (
    <span className="flex flex-col items-center justify-end text-center" style={{ width: COL, padding: `0 ${COL_AIRE}px 8px` }}>
      <span className="label" style={{ fontSize: 34, lineHeight: "42px", letterSpacing: "0.12em", color: acento }}>
        {titulo}
      </span>
      {nota && (
        <span className="font-sans font-medium" style={{ fontSize: 32, lineHeight: "40px", opacity: 0.9 }}>
          ({nota.toLowerCase()})
        </span>
      )}
    </span>
  );
}

/** Línea vertical a la izquierda de cada columna de precio (separa las columnas). */
function Divisor() {
  return <span aria-hidden="true" className="absolute left-0" style={{ top: "14%", bottom: "14%", width: 3, borderRadius: 2, background: "currentColor", opacity: 0.22 }} />;
}

/** Celda sin ese precio. */
function Guion({ size }: { size: number }) {
  return (
    <span className="font-serif" style={{ fontSize: size, lineHeight: 1, opacity: 0.5 }} aria-label="No aplica">
      —
    </span>
  );
}

/**
 * Recorta a RESUMEN_MAX renglones respetando el orden de los grupos y numera
 * cada fila (encabezado de grupo + renglones) para escalonar la entrada.
 */
function recortar(grupos: GrupoResumen[]) {
  let restantes = RESUMEN_MAX;
  let orden = 2; // 0 = eyebrow, 1 = título
  const visibles: (GrupoResumen & { orden: number })[] = [];
  for (const g of grupos) {
    if (restantes <= 0) break;
    const items = g.items.slice(0, restantes);
    restantes -= items.length;
    visibles.push({ ...g, items, orden });
    orden += items.length + 1;
  }
  const total = grupos.reduce((n, g) => n + g.items.length, 0);
  const mostrados = visibles.reduce((n, g) => n + g.items.length, 0);
  return { visibles, mostrados, ocultos: total - mostrados, ultimo: orden };
}
