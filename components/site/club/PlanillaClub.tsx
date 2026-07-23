"use client";

// Planilla del Club Creativo — los 100 espacios del álbum, estilo vitrina de
// coleccionables y SIMPLE: logo + flecha atrás + "Mi planilla Papela" + X/100
// y la pura cuadrícula. Obtenidos a color (los raros/legendarios con MARCO
// HOLOGRÁFICO animado); los definidos-pero-no-obtenidos se ven como SILUETA
// (la forma en sombra, sin revelar la imagen — misterio); espacios sin
// definir (o sin imagen) muestran "?".
//
// Tap en cualquier coleccionable definido → FICHA (bottom sheet) con su
// historia, botón "Copiar sticker" (la imagen al portapapeles, para usarla
// en redes) y, si tiene, su premio descargable — todo solo para quien YA lo
// tiene (el servidor ni los manda si no). Regalar duplicados y canjear un
// código de regalo también viven aquí, discretos.

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  ADMIN_ORIGIN, copiarImagen, copiarTexto, stickerSrc,
  type AlbumItem, type Catalogo, type DetalleSticker, type ResultadoCopiaImagen, type StickerInfo,
} from "./clubTipos";

// Silueta de misterio: la imagen real pintada como pura sombra (brightness 0).
// Si el asset no existe (404), no deja el icono de imagen rota: se esconde y
// la casilla queda solo con su número. El chequeo de naturalWidth cubre las
// imágenes que fallaron ANTES de que React colgara el onError (caché rota).
function Silueta({ src, className }: { src: string; className: string }) {
  const [rota, setRota] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  // El padre monta esta pieza con key={src}, así que un cambio de src
  // remonta el componente con `rota` limpio en vez de resetearlo aquí.
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setRota(true);
  }, []);
  if (rota) return <div className={className} aria-hidden="true" />;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- asset del admin
    <img ref={ref} src={src} alt="" className={className} style={{ filter: "brightness(0)" }}
      loading="lazy" draggable={false} aria-hidden="true" onError={() => setRota(true)} />
  );
}

