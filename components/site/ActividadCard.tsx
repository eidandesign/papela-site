"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import type { Actividad } from "@/lib/clases-actividades";

export default function ActividadCard({ actividad }: { actividad: Actividad }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="flex flex-col md:flex-row md:items-start gap-5 md:gap-8 bg-[#f2f0e9] rounded-2xl p-5 md:p-6">
      {/* Imagen */}
      <div className="relative w-full md:w-[300px] md:flex-shrink-0 aspect-[4/3] md:aspect-[300/260] rounded-xl overflow-hidden bg-[#e7d6cf]">
        {actividad.imagen && (
          <Image
            src={actividad.imagen}
            alt={actividad.titulo}
            fill
            sizes="(max-width: 768px) 90vw, 300px"
            className="object-cover"
          />
        )}
      </div>

      {/* Contenido */}
      <div className="flex-1 flex flex-col">
        <span className="self-start bg-[#fdeee8] text-[var(--color-terracota)] text-[11px] font-semibold tracking-[0.18em] uppercase font-sans px-3 py-1 rounded-full">
          Edades: {actividad.edades}
        </span>

        <h3 className="font-serif text-[clamp(1.5rem,3vw,2rem)] text-[#403c3c] leading-tight mt-3">
          {actividad.titulo}
        </h3>

        <p className="font-sans text-[var(--color-text)] text-[17px] leading-7 mt-2">
          {actividad.descripcion}
        </p>

        {actividad.materiales.length > 0 && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-[var(--color-verde)] hover:opacity-80 transition-opacity"
              aria-expanded={open}
            >
              Ver Materiales
              <ChevronDownIcon
                className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 flex flex-col gap-4">
                    {actividad.materialesNota && (
                      <p className="font-sans text-[14px] leading-6 text-[var(--color-muted)]">
                        {actividad.materialesNota}
                      </p>
                    )}

                    {actividad.materiales.map((grupo, i) => (
                      <div key={grupo.titulo ?? i}>
                        {grupo.titulo && (
                          <p className="font-sans text-[11px] font-semibold tracking-[0.16em] uppercase text-[var(--color-terracota)] mb-2">
                            {grupo.titulo}
                          </p>
                        )}
                        <ul className="flex flex-col gap-1.5 font-sans text-[15px] leading-6 text-[var(--color-text)]">
                          {grupo.items.map((m) => (
                            <li key={m} className="flex items-start gap-2">
                              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-terracota)]" />
                              {m}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </article>
  );
}
