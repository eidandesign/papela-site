"use client";

import { useState } from "react";
import { PaqueteCard, FormatosCard } from "./BackToSchoolUI";
import type { Paquete } from "@/lib/back-to-school-data";

interface BackToSchoolPaquetesTabsProps {
  paquetes: Paquete[];
  msgFormatos: string;
}

const FORMATOS_TAB = "Custom";

/**
 * Selector de paquetes en mobile — pills tipo tabs (Back to School / Básico /
 * Custom), en partes iguales a todo el ancho, en vez de apilar las 3
 * tarjetas y forzar mucho scroll. Solo se muestra el contenido del paquete
 * seleccionado. Desktop/tablet siguen con el grid normal (ver bloque
 * `hidden sm:grid` en la página).
 */
export default function BackToSchoolPaquetesTabs({ paquetes, msgFormatos }: BackToSchoolPaquetesTabsProps) {
  // Orden fijo de los tabs (independiente del orden del grid de desktop):
  // destacado primero, luego el resto de paquetes, Custom al final.
  const destacado = paquetes.find((p) => p.destacado);
  const resto = paquetes.filter((p) => !p.destacado);
  const ordenados = destacado ? [destacado, ...resto] : paquetes;
  const tabs = [...ordenados.map((p) => p.nombre), FORMATOS_TAB];

  const [selected, setSelected] = useState<string>(tabs[0]);
  const activePaquete = paquetes.find((p) => p.nombre === selected);

  return (
    <div className="sm:hidden">
      <p className="label mb-3 text-center text-[var(--color-terracota)]">Paquetes</p>

      {/* Selector tipo tabs — parte igual del ancho completo */}
      <div className="mb-6 flex gap-2">
        {tabs.map((tab) => {
          const isActive = tab === selected;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setSelected(tab)}
              aria-pressed={isActive}
              className={`flex-1 rounded-full px-2 py-2.5 text-center font-sans text-[13px] font-semibold leading-tight transition-colors ${
                isActive
                  ? "bg-[var(--color-verde)] text-[var(--color-cremita)]"
                  : "border border-[var(--color-border)] bg-white/60 text-[var(--color-muted)]"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Contenido del tab activo */}
      {activePaquete ? (
        <PaqueteCard paquete={activePaquete} size="compact" />
      ) : (
        <FormatosCard msg={msgFormatos} size="compact" />
      )}
    </div>
  );
}
