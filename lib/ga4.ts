// Compras para analítica (solo servidor): la misma lectura del pago de
// MercadoPago alimenta el `purchase` del navegador (páginas */pago/gracias)
// y el del webhook (GA4 Measurement Protocol). Ambos usan transaction_id =
// payment_id, así GA4 deduplica si llegan los dos.
//
// Env vars (Vercel, NO en el repo):
//   GA4_MEASUREMENT_ID  — "G-XXXXXXX" del flujo web de GA4
//   GA4_API_SECRET      — Admin → Flujos de datos → Secretos de la API del Measurement Protocol
import type { NextRequest } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import type { ItemCategory } from "@/lib/analitica";
import { logger } from "@/lib/logger";

export type DatosCompra = {
  transaction_id: string;
  value: number;
  currency: "MXN";
  item_name: string;
  item_category: ItemCategory;
};

type PagoMP = Awaited<ReturnType<Payment["get"]>>;

/** Categoría según el prefijo de external_reference (taller:, tienda:, clase sin prefijo). */
export function categoriaDeReferencia(ref: string): ItemCategory {
  if (ref.startsWith("taller:")) return "taller";
  if (ref.startsWith("tienda:")) return "producto";
  return "clase";
}

export function datosCompra(pago: PagoMP): DatosCompra | null {
  if (!pago.id || pago.status !== "approved") return null;
  const items = (pago.additional_info?.items ?? []).filter((i) => i.id !== "envio-nacional");
  const primero = items[0]?.title ?? pago.description ?? "Compra";
  const item_name = items.length > 1 ? `${primero} y ${items.length - 1} más` : primero;
  return {
    transaction_id: String(pago.id),
    value: Number(pago.transaction_amount) || 0,
    currency: "MXN",
    item_name,
    item_category: categoriaDeReferencia(pago.external_reference ?? ""),
  };
}

/**
 * Para las páginas de gracias: MercadoPago agrega ?payment_id&status&external_reference
 * al back_url, pero esos parámetros los puede escribir cualquiera — el monto y
 * el estado se leen del pago real. `categoria` evita contar en /clases un pago de tienda.
 */
export async function compraAprobada(
  searchParams: Record<string, string | string[] | undefined>,
  categoria: ItemCategory,
): Promise<DatosCompra | null> {
  const paymentId = typeof searchParams.payment_id === "string" ? searchParams.payment_id : null;
  if (!paymentId || !/^\d+$/.test(paymentId) || searchParams.status !== "approved") return null;
  try {
    const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });
    const pago = await new Payment(mp).get({ id: paymentId });
    const datos = datosCompra(pago);
    return datos && datos.item_category === categoria ? datos : null;
  } catch (error) {
    logger.error("analitica: no se pudo leer el pago para purchase", { paymentId }, error);
    return null;
  }
}

/** client_id de GA4 a partir de la cookie `_ga` ("GA1.1.123456789.1700000000" → "123456789.1700000000"). */
export function gaClientId(req: NextRequest): string | null {
  const ga = req.cookies.get("_ga")?.value;
  const m = ga?.match(/^GA\d\.\d\.(\d+\.\d+)$/);
  return m ? m[1] : null;
}

/** Envía `purchase` por Measurement Protocol. Nunca lanza: un fallo solo se registra. */
export async function enviarPurchaseServidor(pago: PagoMP) {
  const measurementId = process.env.GA4_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;
  if (!measurementId || !apiSecret) return;
  try {
    const datos = datosCompra(pago);
    if (!datos) return;
    const meta = (pago.metadata ?? {}) as { ga_client_id?: string };
    // Sin la cookie (bloqueada, otro dispositivo) GA4 igual necesita un client_id:
    // uno derivado del pago cuenta el ingreso aunque no herede la atribución.
    const clientId = meta.ga_client_id || `${datos.transaction_id}.${Math.floor(Date.now() / 1000)}`;
    const res = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(apiSecret)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(3000),
        body: JSON.stringify({
          client_id: clientId,
          events: [
            {
              name: "purchase",
              params: {
                ...datos,
                items: [{ item_name: datos.item_name, item_category: datos.item_category, price: datos.value, quantity: 1 }],
              },
            },
          ],
        }),
      },
    );
    if (!res.ok) throw new Error(`GA4 MP HTTP ${res.status}`);
  } catch (error) {
    logger.error("analitica: purchase por Measurement Protocol falló", { paymentId: pago.id }, error);
  }
}
