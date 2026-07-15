"use client";

import type { ReactNode, CSSProperties } from "react";
import Image from "next/image";
import { ArrowRightIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { useAcabadosModalStore, type PaqueteSeleccionado } from "@/lib/stores/acabadosModalStore";
import type { Paquete } from "@/lib/back-to-school-data";

// WhatsApp de Papela con mensaje precargado por CTA.
const WA = "522211865590";
export const wa = (msg: string) => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;

export function CtaMeInteresa({
  msg,
  variant = "solid",
  label = "Me interesa",
  light = false,
  paquete,
}: {
  msg?: string;
  variant?: "solid" | "outline";
  label?: string;
  light?: boolean;
  // Si se pasa, el CTA no abre WhatsApp directo: abre el modal de acabados
  // (BackToSchoolAcabadosModal), que arma el mensaje final con lo elegido.
  paquete?: PaqueteSeleccionado;
}) {
  let className: string;
  let children: ReactNode;
  let style: CSSProperties | undefined;

  if (variant === "outline") {
    className =
      "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border border-[var(--color-verde)] px-6 py-3 font-sans text-[15px] font-semibold text-[var(--color-verde)] transition-colors duration-500 hover:text-[var(--color-cremita)]";
    style = { isolation: "isolate" };
    children = (
      <>
        <span className="absolute inset-0 -z-10 origin-left scale-x-0 bg-[var(--color-verde)] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-x-100" />
        {label}
        <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
      </>
    );
  } else if (light) {
    className =
      "group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-cremita)] px-7 py-3.5 font-sans text-[15px] font-semibold text-[var(--color-verde)] transition-opacity hover:opacity-90";
    children = (
      <>
        {label}
        <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
      </>
    );
  } else {
    className =
      "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-[var(--color-verde)] px-7 py-3.5 font-sans text-[15px] font-semibold text-[var(--color-cremita)]";
    style = { isolation: "isolate" };
    children = (
      <>
        <span className="absolute inset-0 -z-10 origin-left scale-x-0 bg-[#0d3f46] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-x-100" />
        {label}
        <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
      </>
    );
  }

  if (paquete) {
    return (
      <button
        type="button"
        onClick={() => useAcabadosModalStore.getState().open(paquete)}
        className={className}
        style={style}
      >
        {children}
      </button>
    );
  }

  return (
    <a href={wa(msg ?? "")} target="_blank" rel="noopener noreferrer" className={className} style={style}>
      {children}
    </a>
  );
}

// Contenedor de imagen con tinte de fondo: si el asset aún no existe,
// se ve un bloque pastel agradable en lugar de un ícono de imagen rota.
export function Foto({
  src,
  alt,
  tint,
  className = "",
  sizes,
  contain = false,
}: {
  src: string;
  alt: string;
  tint: string;
  className?: string;
  sizes?: string;
  contain?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ backgroundColor: tint }}>
      <Image src={src} alt={alt} fill sizes={sizes} className={contain ? "object-contain" : "object-cover"} />
    </div>
  );
}

// Tarjeta de paquete — compartida por el grid de desktop (page.tsx) y los tabs
// de mobile (BackToSchoolPaquetesTabs). `size` es la única diferencia real:
//  - "full":    grid desktop; se estira a la altura de la fila (h-full + ul flex-1
//               empuja el CTA abajo) y usa tipografía/padding un poco más grandes.
//  - "compact": una sola tarjeta visible en mobile; no necesita igualar alturas.
export function PaqueteCard({ paquete, size = "full" }: { paquete: Paquete; size?: "full" | "compact" }) {
  const dark = paquete.destacado;
  const compact = size === "compact";
  return (
    <article
      className={`relative flex flex-col rounded-[28px] ${compact ? "p-6" : "h-full p-6 md:p-7"} ${
        dark ? "bg-[#EFD9D0] border-2 border-[#e3c3b8]" : "bg-[var(--color-cremita-3)] border-2 border-[var(--color-border)]"
      }`}
    >
      {dark && (
        <span className="absolute left-1/2 -top-3 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--color-verde)] px-4 py-1 font-sans text-[10px] font-bold uppercase tracking-widest text-[var(--color-cremita)]">
          Más vendido
        </span>
      )}
      <h3
        className={`text-center font-serif italic text-[#403C3C] ${
          compact ? "text-[24px] leading-[30px]" : "text-[26px] leading-[32px]"
        }`}
      >
        {paquete.nombre}
      </h3>
      <p className="mt-1 mb-5 text-center font-sans text-[13px] leading-[19px] text-[var(--color-muted)]">{paquete.ideal}</p>

      <Foto
        src={paquete.imagen}
        alt={`Paquete ${paquete.nombre} de etiquetas escolares`}
        tint={paquete.tint}
        className="mb-5 aspect-[4/3] w-full rounded-2xl"
        sizes={compact ? "90vw" : "(max-width: 1024px) 90vw, 30vw"}
      />

      <ul className={`mb-6 flex flex-col gap-3 ${compact ? "" : "flex-1"}`}>
        {paquete.contenido.map((linea) => (
          <li key={linea} className="flex items-start gap-2.5 font-sans text-[14px] leading-[21px] text-[#403C3C]">
            <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#3a8a6d]" aria-hidden="true" />
            {linea}
          </li>
        ))}
      </ul>

      <p className="mb-5 text-center">
        <span className={`font-serif font-extralight leading-none text-[#403C3C] ${compact ? "text-[36px]" : "text-[40px]"}`}>
          ${paquete.precio}
        </span>
        <span className="ml-1 font-sans text-[12px] text-[var(--color-muted)]">MXN</span>
      </p>

      <CtaMeInteresa paquete={{ nombre: paquete.nombre, precio: paquete.precio }} variant={dark ? "solid" : "outline"} />
    </article>
  );
}

// Tarjeta "Formatos Personalizados" — misma dupla que PaqueteCard: aparece como
// último tab en mobile y como última tarjeta del grid en desktop.
export function FormatosCard({ msg, size = "full" }: { msg: string; size?: "full" | "compact" }) {
  return (
    <article
      className={`flex flex-col justify-center rounded-[28px] border-2 border-[var(--color-border)] bg-[var(--color-cremita-3)] p-7 ${
        size === "full" ? "h-full" : ""
      }`}
    >
      <h3 className="font-serif italic text-[24px] leading-[30px] text-[#403C3C]">Formatos Personalizados</h3>
      <p className="mt-1 mb-4 font-sans text-[13px] text-[var(--color-muted)]">Solicita las medidas que necesites.</p>
      <p className="mb-6 font-sans text-[14px] leading-[22px] text-[var(--color-muted)]">
        Sabemos que puedes tener necesidades diferentes; no te preocupes, nos adaptamos a ti o a los requerimientos de tu colegio.
      </p>
      <CtaMeInteresa msg={msg} variant="outline" />
    </article>
  );
}
