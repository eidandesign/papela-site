"use client";

import { useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { CtaMeInteresa, Foto } from "./BackToSchoolUI";

interface Paquete {
  nombre: string;
  precio: number;
  ideal: string;
  imagen: string;
  tint: string;
  destacado: boolean;
  contenido: string[];
}

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
      {activePaquete ? <PaqueteCard paquete={activePaquete} /> : <FormatosCard msg={msgFormatos} />}
    </div>
  );
}

function PaqueteCard({ paquete }: { paquete: Paquete }) {
  const dark = paquete.destacado;
  return (
    <article
      className={`relative flex flex-col rounded-[28px] p-6 ${
        dark ? "bg-[#EFD9D0] border-2 border-[#e3c3b8]" : "bg-[var(--color-cremita-3)] border-2 border-[var(--color-border)]"
      }`}
    >
      {dark && (
        <span className="absolute left-1/2 -top-3 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--color-verde)] px-4 py-1 font-sans text-[10px] font-bold uppercase tracking-widest text-[var(--color-cremita)]">
          Más vendido
        </span>
      )}
      <h3 className="text-center font-serif italic text-[24px] leading-[30px] text-[#403C3C]">{paquete.nombre}</h3>
      <p className="mt-1 mb-5 text-center font-sans text-[13px] leading-[19px] text-[var(--color-muted)]">{paquete.ideal}</p>

      <Foto
        src={paquete.imagen}
        alt={`Paquete ${paquete.nombre} de etiquetas escolares`}
        tint={paquete.tint}
        className="mb-5 aspect-[4/3] w-full rounded-2xl"
        sizes="90vw"
      />

      <ul className="mb-6 flex flex-col gap-3">
        {paquete.contenido.map((linea) => (
          <li key={linea} className="flex items-start gap-2.5 font-sans text-[14px] leading-[21px] text-[#403C3C]">
            <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#3a8a6d]" aria-hidden="true" />
            {linea}
          </li>
        ))}
      </ul>

      <p className="mb-5 text-center">
        <span className="font-serif font-extralight text-[36px] leading-none text-[#403C3C]">${paquete.precio}</span>
        <span className="ml-1 font-sans text-[12px] text-[var(--color-muted)]">MXN</span>
      </p>

      <CtaMeInteresa
        paquete={{ nombre: paquete.nombre, precio: paquete.precio }}
        variant={dark ? "solid" : "outline"}
      />
    </article>
  );
}

function FormatosCard({ msg }: { msg: string }) {
  return (
    <article className="flex flex-col justify-center rounded-[28px] border-2 border-[var(--color-border)] bg-[var(--color-cremita-3)] p-7">
      <h3 className="font-serif italic text-[24px] leading-[30px] text-[#403C3C]">Formatos Personalizados</h3>
      <p className="mt-1 mb-4 font-sans text-[13px] text-[var(--color-muted)]">Solicita las medidas que necesites.</p>
      <p className="mb-6 font-sans text-[14px] leading-[22px] text-[var(--color-muted)]">
        Sabemos que puedes tener necesidades diferentes; no te preocupes, nos adaptamos a ti o a los requerimientos de tu colegio.
      </p>
      <CtaMeInteresa msg={msg} variant="outline" />
    </article>
  );
}
