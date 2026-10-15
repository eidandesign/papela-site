"use client";

import type { AnchorHTMLAttributes } from "react";
import { track } from "@/lib/analitica";

type EventoLink = "pa_click_instagram" | "pa_click_tiktok" | "pa_click_telefono" | "pa_click_como_llegar";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  evento: EventoLink;
  /** Dónde está el link (footer, links, navbar…). */
  ubicacion: string;
};

/**
 * `<a>` externo medido (Instagram, TikTok, tel:, Maps). Los http(s) abren en
 * pestaña nueva; tel: se queda en la misma para que el teléfono marque.
 */
export default function TrackedLink({ evento, ubicacion, href, onClick, children, ...rest }: Props) {
  const externo = /^https?:/.test(href);
  return (
    <a
      href={href}
      {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
      onClick={(e) => {
        track(evento, { ubicacion });
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
