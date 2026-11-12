"use client";

import { useState } from "react";
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
import { medioLocal } from "./medios";

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
/** Alto reservado abajo: con QR, la fila de QR; sin QR, solo el llamado a la acción. */
const ABAJO_QR = M + 40 + QR_LADO + 120;
const ABAJO_CTA = M + 40 + 260;
const ABAJO_NADA = M;
/** Tamaño del título de cada grupo ("Clases", "Talleres"). */
const GRUPO_PX = 100;
/** Alto que ocupa el encabezado de un grupo (título + aire). */
const POR_GRUPO = 150;
/** Separación entre tarjetas. */
const SEPARACION = 44;
/**
 * Con pocos renglones cada uno es una TARJETA GRANDE (foto a todo el alto,
 * título y precios con su etiqueta, todo legible a varios metros). Con
 * muchos, se usa la fila compacta. El cambio ocurre cuando la tarjeta grande
 * ya no tendría este alto.
 */
const GRANDE_MIN = 400;
const GRANDE_MAX = 760;

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
  // Fotos de los renglones, resueltas UNA vez al montar: si cambiaran a media
  // pantalla (la copia local termina de bajar) las miniaturas parpadearían.
  const [fotos] = useState(() => {
    const m: Record<string, string> = {};
    for (const g of grupos) for (const a of g.items) m[a.id] = medioLocal(a.fondo.tipo === "video" ? a.fondo.poster : a.fondo.url);
    return m;
  });

  const { visibles, mostrados, ocultos, ultimo } = recortar(grupos);

  const titulo = anuncio.titulo.trim() || "Todo lo que hay";
  const tituloPx = titulo.length <= 16 ? 220 : titulo.length <= 26 ? 190 : 156;
  const eyebrowPx = 56;
  const encabezado = (anuncio.eyebrow ? Math.round(eyebrowPx * 1.25) + 20 : 0) + tituloPx * 1.05 + 56;
  const abajo = anuncio.qrUrl ? ABAJO_QR : anuncio.ctaTexto ? ABAJO_CTA : ABAJO_NADA;

  // Alto de renglón según cuántos hay: llena el espacio sin pasarse.
  const disponible = LIENZO.alto - TOP - abajo - encabezado - (ocultos ? 110 : 0);
  const altoCon = (sep: number) =>
    Math.floor((disponible - visibles.length * POR_GRUPO - mostrados * sep) / Math.max(1, mostrados));
  const grande = altoCon(SEPARACION) >= GRANDE_MIN;
  // Muchos renglones: menos aire entre ellos para darle ese alto a la letra.
  const separacion = grande ? SEPARACION : 28;
  // Tarjeta grande: hasta 760 px. Fila compacta: crece hasta donde empieza la grande.
  const fila = grande
    ? Math.min(GRANDE_MAX, altoCon(separacion))
    : Math.max(150, Math.min(GRANDE_MIN - 1, altoCon(separacion)));
  // La foto llena el alto de la tarjeta menos su margen interno.
  const pad = Math.round(fila * 0.12);
  const foto = fila - pad * 2;
  const tituloItem = Math.round(fila * 0.3);
  const meta = Math.max(40, Math.round(fila * 0.17));
  const precio = Math.max(48, Math.round(fila * 0.2));

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
        style={{ top: TOP, left: M, right: M, bottom: abajo }}
      >
        {anuncio.eyebrow && (
          <motion.span
            {...entra(0)}
            className="label text-center"
            style={{
              fontSize: eyebrowPx,
              lineHeight: 1.25,
              letterSpacing: "0.2em",
              opacity: 0.9,
              marginBottom: 20,
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
            marginBottom: 56,
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
            <section key={g.plantilla}>
              <motion.div
                {...entra(g.orden)}
                className="flex items-center"
                style={{ gap: 32, minHeight: POR_GRUPO - 40, marginBottom: 24 }}
              >
                {/* Título del grupo grande y sin línea (oct-2026, a petición del dueño: "Clases" no se leía) */}
                <span
                  className="font-serif italic flex-1 min-w-0"
                  style={{
                    fontSize: GRUPO_PX,
                    lineHeight: 1.05,
                    color: par.acento,
                    paddingLeft: grande ? 0 : pad,
                  }}
                >
                  {g.titulo}
                </span>
                {/* Encabezados de las columnas de precio, alineados con las celdas de cada renglón */}
                {!grande && conPaquete(g) && (
                  <span className="flex shrink-0 self-stretch" style={{ paddingRight: pad }}>
                    <EncabezadoCol titulo="Clase" acento={par.acento} />
                    <EncabezadoCol titulo="Paquete" acento={par.acento} />
                  </span>
                )}
              </motion.div>
              <ul>
                {g.items.map((a, i) => {
                  // Desde la copia en memoria si ya se bajó (ver medios.ts).
                  const src = fotos[a.id] ?? (a.fondo.tipo === "video" ? a.fondo.poster : a.fondo.url);
                  const c = parDe(a);
                  if (grande) {
                    return (
                      <motion.li key={a.id} {...entra(g.orden + 1 + i)} style={{ marginBottom: separacion }}>
                        <TarjetaGrande anuncio={a} src={src} alto={fila} />
                      </motion.li>
                    );
                  }
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
                            // Nunca menos de 56 px: a varios metros, menos ya no se lee.
                            fontSize: Math.max(
                              56,
                              Math.round(
                                tituloItem *
                                  (conPaquete(g)
                                    ? a.titulo.length > 26
                                      ? 0.62
                                      : 0.78
                                    : a.titulo.length > 26
                                      ? 0.8
                                      : 1),
                              ),
                            ),
                            lineHeight: 1.05,
                            color: c.acento,
                            display: "-webkit-box",
                            WebkitLineClamp: fila < 240 ? 1 : 2,
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
                              fontSize: Math.max(40, conPaquete(g) ? Math.round(meta * 0.88) : meta),
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
                                    style={{ fontSize: Math.max(36, Math.round(meta * 0.72)), lineHeight: 1.1, opacity: 0.9 }}
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
              style={{ fontSize: 76, opacity: 0.85, marginTop: 8 }}
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
                fontSize: 108,
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

/**
 * Renglón grande (pocos anuncios): la foto a todo el alto a la izquierda y, a
 * su lado, título, día y hora, y los precios con su etiqueta. Todo escala con
 * el alto de la tarjeta (`alto`, 480–760 px del lienzo).
 */
function TarjetaGrande({ anuncio: a, src, alto }: { anuncio: AnuncioPublico; src: string; alto: number }) {
  const c = parDe(a);
  // Un título corto cabe en un renglón y deja aire para subir todo un escalón;
  // uno largo ocupa dos y el resto se ajusta para no cortarse.
  const largo = a.titulo.length;
  const corto = largo <= 22;
  // Tarjeta baja (varios anuncios): los precios pasan a la derecha del título
  // en vez de debajo, para no perder tamaño de letra.
  const lado = alto < 560;
  // En la baja el límite es el ANCHO (título y precios comparten fila): la
  // foto se angosta y la letra sube hasta donde cabe sin cortarse.
  const pad = Math.round(alto * (lado ? 0.08 : corto ? 0.075 : 0.06));
  const fotoAncho = Math.round(alto * (lado ? 0.5 : 0.62));
  const tituloPx = Math.round(alto * (lado ? (corto ? 0.24 : largo > 40 ? 0.15 : 0.18) : corto ? 0.19 : largo > 40 ? 0.12 : 0.141));
  const fechaPx = Math.round(alto * (lado ? 0.125 : corto ? 0.1 : 0.094));
  const etiquetaPx = Math.max(40, Math.round(alto * (lado ? 0.098 : corto ? 0.068 : 0.064)));
  const montoPx = Math.round(alto * (lado ? 0.25 : corto ? 0.19 : 0.178));
  const detallePx = Math.max(40, Math.round(alto * (lado ? 0.098 : corto ? 0.072 : 0.068)));
  const aire = Math.round(alto * (lado ? 0.06 : 0.07));

  // Precios: la clase (o el precio del anuncio) y, si hay, el paquete.
  const precios: { etiqueta: string; monto: string; detalle?: string }[] = [];
  if (a.precioTexto) {
    precios.push({
      etiqueta: a.plantilla === "clase" ? "Por clase" : a.paqueteTexto ? "Precio" : "",
      monto: montoDe(a.precioTexto),
    });
  }
  if (a.paqueteTexto) {
    precios.push({ etiqueta: "Paquete", monto: montoDe(a.paqueteTexto), detalle: detallePaquete(a.paqueteTexto) || undefined });
  }

  return (
    <div
      className="flex overflow-hidden"
      style={{ height: alto, borderRadius: 64, background: c.panel, color: c.tinta }}
    >
      <span className="shrink-0 overflow-hidden" style={{ width: fotoAncho, height: alto, background: c.tinte }}>
        {src && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover"
            style={{ objectPosition: `${a.fondo.enfoqueX}% ${a.fondo.enfoqueY}%` }}
          />
        )}
      </span>
      <span
        className={`flex-1 min-w-0 flex ${lado ? "items-center" : "flex-col justify-center"}`}
        style={{ padding: `${pad}px ${pad + 8}px`, gap: lado ? Math.round(alto * 0.07) : 0 }}
      >
        <span className="flex-1 min-w-0 flex flex-col">
          <span
            className="font-serif"
            style={{
              fontSize: tituloPx,
              lineHeight: 1.04,
              color: c.acento,
              textWrap: "balance",
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
              className="font-sans font-medium"
              style={{ fontSize: fechaPx, lineHeight: 1.2, marginTop: Math.round(alto * 0.03) }}
            >
              {a.fechaTexto}
            </span>
          )}
        </span>
        {precios.length > 0 && (
          <span className="flex shrink-0" style={{ marginTop: lado ? 0 : Math.round(alto * 0.06) }}>
            {precios.map((p, i) => (
              <span
                key={p.etiqueta || i}
                className={`relative flex flex-col min-w-0 ${lado ? "justify-center" : ""}`}
                style={i > 0 ? { marginLeft: aire, paddingLeft: aire } : undefined}
              >
                {/* Línea entre precios (sin color-mix: Yodeck corre Chrome 94) */}
                {i > 0 && <Divisor />}
                {p.etiqueta && (
                  <span className="label whitespace-nowrap" style={{ fontSize: etiquetaPx, lineHeight: 1.2, letterSpacing: "0.14em", opacity: 0.85 }}>
                    {p.etiqueta}
                  </span>
                )}
                <span className="font-serif whitespace-nowrap" style={{ fontSize: montoPx, lineHeight: 1.05, marginTop: p.etiqueta ? Math.round(alto * 0.035) : 0 }}>
                  {p.monto}
                </span>
                {p.detalle && (
                  <span className="font-sans font-medium whitespace-nowrap" style={{ fontSize: detallePx, lineHeight: 1.2, opacity: 0.9, marginTop: Math.round(alto * 0.018) }}>
                    {p.detalle}
                  </span>
                )}
              </span>
            ))}
          </span>
        )}
      </span>
    </div>
  );
}

/** La sección lleva columnas de precio si alguno de sus anuncios tiene paquete. */
function conPaquete(g: GrupoResumen): boolean {
  return g.items.some((a) => !!a.paqueteTexto);
}

function EncabezadoCol({ titulo, acento }: { titulo: string; acento: string }) {
  return (
    <span className="flex items-center justify-center text-center" style={{ width: COL, padding: `0 ${COL_AIRE}px` }}>
      <span className="label" style={{ fontSize: 56, lineHeight: "64px", letterSpacing: "0.16em", color: acento }}>
        {titulo}
      </span>
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
