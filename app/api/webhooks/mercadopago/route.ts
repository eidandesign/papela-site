import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { enviarPurchaseServidor } from "@/lib/ga4";

// ⚠️ Depende de las RPC `webhook_inscribir_taller`, `webhook_reservar_clase` y
// `webhook_confirmar_pedido_tienda` (papela-admin/supabase/migrations/
// 20261017_webhook_idempotente.sql). Aplicar esa migración ANTES de desplegar.
//
// Idempotencia: MercadoPago manda cada notificación varias veces y reintenta
// ante cualquier respuesta no-2xx. Cada flujo reclama el `payment_id` dentro
// de UNA transacción en la BD y solo descuenta cupo/stock si lo reclamó. Un
// pago ya procesado responde 200 sin tocar nada (y sin repetir `purchase`).
// Cuando el cliente pagó y ya no hay cupo/stock, la fila queda marcada
// (`sin_cupo` / `incidencia`) y se responde 200: reintentar no lo arregla,
// hay que atenderlo a mano.

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

// Ventana de frescura de la firma: una notificación legítima vieja (replay)
// ya no hace daño por la idempotencia, pero no hay razón para aceptarla.
const MAX_EDAD_FIRMA_MS = 10 * 60 * 1000;

function verifySignature(req: NextRequest): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return false;

  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");
  const params = new URL(req.url).searchParams;
  // MP manda `data.id`; las notificaciones IPN viejas mandan `id`.
  const dataId = params.get("data.id") ?? params.get("id");

  if (!xSignature || !xRequestId || !dataId) return false;

  // MercadoPago signature format: ts=...,v1=...
  const parts = Object.fromEntries(xSignature.split(",").map((p) => p.trim().split("=")));
  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;

  const edad = Math.abs(Date.now() - Number(ts) * (ts.length > 11 ? 1 : 1000));
  if (!Number.isFinite(edad) || edad > MAX_EDAD_FIRMA_MS) return false;

  // Docs MP: si data.id es alfanumérico va en minúsculas.
  const manifest = `id:${dataId.toLowerCase()};request-id:${xRequestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(v1, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

const texto = (v: unknown, max = 200): string =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  if (!verifySignature(req)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  let body: { type?: string; data?: { id?: string } };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  // Solo procesamos notificaciones de tipo "payment"
  if (body.type !== "payment" || !body.data?.id) {
    return NextResponse.json({ ok: true });
  }

  const paymentId = String(body.data.id);

  // Consultar el pago directamente a MP (nunca confiar en el body del webhook)
  let payment;
  try {
    const paymentApi = new Payment(mpClient);
    payment = await paymentApi.get({ id: paymentId });
  } catch {
    // 500 a propósito: MP reintenta y la próxima vez sí podremos consultarlo.
    return NextResponse.json({ error: "Error consultando pago" }, { status: 500 });
  }

  if (payment.status !== "approved") {
    // refunded / charged_back / cancelled: se repone cupo/stock vía RPC
    // (papela-admin/supabase/migrations/20261017_webhook_reversiones.sql).
    // Idempotente: una fila ya revertida responde 'repetida' sin tocar nada.
    // `cancelled` solo importa si el pago llegó a aprobarse (si no, no hay fila
    // con ese payment_id y la RPC responde 'no_encontrada' → 200 sin ruido).
    if (["refunded", "charged_back", "cancelled"].includes(payment.status ?? "")) {
      const { data, error } = await createAdminClient().rpc("webhook_revertir_pago", {
        p_payment_id: paymentId,
        p_status: payment.status,
      });
      if (error) {
        logger.error("webhook: fallo revirtiendo pago — revisar cupo/stock a mano", {
          paymentId, status: payment.status, externalReference: payment.external_reference ?? null,
        }, error);
        // 500: MP reintenta (si la migración aún no está aplicada, hasta que lo esté).
        return NextResponse.json({ error: "Error revirtiendo pago" }, { status: 500 });
      }
      if (data === "ok") {
        logger.warn("webhook: pago revertido, cupo/stock repuesto", {
          paymentId, status: payment.status, externalReference: payment.external_reference ?? null,
        });
      }
    }
    return NextResponse.json({ ok: true });
  }

  if (payment.currency_id && payment.currency_id !== "MXN") {
    logger.error("webhook: moneda inesperada", { paymentId, currency: payment.currency_id });
  }

  const externalRef = payment.external_reference ?? "";
  const monto = Number(payment.transaction_amount) || 0;
  const nombre = texto([payment.payer?.first_name, payment.payer?.last_name].filter(Boolean).join(" "), 120);
  const email = texto(payment.payer?.email, 160);
  const telefono = texto(payment.payer?.phone?.number, 40) || null;

  // Service role: el webhook escribe tablas protegidas por RLS (tienda_pedidos
  // "service only", stock en productos, cupos de clases/talleres).
  const supabase = createAdminClient();

  // `nuevo` = este webhook fue el que procesó el pago (solo entonces se manda
  // `purchase` a GA4; un reintento no debe duplicar la compra en analítica).
  let nuevo = false;

  // ── Taller ────────────────────────────────────────────────────────────────
  if (externalRef.startsWith("taller:")) {
    const tallerId = externalRef.replace("taller:", "");
    const cantidad = payment.additional_info?.items?.[0]?.quantity
      ? Number(payment.additional_info.items[0].quantity)
      : 1;

    const { data, error } = await supabase.rpc("webhook_inscribir_taller", {
      p_payment_id: paymentId,
      p_taller: tallerId,
      p_cantidad: cantidad,
      p_monto: monto,
      p_nombre: nombre,
      p_email: email,
      p_telefono: telefono,
    });
    if (error) {
      logger.error("webhook: fallo registrando inscripción de taller", { tallerId, paymentId }, error);
      return NextResponse.json({ error: "Error registrando inscripción" }, { status: 500 });
    }
    if (data === "sin_cupo") {
      logger.error("webhook: PAGADO SIN CUPO taller — contactar al cliente", { tallerId, paymentId, cantidad });
    }
    nuevo = data !== "repetida";
  }

  // ── Tienda ────────────────────────────────────────────────────────────────
  else if (externalRef.startsWith("tienda:")) {
    const { data, error } = await supabase.rpc("webhook_confirmar_pedido_tienda", {
      p_external_reference: externalRef,
      p_payment_id: paymentId,
      p_monto: monto,
      p_nombre: nombre || null,
      p_email: email || null,
    });
    if (error) {
      logger.error("webhook: fallo confirmando pedido", { externalRef, paymentId }, error);
      return NextResponse.json({ error: "Error confirmando pedido" }, { status: 500 });
    }
    const r = (data ?? {}) as { resultado?: string; incidencia?: string | null };
    if (r.resultado === "no_encontrado") {
      // Reintentar no lo va a encontrar: 200 + rastro.
      logger.error("webhook: pedido no encontrado", { externalRef, paymentId });
      return NextResponse.json({ ok: true });
    }
    if (r.incidencia) {
      logger.error("webhook: pedido pagado con incidencia — revisar en el admin", { externalRef, paymentId, incidencia: r.incidencia });
    }
    nuevo = r.resultado === "ok";
  }

  // ── Clase (horario) ────────────────────────────────────────────────────────
  else {
    const horarioId = externalRef;

    // Paquete (ver /api/checkout): MercadoPago devuelve la metadata en snake_case.
    const meta = (payment.metadata ?? {}) as {
      paquete_id?: string;
      paquete_nombre?: string;
      paquete_sesiones?: number;
      inscripcion_por_pagar?: number;
    };
    const esPaquete = typeof meta.paquete_id === "string" && meta.paquete_id.length > 0;
    // La inscripción anual se paga en Papela (no en línea): solo se anota.
    const inscripcionPorPagar = esPaquete ? Math.max(0, Number(meta.inscripcion_por_pagar) || 0) : 0;
    const notas = esPaquete
      ? `Paquete en línea: ${texto(meta.paquete_nombre, 120)}${meta.paquete_sesiones ? ` (${Number(meta.paquete_sesiones)} clases)` : ""} — primera clase en este horario${inscripcionPorPagar > 0 ? ` · inscripción anual $${inscripcionPorPagar} por pagar en Papela` : ""} · MercadoPago #${paymentId}`
      : `MercadoPago #${paymentId}`;

    const { data, error } = await supabase.rpc("webhook_reservar_clase", {
      p_payment_id: paymentId,
      p_horario: horarioId,
      p_monto: monto,
      p_nombre: nombre,
      p_email: email,
      p_telefono: telefono,
      p_notas: notas,
    });
    if (error) {
      logger.error("webhook: fallo registrando reserva de clase", { horarioId, paymentId }, error);
      return NextResponse.json({ error: "Error registrando reserva" }, { status: 500 });
    }
    if (data === "sin_cupo") {
      logger.error("webhook: PAGADO SIN CUPO clase — contactar al alumno", { horarioId, paymentId });
    }
    nuevo = data !== "repetida";
  }

  // Casilla "no quiero promociones" del aviso de privacidad (viaja en la
  // metadata de la preferencia, snake_case). Se anota en la fila que reclamó
  // este pago; columna de 20261017_privacidad_sin_promociones (admin). Nunca
  // rompe el webhook: si la columna no existe se deja rastro.
  if (nuevo && (payment.metadata as { sin_promociones?: unknown } | undefined)?.sin_promociones === true) {
    const tabla = externalRef.startsWith("taller:")
      ? "talleres_inscripciones"
      : externalRef.startsWith("tienda:") ? "tienda_pedidos" : "clases_reservas";
    const { error } = await supabase.from(tabla).update({ sin_promociones: true }).eq("payment_id", paymentId);
    if (error) logger.error("webhook: no se pudo anotar sin_promociones", { tabla, paymentId, code: error.code });
  }

  // Compra para GA4 (mismo transaction_id que la página de gracias). Nunca rompe el webhook.
  if (nuevo) await enviarPurchaseServidor(payment);

  return NextResponse.json({ ok: true });
}
