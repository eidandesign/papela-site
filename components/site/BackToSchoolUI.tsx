"use client";

import type { ReactNode, CSSProperties } from "react";
import Image from "next/image";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { useAcabadosModalStore, type PaqueteSeleccionado } from "@/lib/stores/acabadosModalStore";

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
