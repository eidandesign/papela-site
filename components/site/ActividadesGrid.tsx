"use client";

import { useState } from "react";
import Image from "next/image";
import HojaInferior from "@/components/site/HojaInferior";
import type { Actividad } from "@/lib/clases-actividades";

/**
 * "Más información": actividades de la maestra en 4 columnas (2 en tablet, 1
 * en mobile), imagen arriba y texto recortado a 3 renglones. Tocar una abre la
 * hoja con todo: descripción completa y lista de materiales.
 */
export default function ActividadesGrid({ actividades }: { actividades: Actividad[] }) {
  const [abierta, setAbierta] = useState<Actividad | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {actividades.map((a) => (
          <button
            key={a.titulo}
            type="button"
            onClick={() => setAbierta(a)}
            className="group flex flex-col text-left rounded-2xl bg-white border border-[var(--color-border)] overflow-hidden shadow-[0_2px_14px_rgba(64,60,60,0.06)] hover:border-[var(--color-verde)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-verde)]"
          >
            <div className="relative w-full aspect-[4/3] bg-[#e7d6cf] overflow-hidden">
              {a.imagen && (
                <Image
                  src={a.imagen}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 22vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              )}
            </div>
            <div className="flex flex-1 flex-col p-4">
              <span className="self-start bg-[#fdeee8] text-[var(--color-terracota)] text-[10px] font-semibold tracking-[0.16em] uppercase font-sans px-2.5 py-1 rounded-full">
                {a.edades}
              </span>
              <h3 className="font-serif text-xl leading-tight text-[#403c3c] mt-2.5">{a.titulo}</h3>
              <p className="font-sans text-[15px] leading-6 text-[var(--color-text)] mt-1.5 line-clamp-3">{a.descripcion}</p>
              <span className="mt-auto pt-3 font-sans text-sm font-semibold text-[var(--color-verde)]">Ver más</span>
            </div>
          </button>
        ))}
      </div>

      <HojaInferior abierta={!!abierta} onClose={() => setAbierta(null)} titulo={abierta?.titulo ?? ""}>
        {abierta && (
          <div className="flex flex-col gap-4">
            {abierta.imagen && (
              <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-[#e7d6cf]">
                <Image src={abierta.imagen} alt={abierta.titulo} fill sizes="(max-width: 640px) 95vw, 560px" className="object-cover" />
              </div>
            )}
            <span className="self-start bg-[#fdeee8] text-[var(--color-terracota)] text-[11px] font-semibold tracking-[0.16em] uppercase font-sans px-3 py-1 rounded-full">
              Edades: {abierta.edades}
            </span>
            <p className="font-sans text-[16px] leading-7 text-[var(--color-text)]">{abierta.descripcion}</p>
            {abierta.materiales.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="label text-[var(--color-terracota)]">Materiales</p>
                {abierta.materialesNota && (
                  <p className="font-sans text-[14px] leading-6 text-[var(--color-muted)]">{abierta.materialesNota}</p>
                )}
                {abierta.materiales.map((grupo, i) => (
                  <div key={grupo.titulo ?? i}>
                    {grupo.titulo && (
                      <p className="font-sans text-[11px] font-semibold tracking-[0.16em] uppercase text-[var(--color-terracota)] mb-2">{grupo.titulo}</p>
                    )}
                    <ul className="flex flex-col gap-1.5 font-sans text-[15px] leading-6 text-[var(--color-text)]">
                      {grupo.items.map((m) => (
                        <li key={m} className="flex items-start gap-2">
                          <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-terracota)]" aria-hidden />
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </HojaInferior>
    </>
  );
}
