"use client";

// Ficha de un coleccionable (bottom sheet) — compartida por la PLANILLA y por
// la TARJETA (los stickers del preview también se pueden tocar). Muestra la
// historia, "Copiar sticker", el premio si lo trae, la acción de portada y,
// para los repetidos, el flujo de regalo (código de 72h + WhatsApp).
//
// Si el miembro NO tiene el coleccionable (`mio` vacío), la ficha se ve en
// versión misteriosa: silueta grande y su número, sin revelar nada más.

import { useEffect, useState } from "react";
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
          <div className="text-center">
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

              <p className="text-sm text-[var(--color-muted)] leading-relaxed mt-3 whitespace-pre-line">
                {info?.historia || "Su historia se escribirá muy pronto… ✍️"}
              </p>

              {copia === "copiado" && (
                <p className="text-xs text-[var(--color-muted)] mt-3">Sticker copiado — pégalo donde quieras ✨</p>
              )}
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
                    className={`mt-4 mx-auto flex items-center gap-1.5 px-5 py-2.5 rounded-full border-2 text-xs font-semibold transition ${
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
