// Helpers compartidos por los tres checkouts (clases, talleres, tienda).

// Una preferencia de MercadoPago vive 30 minutos (auditoría 2026-10-16, Fase 1
// #8): si el cliente deja la pestaña abierta y paga mañana, el precio, el cupo
// o el stock ya no son los de hoy. Pasado el plazo MP rechaza el pago y el
// cliente vuelve a generar el checkout con datos frescos.
export const EXPIRACION_PREFERENCIA_MS = 30 * 60 * 1000;

// MP exige el formato ISO 8601 con zona (`2026-10-17T18:30:00.000-06:00`);
// el `Z` de `toISOString()` también lo acepta.
export function expiracionPreferencia(desde = Date.now()): { expires: true; expiration_date_from: string; expiration_date_to: string } {
  return {
    expires: true,
    expiration_date_from: new Date(desde).toISOString(),
    expiration_date_to: new Date(desde + EXPIRACION_PREFERENCIA_MS).toISOString(),
  };
}