export default function PlanillaClub({
  token, origen = ADMIN_ORIGIN, catalogo, album, detalles = {}, obtenidos, pendientes,
  onCerrar, onRascar, onCambio,
}: {
  token: string;
  origen?: string;
  catalogo: Catalogo;
  album: AlbumItem[];
  detalles?: Record<number, DetalleSticker>;
  obtenidos: number;
  pendientes: number;
  onCerrar: () => void;
  onRascar: () => void;   // abre el rascado de un pendiente
  onCambio: () => void;   // refresca la tarjeta (tras reclamar un regalo)
}) {
  const [detalle, setDetalle] = useState<StickerInfo | null>(null);
  const [copia, setCopia] = useState<"idle" | "copiando" | ResultadoCopiaImagen>("idle");
  const [regalo, setRegalo] = useState<{ sticker: StickerInfo; codigo?: string; error?: string; cargando: boolean } | null>(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const [canjeAbierto, setCanjeAbierto] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [reclamando, setReclamando] = useState(false);
  const [avisoReclamo, setAvisoReclamo] = useState<{ ok: boolean; msg: string } | null>(null);

  const porId = useMemo(() => new Map(album.map((a) => [a.id, a])), [album]);
  const porOrden = useMemo(() => new Map(catalogo.stickers.map((s) => [s.orden, s])), [catalogo.stickers]);

  async function pedirCodigo(sticker: StickerInfo) {
    setRegalo({ sticker, cargando: true });
    try {
      const res = await fetch(`${origen}/api/public/club/${token}/transferir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stickerId: sticker.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "No se pudo generar el código");
      setRegalo({ sticker, codigo: json.codigo, cargando: false });
    } catch (e: unknown) {
      setRegalo({ sticker, error: (e as Error).message, cargando: false });
    }
  }

  async function reclamar() {
    if (!codigo.trim() || reclamando) return;
    setReclamando(true);
    setAvisoReclamo(null);
    try {
      const res = await fetch(`${origen}/api/public/club/${token}/reclamar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: codigo.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "No se pudo canjear el código");
      setCodigo("");
      setAvisoReclamo({ ok: true, msg: "🎁 ¡Regalo recibido! Ráscalo para ver qué es." });
      onCambio();
    } catch (e: unknown) {
      setAvisoReclamo({ ok: false, msg: (e as Error).message });
    } finally {
      setReclamando(false);
    }
  }

  const mioDetalle = detalle ? porId.get(detalle.id) : undefined;
  const infoDetalle = detalle ? detalles[detalle.id] : undefined;
  const especial = (r: StickerInfo["rareza"]) => r !== "comun";

  // Abrir la ficha resetea el estado del botón "Copiar sticker".
  function abrirFicha(s: StickerInfo) {
    setCopia("idle");
    setDetalle(s);
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Mi planilla Papela"
      className="fixed inset-0 z-[100002] bg-[var(--color-bg)] overflow-y-auto">
      <style>{`
        /* Marco holográfico para raros/legendarios: gradiente pastel girando. */
        @keyframes club-marco-holo {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .club-marco-holo {
          background: linear-gradient(120deg, #ffb6d9, #a8e6ff, #fff3b0, #d9c8ff, #ffb6d9);
          background-size: 300% 300%;
          animation: club-marco-holo 4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .club-marco-holo { animation: none; }
        }
      `}</style>

      {/* Logo — como en la tarjeta, presenta la planilla */}
      <div className="pt-6 flex justify-center">
        <Image src="/images/Logo-papela-verde.svg" alt="Papela Atelier" width={80} height={80} className="h-20 w-20" />
      </div>

      {/* Header — flecha atrás + título centrado */}
      <div className="sticky top-0 z-10 bg-[var(--color-bg)]/95 backdrop-blur-sm px-5 pt-4 pb-4">
        <div className="max-w-lg mx-auto relative text-center">
          <button onClick={onCerrar} aria-label="Volver a mi tarjeta"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-[0_2px_10px_rgba(18,83,92,.12)] flex items-center justify-center text-[var(--color-text)] hover:text-[var(--color-verde)] transition">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h2 className="font-serif italic text-2xl text-[var(--color-text)] leading-none">Mi planilla Papela</h2>
          <p className="text-sm text-[var(--color-muted)] mt-1.5">{obtenidos} / {catalogo.total}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 pt-2 pb-16 space-y-6">
        {pendientes > 0 && (
          <button onClick={onRascar}
            className="block mx-auto text-sm font-semibold text-[var(--color-verde)] underline underline-offset-2">
            🎁 Tienes {pendientes} por revelar — rascar
          </button>
        )}

        {/* Los 100 espacios */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {Array.from({ length: catalogo.total }, (_, i) => {
            const orden = i + 1;
            const sticker = porOrden.get(orden);
            const mio = sticker ? porId.get(sticker.id) : undefined;

            if (sticker && mio) {
              const tile = (
                <button onClick={() => abrirFicha(sticker)}
                  className="relative w-full h-full rounded-2xl bg-white p-2 pt-3 text-center shadow-[0_2px_8px_rgba(18,83,92,.07)] hover:shadow-[0_4px_14px_rgba(18,83,92,.14)] transition">
                  {/* eslint-disable-next-line @next/next/no-img-element -- asset del admin */}
                  <img src={stickerSrc(origen, sticker)} alt={sticker.nombre}
                    className="w-full aspect-square object-contain" loading="lazy" draggable={false} />
                  <p className="text-[10px] font-semibold text-[var(--color-text)] truncate mt-1 mb-0.5">{sticker.nombre}</p>
                  {mio.cantidad > 1 && (
                    <span className="absolute top-1.5 right-1.5 text-[10px] font-bold bg-[var(--color-terracota)] text-white rounded-full px-1.5 py-0.5">
                      ×{mio.cantidad}
                    </span>
                  )}
                </button>
              );
              // Los especiales llevan marco holográfico animado.
              return especial(sticker.rareza) ? (
                <div key={orden} className="club-marco-holo rounded-[18px] p-[2.5px]">{tile}</div>
              ) : (
                <div key={orden}>{tile}</div>
              );
            }

            if (sticker && sticker.imagen_url) {
              // Definido pero no obtenido: SILUETA (solo la forma, en sombra —
              // la imagen no se revela; el misterio invita a conseguirlo).
              return (
                <button key={orden} onClick={() => abrirFicha(sticker)}
                  className="rounded-2xl border-[1.5px] border-dashed border-[var(--color-border)] bg-white/60 p-2 pt-3 text-center hover:border-[var(--color-verde)]/40 transition">
                  <Silueta key={stickerSrc(origen, sticker)} src={stickerSrc(origen, sticker)}
                    className="w-full aspect-square object-contain opacity-[0.26]" />
                  <p className="text-[10px] font-semibold text-[var(--color-muted)] mt-1 mb-0.5">N.º {orden}</p>
                </button>
              );
            }

            return (
              <div key={orden}
                className="rounded-2xl border-[1.5px] border-dashed border-[var(--color-border)] bg-white/40 p-2 text-center flex flex-col items-center justify-center aspect-[5/6]">
                <span className="text-2xl text-[var(--color-muted)]/35" aria-hidden="true">?</span>
                <p className="text-[10px] text-[var(--color-muted)]/50 mt-1">N.º {orden}</p>
              </div>
            );
          })}
        </div>

        {/* Canjear un código de regalo — discreto */}
        <div className="text-center space-y-3">
          {!canjeAbierto ? (
            <button onClick={() => setCanjeAbierto(true)}
              className="text-xs text-[var(--color-muted)] underline underline-offset-2">
              ¿Te regalaron un código?
            </button>
          ) : (
            <div className="max-w-xs mx-auto space-y-2">
              <div className="flex gap-2">
                <input
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="Pega aquí el código"
                  className="flex-1 min-w-0 rounded-xl border border-[var(--color-border)] px-3.5 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-verde)]"
                  aria-label="Código de regalo"
                />
                <button onClick={reclamar} disabled={reclamando || !codigo.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[var(--color-verde)] text-sm font-semibold text-[var(--color-cremita)] disabled:opacity-40 transition">
                  {reclamando ? "…" : "Canjear"}
                </button>
              </div>
              {avisoReclamo && (
                <p className={`text-xs ${avisoReclamo.ok ? "text-[var(--color-verde)]" : "text-[var(--color-terracota)]"}`}>
                  {avisoReclamo.msg}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Ficha del coleccionable (bottom sheet) ── */}
      {detalle && (
        <div role="dialog" aria-modal="true" aria-label={detalle.nombre}
          className="fixed inset-0 z-[100003] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setDetalle(null)} aria-hidden="true" />
          <div className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] overflow-y-auto p-6 text-center">
            <button onClick={() => setDetalle(null)} aria-label="Cerrar"
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-cremita-3)] transition">
              ✕
            </button>

            {mioDetalle ? (
              <>
                {especial(detalle.rareza) ? (
                  <div className="club-marco-holo rounded-[26px] p-[3px] w-40 mx-auto">
                    <div className="bg-white rounded-3xl p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element -- asset del admin */}
                      <img src={stickerSrc(origen, detalle)} alt={detalle.nombre}
                        className="w-full aspect-square object-contain" draggable={false} />
                    </div>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element -- asset del admin
                  <img src={stickerSrc(origen, detalle)} alt={detalle.nombre}
                    className="w-40 aspect-square object-contain mx-auto" draggable={false} />
                )}

                <h3 className="font-serif italic text-2xl text-[var(--color-text)] mt-3">{detalle.nombre}</h3>
                {especial(detalle.rareza) && (
                  <span className="inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-terracota)]">
                    {detalle.rareza === "legendario" ? "Legendario ★" : "Raro ✦"}
                  </span>
                )}
                {(mioDetalle.cantidad ?? 1) > 1 && (
                  <p className="text-xs text-[var(--color-muted)] mt-1">Lo tienes ×{mioDetalle.cantidad}</p>
                )}

                <p className="text-sm text-[var(--color-muted)] leading-relaxed mt-3 whitespace-pre-line">
                  {infoDetalle?.historia || "Su historia se escribirá muy pronto… ✍️"}
                </p>

                {/* Copiar la imagen — para usarla de sticker en redes/chats */}
                <button
                  onClick={async () => {
                    if (copia === "copiando") return;
                    setCopia("copiando");
                    setCopia(await copiarImagen(stickerSrc(origen, detalle), detalle.slug || detalle.nombre));
                  }}
                  disabled={copia === "copiando"}
                  className="mt-4 px-5 py-2.5 rounded-full border-2 border-[var(--color-verde)] text-xs font-semibold text-[var(--color-verde)] hover:bg-[var(--color-verde)] hover:text-[var(--color-cremita)] transition disabled:opacity-50">
                  {copia === "copiando" ? "Copiando…" : copia === "copiado" ? "✓ Copiado" : "Copiar sticker"}
                </button>
                {copia === "copiado" && (
                  <p className="text-xs text-[var(--color-muted)] mt-2">Pégalo donde quieras — chats, redes, notas ✨</p>
                )}
                {copia === "descargado" && (
                  <p className="text-xs text-[var(--color-muted)] mt-2">Se descargó la imagen — revisa tus descargas 📥</p>
                )}
                {copia === "abierto" && (
                  <p className="text-xs text-[var(--color-muted)] mt-2">Se abrió en otra pestaña — guárdala desde ahí</p>
                )}
                {copia === false && (
                  <p className="text-xs text-[var(--color-terracota)] mt-2">No se pudo copiar — intenta de nuevo</p>
                )}

                {infoDetalle?.premio && (
                  <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-cremita-3)] p-4 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-terracota)]">
                      🎁 Este sticker trae premio
                    </p>
                    {infoDetalle.premio.imagen && (
                      // eslint-disable-next-line @next/next/no-img-element -- asset del admin, sin optimizador
                      <img src={infoDetalle.premio.imagen} alt={infoDetalle.premio.titulo}
                        className="w-full max-w-[220px] mx-auto aspect-square object-cover rounded-xl border border-[var(--color-border)]" />
                    )}
                    <p className="text-sm font-semibold text-[var(--color-text)]">{infoDetalle.premio.titulo}</p>
                    {infoDetalle.premio.descripcion && (
                      <p className="text-xs text-[var(--color-muted)]">{infoDetalle.premio.descripcion}</p>
                    )}
                    {/* Físico = no hay nada que descargar: se recoge en la tienda */}
                    {infoDetalle.premio.tipo === "fisico" ? (
                      <p className="inline-block mt-1 px-4 py-2 rounded-full border border-[var(--color-verde)] text-xs font-semibold text-[var(--color-verde)]">
                        Recógelo en Papela Atelier ✨
                      </p>
                    ) : infoDetalle.premio.url ? (
                      <a href={infoDetalle.premio.url} target="_blank" rel="noopener noreferrer"
                        className="inline-block mt-1 px-5 py-2.5 rounded-full bg-[var(--color-verde)] text-xs font-semibold text-[var(--color-cremita)] hover:opacity-90 transition">
                        Descargar
                      </a>
                    ) : null}
                  </div>
                )}

                {mioDetalle.transferible && (
                  <button onClick={() => { const s = detalle; setDetalle(null); pedirCodigo(s); }}
                    className="mt-4 text-xs font-semibold text-[var(--color-verde)] underline underline-offset-2">
                    Regalar mi repetido a otro miembro
                  </button>
                )}
              </>
            ) : (
              <>
                <div className="relative w-40 aspect-square mx-auto">
                  <Silueta key={stickerSrc(origen, detalle)} src={stickerSrc(origen, detalle)}
                    className="w-full h-full object-contain opacity-[0.28]" />
                </div>
                <h3 className="font-serif italic text-2xl text-[var(--color-text)] mt-3">N.º {detalle.orden}</h3>
                <p className="text-sm text-[var(--color-muted)] mt-2">
                  Por descubrir — consíguelo en tu próxima visita a Papela Atelier para conocer su historia.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Modal de regalo: código + compartir ── */}
      {regalo && (
        <div role="dialog" aria-modal="true" aria-label={`Regalar ${regalo.sticker.nombre}`}
          className="fixed inset-0 z-[100004] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setRegalo(null)} aria-hidden="true" />
          <div className="relative w-full max-w-xs bg-white rounded-3xl p-6 text-center space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- asset del admin */}
            <img src={stickerSrc(origen, regalo.sticker)} alt={regalo.sticker.nombre}
              className="w-24 h-24 object-contain mx-auto" draggable={false} />
            <h3 className="font-serif italic text-xl text-[var(--color-text)]">Regalar {regalo.sticker.nombre}</h3>
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
                    href={`https://wa.me/?text=${encodeURIComponent(`🎁 Te regalo mi sticker repetido "${regalo.sticker.nombre}" del Club Creativo Papela. Canjea este código en tu planilla: ${regalo.codigo}`)}`}
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
    </div>
  );
}
