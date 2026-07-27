"use client";

// Planilla del Club Creativo — los 100 espacios del álbum, estilo vitrina de
// coleccionables y SIMPLE: logo + flecha atrás + "Mi planilla Papela" + X/100
// y la pura cuadrícula. Obtenidos a color (los raros/legendarios con MARCO
// HOLOGRÁFICO animado); los definidos-pero-no-obtenidos se ven como SILUETA
// (la forma en sombra, sin revelar la imagen — misterio); espacios sin
// definir (o sin imagen) muestran "?".
//
// Tap en cualquier coleccionable definido → FICHA (bottom sheet, componente
// compartido con la tarjeta) con su historia, "Copiar sticker", su premio y
// el regalo de repetidos. Canjear un código de regalo vive aquí, discreto.

import { useMemo, useState } from "react";
import Image from "next/image";
import FichaSticker, { type AccionPortada } from "./FichaSticker";
import Silueta from "./Silueta";
import { ADMIN_ORIGIN, stickerSrc, type AlbumItem, type Catalogo, type DetalleSticker, type StickerInfo } from "./clubTipos";

export default function PlanillaClub({
  token, origen = ADMIN_ORIGIN, catalogo, album, detalles = {}, obtenidos, pendientes,
  accionPortada, onCerrar, onRascar, onCambio,
}: {
  token: string;
  origen?: string;
  catalogo: Catalogo;
  album: AlbumItem[];
  detalles?: Record<number, DetalleSticker>;
  obtenidos: number;
  pendientes: number;
  // Poner/quitar de la portada de la tarjeta (lo resuelve el padre, que es
  // quien guarda el estilo). Sin esto la ficha no ofrece la acción.
  accionPortada?: (id: number) => AccionPortada | undefined;
  onCerrar: () => void;
  onRascar: () => void;   // abre el rascado de un pendiente
  onCambio: () => void;   // refresca la tarjeta (tras reclamar un regalo)
}) {
  const [detalle, setDetalle] = useState<StickerInfo | null>(null);
  const [canjeAbierto, setCanjeAbierto] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [reclamando, setReclamando] = useState(false);
  const [avisoReclamo, setAvisoReclamo] = useState<{ ok: boolean; msg: string } | null>(null);

  const porId = useMemo(() => new Map(album.map((a) => [a.id, a])), [album]);
  const porOrden = useMemo(() => new Map(catalogo.stickers.map((s) => [s.orden, s])), [catalogo.stickers]);

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

  const especial = (r: StickerInfo["rareza"]) => r !== "comun";

  return (
    <div role="dialog" aria-modal="true" aria-label="Mi planilla Papela"
      className="fixed inset-0 z-[100002] bg-[var(--color-bg)] overflow-y-auto">

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
                <button onClick={() => setDetalle(sticker)}
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
                <button key={orden} onClick={() => setDetalle(sticker)}
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

      {/* ── Ficha del coleccionable (bottom sheet, compartida con la tarjeta) ── */}
      {detalle && (
        <FichaSticker
          key={detalle.id}
          token={token}
          origen={origen}
          sticker={detalle}
          portada={accionPortada?.(detalle.id)}
          mio={porId.get(detalle.id)}
          info={detalles[detalle.id]}
          onCerrar={() => setDetalle(null)}
        />
      )}
    </div>
  );
}
