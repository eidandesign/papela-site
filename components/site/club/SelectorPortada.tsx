"use client";

// "Elige un coleccionable" — se abre al tocar un óvalo vacío de la portada.
// Solo lista lo que el miembro YA tiene y todavía no está en la portada
// (poner dos veces el mismo no aporta nada). Elegir cierra la hoja.

import { stickerSrc, type StickerInfo } from "./clubTipos";
import HojaClub from "./HojaClub";

export default function SelectorPortada({
  origen, disponibles, onElegir, onCerrar,
}: {
  origen: string;
  disponibles: StickerInfo[];
  onElegir: (sticker: StickerInfo) => void;
  onCerrar: () => void;
}) {
  return (
    <HojaClub label="Elegir un coleccionable para mi portada" onCerrar={onCerrar}>
      {(cerrar) => (
        <>
          <h3 className="font-serif italic text-2xl text-[var(--color-text)] text-center">
            Elige tu coleccionable
          </h3>
          <p className="text-sm text-[var(--color-muted)] text-center mt-1.5">
            Va a uno de los espacios de tu portada. Puedes cambiarlo cuando quieras.
          </p>

          {disponibles.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)] text-center mt-6 mb-2">
              Ya tienes todos tus coleccionables en la portada ✨
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2.5 mt-5">
              {disponibles.map((s) => {
                const tile = (
                  <button onClick={() => { onElegir(s); cerrar(); }}
                    className="w-full h-full rounded-2xl bg-white p-2 pt-3 text-center shadow-[0_2px_8px_rgba(18,83,92,.07)] hover:shadow-[0_4px_14px_rgba(18,83,92,.16)] transition">
                    {/* eslint-disable-next-line @next/next/no-img-element -- asset del admin */}
                    <img src={stickerSrc(origen, s)} alt=""
                      className="w-full aspect-square object-contain" loading="lazy" draggable={false} />
                    <p className="text-[10px] font-semibold text-[var(--color-text)] truncate mt-1">{s.nombre}</p>
                  </button>
                );
                // Los especiales conservan su marco holográfico, como en la planilla.
                return s.rareza !== "comun" ? (
                  <div key={s.id} className="club-marco-holo rounded-[18px] p-[2.5px]">{tile}</div>
                ) : (
                  <div key={s.id}>{tile}</div>
                );
              })}
            </div>
          )}
        </>
      )}
    </HojaClub>
  );
}
