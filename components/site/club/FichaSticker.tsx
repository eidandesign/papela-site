"use client";

// Ficha de un coleccionable (bottom sheet) — compartida por la PLANILLA y por
// la TARJETA (los stickers del preview también se pueden tocar). Muestra la
// historia, "Copiar sticker", el premio si lo trae, la acción de portada y,
// para los repetidos, el flujo de regalo (código de 72h + WhatsApp).
//
// Si el miembro NO tiene el coleccionable (`mio` vacío), la ficha se ve en
// versión misteriosa: silueta grande y su número, sin revelar nada más.

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { CheckIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import {
  ADMIN_ORIGIN, copiarImagen, copiarTexto, stickerSrc,
  type AlbumItem, type DetalleSticker, type PremioSticker, type ResultadoCopiaImagen, type StickerInfo,
} from "./clubTipos";
import HojaClub from "./HojaClub";
import Silueta from "./Silueta";

// Vista previa del premio: la imagen que subió el admin o, si el imprimible ES
// una imagen, el archivo mismo (así siempre se ve lo que uno se lleva). Un PDF
// no se puede previsualizar con <img> → se queda sin miniatura.
const ES_IMAGEN = /\.(png|jpe?g|webp|gif|avif|svg)(\?|$)/i;
function vistaPrevia(premio: PremioSticker): string | null {
  if (premio.imagen) return premio.imagen;
  return premio.url && ES_IMAGEN.test(premio.url) ? premio.url : null;
}

// La historia es un párrafo largo: va a la izquierda y en text-base para leerse
// bien en el celular, pero cortada a 3 líneas para que los botones de abajo
// (premio, portada, regalar) se vean sin hacer scroll. "Leer más" solo aparece
// si el texto de verdad no cabe (una historia corta no lleva el link).
//
// Abrir/cerrar anima la ALTURA del contenedor (no un line-clamp, que salta de
// golpe) y el corte se ve como un desvanecido a blanco que se funde al abrir.
// Abierta termina en `height: auto` para que un giro de pantalla no la recorte;
// al cerrar se vuelve a fijar en px para que la transición tenga de dónde partir.
const LINEAS = 3;
const reducirMovimiento = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Historia({ texto }: { texto: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [abierta, setAbierta] = useState(false);
  const [cortada, setCortada] = useState(false);
  const [colapsado, setColapsado] = useState(0);
  const [alto, setAlto] = useState<number | "auto">("auto");

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const lh = parseFloat(getComputedStyle(el).lineHeight) || 24;
    const tope = Math.round(lh * LINEAS);
    const corta = el.scrollHeight > tope + 1;
    setColapsado(tope);
    setCortada(corta);
    setAbierta(false);
    setAlto(corta ? tope : "auto");
  }, [texto]);

  function alternar() {
    const el = ref.current;
    if (!el) return;
    const completo = el.offsetHeight;
    if (!abierta) {
      setAbierta(true);
      setAlto(reducirMovimiento() ? "auto" : completo);
    } else {
      setAbierta(false);
      if (reducirMovimiento()) { setAlto(colapsado); return; }
      // De "auto" no se puede animar: primero se fija la altura real y, ya
      // pintada, se baja a las 3 líneas.
      setAlto(completo);
      requestAnimationFrame(() => requestAnimationFrame(() => setAlto(colapsado)));
    }
  }

  return (
    <div className="mt-3">
      <div
        className="relative overflow-hidden transition-[height] duration-500 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none"
        style={{ height: alto === "auto" ? "auto" : `${alto}px` }}
        onTransitionEnd={(e) => {
          if (e.propertyName === "height" && abierta) setAlto("auto");
        }}>
        <p ref={ref}
          className="text-base text-[var(--color-muted)] leading-relaxed whitespace-pre-line">
          {texto}
        </p>
        {cortada && (
          <div aria-hidden="true"
            className={`pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent transition-opacity duration-500 motion-reduce:transition-none ${
              abierta ? "opacity-0" : "opacity-100"
            }`} />
        )}
      </div>
      {cortada && (
        <button type="button" onClick={alternar} aria-expanded={abierta}
          className="mt-1 text-sm font-semibold text-[var(--color-verde)] underline underline-offset-2">
          {abierta ? "Leer menos" : "Leer más"}
        </button>
      )}
    </div>
  );
}

