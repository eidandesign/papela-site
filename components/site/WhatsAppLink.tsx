"use client";

import type { AnchorHTMLAttributes } from "react";
import { track, type EventosSitio } from "@/lib/analitica";
import { waHref } from "@/lib/whatsapp";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  /** Dónde está el botón (footer, drawer_producto, clases_oferta…): dimensión `ubicacion` en GA4. */
  ubicacion: string;
  /** Mensaje prellenado (sin codificar). */
  texto?: string;
  /** Número destino; por defecto el de Papela (las maestras pueden tener el suyo). */
  numero?: string;
  /** Producto/clase de la que se pregunta, si aplica. */
  itemName?: string;
  /** Si el clic en sí es la solicitud (aprobar cotización, pedir tarjeta), se cuenta también como lead. */
  lead?: EventosSitio["generate_lead"];
};

/** Registra un clic a WhatsApp (para los que abren el chat con window.open). */
export function trackWhatsApp(ubicacion: string, itemName?: string, lead?: EventosSitio["generate_lead"]) {
  track("pa_click_whatsapp", { ubicacion, ...(itemName ? { item_name: itemName } : {}) });
  if (lead) track("generate_lead", lead);
}

/** `<a>` a WhatsApp medido: mismo markup que un link normal + evento pa_click_whatsapp. */
export default function WhatsAppLink({ ubicacion, texto, numero, itemName, lead, onClick, children, ...rest }: Props) {
  return (
    <a
      href={waHref(texto, numero)}
      target="_blank"
      rel="noopener noreferrer"
      {...rest}
      onClick={(e) => {
        trackWhatsApp(ubicacion, itemName, lead);
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
