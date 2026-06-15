import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@/lib/supabase/server";

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

function verifySignature(req: NextRequest, rawBody: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return false;

  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");
  const dataId = new URL(req.url).searchParams.get("data.id");

  if (!xSignature || !xRequestId) return false;

  // MercadoPago signature format: ts=...&v1=...
  const parts = Object.fromEntries(xSignature.split(",").map((p) => p.split("=")));
  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  return expected === v1;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  if (!verifySignature(req, rawBody)) {
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
    return NextResponse.json({ error: "Error consultando pago" }, { status: 500 });
  }

  if (payment.status !== "approved") {
    // No aprobado — no hacemos nada, MP reintentará si es necesario
    return NextResponse.json({ ok: true });
  }

  const externalRef = payment.external_reference ?? "";
  const supabase = await createClient();

  // ── Taller ────────────────────────────────────────────────────────────────
  if (externalRef.startsWith("taller:")) {
    const tallerId = externalRef.replace("taller:", "");
    const cantidad = payment.additional_info?.items?.[0]?.quantity
      ? Number(payment.additional_info.items[0].quantity)
      : 1;

    // Decrementar cupo atómicamente vía función Postgres
    const { data: ok } = await supabase.rpc("reservar_cupo_taller", {
      p_taller: tallerId,
      p_cant: cantidad,
    });

    if (!ok) {
      // Cupo insuficiente — registrar para revisión manual
      console.error(`[webhook] cupo insuficiente taller ${tallerId} payment ${paymentId}`);
      return NextResponse.json({ error: "Sin cupo" }, { status: 409 });
    }

    // Persistir el pedido
    await supabase.from("talleres_inscripciones").insert({
      taller_id: tallerId,
      payment_id: paymentId,
      cantidad,
      monto: payment.transaction_amount,
      nombre: payment.payer?.first_name ?? "",
      email: payment.payer?.email ?? "",
      telefono: payment.payer?.phone?.number ?? null,
    });
  }

  // ── Tienda ────────────────────────────────────────────────────────────────
  else if (externalRef.startsWith("tienda:")) {
    // Fetch the pending order
    const { data: pedido, error: pedidoError } = await supabase
      .from("tienda_pedidos")
      .select("id, items, tipo_envio, estado")
      .eq("external_reference", externalRef)
      .single();

    if (pedidoError || !pedido) {
      console.error(`[webhook] pedido no encontrado: ${externalRef}`);
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    if (pedido.estado === "pagado") {
      // Idempotency: already processed
      return NextResponse.json({ ok: true });
    }

    // Decrement stock for each item atomically
    const items = pedido.items as { productoId: string; cantidad: number }[];
    for (const item of items) {
      const { data: ok } = await supabase.rpc("decrementar_stock_producto", {
        p_id: item.productoId,
        p_cant: item.cantidad,
      });
      if (!ok) {
        console.error(`[webhook] stock insuficiente producto ${item.productoId} payment ${paymentId}`);
        // Continue — log and update order with partial note rather than blocking
      }
    }

    // Mark order as paid
    await supabase
      .from("tienda_pedidos")
      .update({
        estado: "pagado",
        payment_id: paymentId,
        monto_total: payment.transaction_amount,
        comprador_nombre: payment.payer?.first_name ?? null,
        comprador_email: payment.payer?.email ?? null,
      })
      .eq("external_reference", externalRef);
  }

  // ── Clase (horario) ────────────────────────────────────────────────────────
  else {
    const horarioId = externalRef;

    // Decrementar cupo_disponible en clases_horarios
    const { error: updateError } = await supabase.rpc("reservar_cupo_clase", {
      p_horario: horarioId,
      p_cant: 1,
    });

    if (updateError) {
      console.error(`[webhook] cupo insuficiente horario ${horarioId} payment ${paymentId}`);
      return NextResponse.json({ error: "Sin cupo" }, { status: 409 });
    }

    // Persistir la reserva
    await supabase.from("clases_reservas").insert({
      horario_id: horarioId,
      estado_pago: "pagado",
      monto_pagado: payment.transaction_amount,
      alumno_nombre: payment.payer?.first_name ?? "",
      alumno_email: payment.payer?.email ?? "",
      alumno_telefono: payment.payer?.phone?.number ?? null,
    });
  }

  return NextResponse.json({ ok: true });
}