// Portada = los óvalos de la tarjeta. `dentro` dice si este sticker ya está
// puesto; `llena` bloquea agregar cuando no quedan espacios.
export type AccionPortada = { dentro: boolean; llena: boolean; alternar: () => void };

export default function FichaSticker({
  token, origen = ADMIN_ORIGIN, sticker, mio, info, portada, onCerrar,
}: {
  token: string;
  origen?: string;
  sticker: StickerInfo;
  mio?: AlbumItem;          // sin esto → versión misteriosa
  info?: DetalleSticker;    // historia + premio (solo llegan si es suyo)
  portada?: AccionPortada;  // sin esto, la ficha no ofrece poner/quitar de portada
  onCerrar: () => void;
}) {
  const [copia, setCopia] = useState<"idle" | "copiando" | ResultadoCopiaImagen>("idle");
  const [regalo, setRegalo] = useState<{ codigo?: string; error?: string; cargando: boolean } | null>(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  const especial = sticker.rareza !== "comun";
  const src = stickerSrc(origen, sticker);
  const previaPremio = info?.premio ? vistaPrevia(info.premio) : null;

  // El globo "Copiado" junto al botón se va solo: es una confirmación, no un
  // estado que el miembro tenga que cerrar.
  useEffect(() => {
    if (copia !== "copiado") return;
    const t = setTimeout(() => setCopia("idle"), 4000);
    return () => clearTimeout(t);
  }, [copia]);

  // Escape cierra primero el modal de regalo (está encima de la hoja).
  useEffect(() => {
    if (!regalo) return;
    const alTeclear = (e: KeyboardEvent) => { if (e.key === "Escape") setRegalo(null); };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [regalo]);

  async function pedirCodigo() {
    setRegalo({ cargando: true });
    try {
      const res = await fetch(`${origen}/api/public/club/${token}/transferir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stickerId: sticker.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "No se pudo generar el código");
      setRegalo({ codigo: json.codigo, cargando: false });
    } catch (e: unknown) {
      setRegalo({ error: (e as Error).message, cargando: false });
    }
  }

  return (
    <>
      <HojaClub label={sticker.nombre} onCerrar={onCerrar} escape={!regalo}>
        {() => (
          <div className="text-left">
          {mio ? (
            <>
              {/* El sticker con su botón de copiar DENTRO del recuadro, abajo a
                  la derecha. El recuadro lleva padding generoso para que el
                  botón caiga sobre el aire y no sobre el dibujo. */}
              <div className="relative w-56 mx-auto">
                {especial ? (
                  <div className="club-marco-holo rounded-[30px] p-[3px]">
                    <div className="bg-white rounded-[27px] p-6">
                      {/* eslint-disable-next-line @next/next/no-img-element -- asset del admin */}
                      <img src={src} alt={sticker.nombre}
                        className="w-full aspect-square object-contain" draggable={false} />
                    </div>
                  </div>
                ) : (
                  <div className="p-6">
                    {/* eslint-disable-next-line @next/next/no-img-element -- asset del admin */}
                    <img src={src} alt={sticker.nombre}
                      className="w-full aspect-square object-contain" draggable={false} />
                  </div>
                )}

                {/* Copiar la imagen — para usarla de sticker en redes/chats */}
                <button
                  onClick={async () => {
                    if (copia === "copiando") return;
                    setCopia("copiando");
                    setCopia(await copiarImagen(src, sticker.slug || sticker.nombre));
                  }}
                  disabled={copia === "copiando"}
                  aria-label={copia === "copiado" ? "Sticker copiado" : "Copiar sticker"}
                  title={copia === "copiado" ? "¡Copiado!" : "Copiar sticker"}
                  className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-[var(--color-cremita-3)] text-[var(--color-verde)] shadow-[0_2px_10px_rgba(18,83,92,.14)] flex items-center justify-center hover:bg-[var(--color-verde)] hover:text-[var(--color-cremita)] transition disabled:opacity-60">
                  {copia === "copiado"
                    ? <CheckIcon className="w-5 h-5" aria-hidden="true" />
                    : <DocumentDuplicateIcon className={`w-5 h-5 ${copia === "copiando" ? "animate-pulse" : ""}`} aria-hidden="true" />}
                </button>

                {/* Globo de confirmación pegado al botón (arriba, con piquito
                    apuntándolo). aria-live para que el lector lo anuncie. */}
                <div role="status" aria-live="polite"
                  className="absolute bottom-[60px] right-0 pointer-events-none">
                  {copia === "copiado" && (
                    <div className="ms-pop relative w-48 rounded-2xl bg-[var(--color-verde)] px-3.5 py-2.5 text-left text-sm leading-snug text-[var(--color-cremita)] shadow-[0_6px_20px_rgba(18,83,92,.22)]">
                      <span className="font-semibold">¡Copiado!</span> Puedes enviarlo por WhatsApp
                      <span aria-hidden="true"
                        className="absolute -bottom-1.5 right-[26px] w-3 h-3 rotate-45 bg-[var(--color-verde)]" />
                    </div>
                  )}
                </div>
              </div>

              <h3 className="font-serif italic text-2xl text-[var(--color-text)] mt-3">{sticker.nombre}</h3>
              {especial && (
                <span className="inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-terracota)]">
                  {sticker.rareza === "legendario" ? "Legendario ★" : "Raro ✦"}
                </span>
              )}
              {(mio.cantidad ?? 1) > 1 && (
                <p className="text-xs text-[var(--color-muted)] mt-1">Lo tienes ×{mio.cantidad}</p>
              )}

              <Historia texto={info?.historia || "Su historia se escribirá muy pronto… ✍️"} />
              {copia === "descargado" && (
                <p className="text-xs text-[var(--color-muted)] mt-3">Se descargó la imagen — revisa tus descargas 📥</p>
              )}
              {copia === "abierto" && (
                <p className="text-xs text-[var(--color-muted)] mt-3">Se abrió en otra pestaña — guárdala desde ahí</p>
              )}
              {copia === false && (
                <p className="text-xs text-[var(--color-terracota)] mt-3">No se pudo copiar — intenta de nuevo</p>
              )}

              {info?.premio && (
                // Bloque del premio: todo alineado a la izquierda (se lee como
                // una tarjetita, no como un aviso centrado).
                <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-cremita-3)] p-4 space-y-2 text-left">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-terracota)]">
                    🎁 Ganaste un premio
                  </p>
                  {/* Miniatura a la izquierda, la info a la derecha. La vista
                      previa es la imagen del admin o, si el imprimible ES una
                      imagen, el archivo mismo (contain para no recortarlo). */}
                  <div className="flex items-start gap-3">
                    {previaPremio && (
                      // eslint-disable-next-line @next/next/no-img-element -- asset del admin, sin optimizador
                      <img src={previaPremio} alt={`Vista previa: ${info.premio.titulo}`}
                        className="w-24 flex-shrink-0 aspect-square object-contain rounded-xl border border-[var(--color-border)] bg-white p-1.5" />
                    )}
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-semibold text-[var(--color-text)]">{info.premio.titulo}</p>
                      {info.premio.descripcion && (
                        <p className="text-xs text-[var(--color-muted)]">{info.premio.descripcion}</p>
                      )}
                    </div>
                  </div>
                  {/* Físico = no hay nada que descargar: se recoge en la tienda */}
                  {info.premio.tipo === "fisico" ? (
                    <p className="inline-block mt-1 px-4 py-2 rounded-full border border-[var(--color-verde)] text-xs font-semibold text-[var(--color-verde)]">
                      Recógelo en Papela Atelier ✨
                    </p>
                  ) : info.premio.url ? (
                    <a href={info.premio.url} target="_blank" rel="noopener noreferrer"
                      className="inline-block mt-1 px-5 py-2.5 rounded-full bg-[var(--color-verde)] text-xs font-semibold text-[var(--color-cremita)] hover:opacity-90 transition">
                      Descargar
                    </a>
                  ) : null}
                </div>
              )}

              {/* Portada: los óvalos de la tarjeta los elige el miembro */}
              {portada && (
                portada.dentro || !portada.llena ? (
                  <button onClick={portada.alternar}
                    className={`mt-4 flex items-center gap-1.5 px-5 py-2.5 rounded-full border-2 text-xs font-semibold transition ${
                      portada.dentro
                        ? "border-[var(--color-terracota)] text-[var(--color-terracota)] hover:bg-[var(--color-terracota)] hover:text-white"
                        : "border-[var(--color-verde)] text-[var(--color-verde)] hover:bg-[var(--color-verde)] hover:text-[var(--color-cremita)]"
                    }`}>
                    <StarIcon className="w-4 h-4" aria-hidden="true" />
                    {portada.dentro ? "Quitar de mi portada" : "Poner en mi portada"}
                  </button>
                ) : (
                  <p className="mt-4 text-xs text-[var(--color-muted)]">
                    Tu portada ya tiene 6 — quita uno para poner este.
                  </p>
                )
              )}

              {mio.transferible && (
                <button onClick={pedirCodigo}
                  className="mt-4 text-xs font-semibold text-[var(--color-verde)] underline underline-offset-2">
                  Regalar mi repetido a otro miembro
                </button>
              )}
            </>
          ) : (
            <>
              <div className="relative w-40 aspect-square mx-auto">
                <Silueta key={src} src={src} className="w-full h-full object-contain opacity-[0.28]" />
              </div>
              <h3 className="font-serif italic text-2xl text-[var(--color-text)] mt-3">N.º {sticker.orden}</h3>
              <p className="text-sm text-[var(--color-muted)] mt-2">
                Por descubrir — consíguelo en tu próxima visita a Papela Atelier para conocer su historia.
              </p>
            </>
          )}
          </div>
        )}
      </HojaClub>

      {/* ── Modal de regalo: código + compartir ── */}
      {regalo && (
        <div role="dialog" aria-modal="true" aria-label={`Regalar ${sticker.nombre}`}
          className="fixed inset-0 z-[100004] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setRegalo(null)} aria-hidden="true" />
          <div className="relative w-full max-w-xs bg-white rounded-3xl p-6 text-center space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- asset del admin */}
            <img src={src} alt={sticker.nombre} className="w-24 h-24 object-contain mx-auto" draggable={false} />
            <h3 className="font-serif italic text-xl text-[var(--color-text)]">Regalar {sticker.nombre}</h3>
            {regalo.cargando && <p className="text-sm text-[var(--color-muted)] animate-pulse">Generando código…</p>}
            {regalo.error && <p className="text-sm text-[var(--color-terracota)]">{regalo.error}</p>}
            {regalo.codigo && (
              <>
                <p className="text-xs text-[var(--color-muted)]">
                  Comparte este código con otro miembro del Club — lo canjea en su planilla.
                  Vale 72 horas y un solo uso; al canjearlo, tu repetido pasa a su álbum.
                </p>
                <p className="font-mono text-[11px] bg-[var(--color-cremita-3)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 break-all select-all">
                  {regalo.codigo}
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={async () => {
                      if (await copiarTexto(regalo.codigo!)) {
                        setCodigoCopiado(true);
                        setTimeout(() => setCodigoCopiado(false), 2000);
                      }
                    }}
                    className="px-4 py-2.5 rounded-full border-2 border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] hover:border-[var(--color-verde)] transition">
                    {codigoCopiado ? "✓ Copiado" : "Copiar"}
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`🎁 Te regalo mi sticker repetido "${sticker.nombre}" del Club Creativo Papela. Canjea este código en tu planilla: ${regalo.codigo}`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-full bg-[var(--color-verde)] text-xs font-semibold text-[var(--color-cremita)] hover:opacity-90 transition">
                    Enviar por WhatsApp
                  </a>
                </div>
              </>
            )}
            <button onClick={() => setRegalo(null)} className="text-xs text-[var(--color-muted)] underline">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
