"use client";

// Rascado de sticker sorpresa (Club Creativo): overlay de pantalla completa
// donde el miembro RASCA con el dedo una capa plateada para revelar su
// coleccionable, que luego "se pega" en su planilla.
//
// SEGURIDAD: el sticker se revela con POST /revelar AL ABRIR el overlay — la
// identidad ya quedó sorteada server-side al otorgarse y aquí solo se pinta.
// El rascado es teatro visual: si el miembro cierra a medio rascar, el
// sticker YA es suyo (aparece en la planilla).

import { useCallback, useEffect, useRef, useState } from "react";
import { ADMIN_ORIGIN, RAREZA_LABEL, stickerSrc, type StickerInfo } from "./clubTipos";

type Revelacion = {
  sticker: StickerInfo;
  repetido: boolean;
  cantidad: number;
  pendientes: number;
};

export default function RascaSticker({ token, origen = ADMIN_ORIGIN, onCerrar, onPegado }: {
  token: string;
  origen?: string; // origen del admin (override para dev)
  onCerrar: () => void;
  onPegado: () => void; // refresca la tarjeta/planilla al pegar el sticker
}) {
  const [fase, setFase] = useState<"cargando" | "rascar" | "revelado" | "error">("cargando");
  const [error, setError] = useState<string | null>(null);
  const [rev, setRev] = useState<Revelacion | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rascando = useRef(false);
  // Cobertura del rascado por celdas (grid 10×10 en coords CSS): más robusto
  // que leer píxeles del canvas (independiente de devicePixelRatio).
  const celdas = useRef<Set<number>>(new Set());

  // Revela el drop pendiente más antiguo al montar (una sola vez).
  const pedido = useRef(false);
  useEffect(() => {
    if (pedido.current) return;
    pedido.current = true;
    fetch(`${origen}/api/public/club/${token}/revelar`, { method: "POST" })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "No se pudo revelar");
        setRev(json);
        setFase("rascar");
      })
      .catch((e: unknown) => {
        setError((e as Error).message || "No se pudo revelar, intenta de nuevo.");
        setFase("error");
      });
  }, [token, origen]);

  // Capa rascable: relleno plateado con rayitas + "RASCA AQUÍ".
  const initCanvas = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas || canvasRef.current === canvas) return; // pinta una sola vez
    canvasRef.current = canvas;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const lado = canvas.clientWidth;
    canvas.width = lado * dpr;
    canvas.height = lado * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    const g = ctx.createLinearGradient(0, 0, lado, lado);
    g.addColorStop(0, "#cfc9be");
    g.addColorStop(0.5, "#e8e3da");
    g.addColorStop(1, "#bdb6a9");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, lado, lado);
    ctx.strokeStyle = "rgba(255,255,255,.35)";
    ctx.lineWidth = 7;
    for (let x = -lado; x < lado * 2; x += 26) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + lado, lado);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(64,60,60,.55)";
    ctx.font = "600 15px Satoshi, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✨ RASCA AQUÍ ✨", lado / 2, lado / 2 + 5);
  }, []);

  function rasca(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const r = canvas.getBoundingClientRect();
    const dpr = canvas.width / r.width;
    const cx = e.clientX - r.left;
    const cy = e.clientY - r.top;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(cx * dpr, cy * dpr, 26 * dpr, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Marca la celda del trazo y sus vecinas (el radio de 26px las alcanza);
    // con ~62% de las 100 celdas rascadas el sticker se da por revelado.
    const gx = Math.max(0, Math.min(9, Math.floor((cx / r.width) * 10)));
    const gy = Math.max(0, Math.min(9, Math.floor((cy / r.height) * 10)));
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const x = gx + dx, y = gy + dy;
        if (x >= 0 && x < 10 && y >= 0 && y < 10) celdas.current.add(y * 10 + x);
      }
    }
    if (celdas.current.size >= 62) setFase("revelado");
  }

  const sticker = rev?.sticker;

  return (
    <div role="dialog" aria-modal="true" aria-label="Sticker sorpresa"
      className="fixed inset-0 z-[100003] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={fase === "revelado" || fase === "error" ? onCerrar : undefined} aria-hidden="true" />

      <div className="relative w-full max-w-xs text-center">
        {fase === "cargando" && (
          <p className="text-[var(--color-cremita)] font-serif italic text-xl animate-pulse">Abriendo tu sorpresa…</p>
        )}

        {fase === "error" && (
          <div className="bg-white rounded-3xl p-6 space-y-3">
            <p className="text-3xl" aria-hidden="true">🎫</p>
            <p className="text-sm text-[var(--color-muted)]">{error}</p>
            <button onClick={onCerrar}
              className="px-5 py-2.5 rounded-full bg-[var(--color-verde)] text-sm font-semibold text-[var(--color-cremita)]">
              Cerrar
            </button>
          </div>
        )}

        {sticker && fase !== "cargando" && fase !== "error" && (
          <div className="space-y-4">
            <p className="text-[var(--color-cremita)] font-serif italic text-2xl">
              {fase === "revelado" ? "¡Se pegó en tu planilla!" : "Rasca tu sticker sorpresa"}
            </p>

            {/* Sticker debajo + capa rascable encima */}
            <div className="relative mx-auto w-[260px] h-[260px] rounded-3xl overflow-hidden bg-white shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element -- asset del admin, sin optimizador */}
              <img src={stickerSrc(origen, sticker)} alt={sticker.nombre}
                className="absolute inset-0 w-full h-full object-contain p-4" draggable={false} />
              {fase === "rascar" && (
                <canvas
                  ref={initCanvas}
                  className="absolute inset-0 w-full h-full cursor-grab touch-none"
                  onPointerDown={(e) => {
                    rascando.current = true;
                    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* pointer sintético */ }
                    rasca(e);
                  }}
                  onPointerMove={(e) => { if (rascando.current) rasca(e); }}
                  onPointerUp={() => { rascando.current = false; }}
                  onPointerCancel={() => { rascando.current = false; }}
                  aria-label="Rasca para revelar tu sticker"
                />
              )}
            </div>

            {fase === "revelado" && (
              <div className="space-y-3 club-rasca-pop">
                <p className="text-[var(--color-cremita)] text-lg font-semibold">
                  {sticker.nombre}
                  <span className="block text-xs font-medium opacity-80 mt-0.5">{RAREZA_LABEL[sticker.rareza]}</span>
                </p>
                {rev?.repetido && (
                  <p className="text-xs text-[var(--color-cremita)]/90 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 inline-block">
                    ¡Repetido! (×{rev.cantidad}) — puedes regalarlo a otro miembro desde tu planilla
                  </p>
                )}
                <div className="flex items-center justify-center gap-2">
                  <button onClick={onPegado}
                    className="px-6 py-3 rounded-full bg-[var(--color-cremita)] text-sm font-semibold text-[var(--color-verde)] hover:opacity-90 transition">
                    Ver en mi planilla
                  </button>
                  {(rev?.pendientes ?? 0) > 0 && (
                    <span className="text-xs text-[var(--color-cremita)]/80">te quedan {rev?.pendientes} 🎁</span>
                  )}
                </div>
              </div>
            )}

            {fase === "rascar" && (
              <button onClick={onCerrar} className="text-xs text-[var(--color-cremita)]/70 underline">
                Rascar después (ya es tuyo)
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes club-rasca-pop {
          0% { opacity: 0; transform: translateY(10px) scale(.96); }
          100% { opacity: 1; transform: none; }
        }
        .club-rasca-pop { animation: club-rasca-pop .4s ease-out both; }
      `}</style>
    </div>
  );
}
