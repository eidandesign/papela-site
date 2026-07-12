"use client";

// Planilla completa del Club Creativo: los 100 espacios del álbum estilo
// coleccionables. Los obtenidos se ven a color (con ×N si hay repetidos y
// botón Regalar en los duplicados); los definidos-pero-no-obtenidos se ven
// como silueta misteriosa; los espacios aún sin definir muestran "?".
// También vive aquí el canje de códigos de regalo de otros miembros.

import { useMemo, useState } from "react";
import {
  ADMIN_ORIGIN, RAREZA_LABEL, stickerSrc,
  type AlbumItem, type Catalogo, type StickerInfo,
} from "./clubTipos";

export default function PlanillaClub({
  token, origen = ADMIN_ORIGIN, catalogo, album, obtenidos, pendientes,
  onCerrar, onRascar, onCambio,
}: {
  token: string;
  origen?: string;
  catalogo: Catalogo;
  album: AlbumItem[];
  obtenidos: number;
  pendientes: number;
  onCerrar: () => void;
  onRascar: () => void;   // abre el rascado de un pendiente
  onCambio: () => void;   // refresca la tarjeta (tras reclamar un regalo)
}) {
  const [regalo, setRegalo] = useState<{ sticker: StickerInfo; codigo?: string; error?: string; cargando: boolean } | null>(null);
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

  return (
    <div role="dialog" aria-modal="true" aria-label="Mi planilla de stickers"
      className="fixed inset-0 z-[100002] bg-[var(--color-bg)] overflow-y-auto">
      {/* Header sticky */}
      <div className="sticky top-0 z-10 bg-[var(--color-bg)]/95 backdrop-blur-sm border-b border-[var(--color-border)] px-5 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <div>
            <h2 className="font-serif italic text-2xl text-[var(--color-text)] leading-none">Mi planilla</h2>
            <p className="text-xs text-[var(--color-muted)] mt-1">
              {obtenidos} / {catalogo.total} coleccionables
            </p>
          </div>
          <button onClick={onCerrar} aria-label="Cerrar planilla"
            className="w-9 h-9 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-verde)] transition">
            ✕
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-5 space-y-5 pb-16">
        {/* Pendientes por rascar */}
        {pendientes > 0 && (
          <button onClick={onRascar}
            className="w-full rounded-2xl bg-[var(--color-verde)] text-[var(--color-cremita)] px-5 py-4 text-sm font-semibold flex items-center justify-between hover:opacity-90 transition">
            <span>🎁 Tienes {pendientes} sticker{pendientes !== 1 ? "s" : ""} por revelar</span>
            <span className="underline">Rascar</span>
          </button>
        )}

        {/* Hitos de recompensa */}
        <div className="flex flex-wrap gap-2">
          {catalogo.hitos.map((h) => {
            const logrado = obtenidos >= h.en;
            return (
              <span key={h.en}
                className={`text-[11px] font-semibold rounded-full px-3 py-1.5 border ${
                  logrado
                    ? "bg-[var(--color-verde)] text-[var(--color-cremita)] border-[var(--color-verde)]"
                    : "border-[var(--color-border)] text-[var(--color-muted)] bg-white"
                }`}>
                {logrado ? "✓ " : ""}{h.en} stickers → {h.premio}
              </span>
            );
          })}
        </div>

        {/* Los 100 espacios */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {Array.from({ length: catalogo.total }, (_, i) => {
            const orden = i + 1;
            const sticker = porOrden.get(orden);
            const mio = sticker ? porId.get(sticker.id) : undefined;

            if (sticker && mio) {
              // Obtenido: a color, burbuja glossy estilo coleccionable
              return (
                <div key={orden}
                  className="relative rounded-2xl bg-white border border-[var(--color-border)] p-2 pt-3 text-center shadow-[inset_0_2px_6px_rgba(255,255,255,.9),0_2px_8px_rgba(18,83,92,.08)]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- asset del admin */}
                  <img src={stickerSrc(origen, sticker)} alt={sticker.nombre}
                    className="w-full aspect-square object-contain" loading="lazy" draggable={false} />
                  <p className="text-[10px] font-semibold text-[var(--color-text)] truncate mt-1">{sticker.nombre}</p>
                  <p className="text-[9px] text-[var(--color-muted)]">{RAREZA_LABEL[sticker.rareza]}</p>
                  {mio.cantidad > 1 && (
                    <span className="absolute top-1.5 right-1.5 text-[10px] font-bold bg-[var(--color-terracota)] text-white rounded-full px-1.5 py-0.5">
                      ×{mio.cantidad}
                    </span>
                  )}
                  {mio.transferible && (
                    <button onClick={() => pedirCodigo(sticker)}
                      className="mt-1 text-[10px] font-semibold text-[var(--color-verde)] underline">
                      Regalar
                    </button>
                  )}
                </div>
              );
            }

            return (
              <div key={orden}
                className="rounded-2xl border-[1.5px] border-dashed border-[var(--color-border)] bg-white/50 p-2 pt-3 text-center flex flex-col items-center justify-center aspect-[3/4]">
                {sticker ? (
                  // Definido pero no obtenido: silueta misteriosa
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element -- asset del admin */}
                    <img src={stickerSrc(origen, sticker)} alt=""
                      className="w-3/4 aspect-square object-contain opacity-20"
                      style={{ filter: "brightness(0)" }} loading="lazy" draggable={false} aria-hidden="true" />
                    <p className="text-[10px] font-semibold text-[var(--color-muted)] mt-1">N.º {orden}</p>
                  </>
                ) : (
                  <>
                    <span className="text-2xl text-[var(--color-muted)]/40" aria-hidden="true">?</span>
                    <p className="text-[10px] text-[var(--color-muted)]/60 mt-1">N.º {orden}</p>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Canjear un código de regalo */}
        <div className="rounded-2xl bg-white border border-[var(--color-border)] p-4 space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-terracota)]">
            ¿Te regalaron un sticker?
          </p>
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
      </div>

      {/* Modal de regalo: código + compartir */}
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
                    onClick={() => navigator.clipboard.writeText(regalo.codigo!)}
                    className="px-4 py-2.5 rounded-full border-2 border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] hover:border-[var(--color-verde)] transition">
                    Copiar
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
