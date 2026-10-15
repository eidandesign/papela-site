"use client";

import { useEffect } from "react";
import { track, type EventosSitio } from "@/lib/analitica";

// Respaldo si sessionStorage no está disponible (modo privado estricto).
const enviados = new Set<string>();

/**
 * Manda `purchase` UNA vez por pago: recargar la página de gracias o volver
 * con "atrás" no lo repite (sessionStorage por payment_id). Los datos llegan
 * ya validados por el servidor contra el pago real de MercadoPago.
 */
export default function PurchaseTracker({ compra }: { compra: EventosSitio["purchase"] }) {
  useEffect(() => {
    const clave = `pa_purchase_${compra.transaction_id}`;
    try {
      if (sessionStorage.getItem(clave)) return;
      sessionStorage.setItem(clave, "1");
    } catch {
      if (enviados.has(clave)) return;
    }
    enviados.add(clave);
    track("purchase", compra);
  }, [compra]);

  return null;
}
