import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

// Purga diaria de pedidos de tienda abandonados (auditoría 2026-10-16, Fase 1 #8).
// Un pedido nace 'pendiente' al crear la preferencia de MercadoPago; si el
// cliente nunca paga (cerró la pestaña, o la preferencia expiró a los 30 min)
// se queda ahí para siempre con nombre, correo y dirección. Pasadas 48 h sin
// pago se borra: no descontó stock (eso lo hace el webhook al confirmar) y no
// hay nada que reponer. RPC `purgar_pedidos_pendientes` en
// papela-admin/supabase/migrations/20261017_webhook_reversiones.sql.
//
// Lo dispara el cron de Vercel (vercel.json) con `Authorization: Bearer
// $CRON_SECRET`; sin la variable, la ruta responde 503 y no borra nada.

export const dynamic = "force-dynamic";

const HORAS = 48;

function autorizado(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization") ?? "";
  const a = Buffer.from(auth);
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: NextRequest) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "CRON_SECRET no configurado" }, { status: 503 });
  }
  if (!autorizado(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data, error } = await createAdminClient().rpc("purgar_pedidos_pendientes", { p_horas: HORAS });
  if (error) {
    logger.error("cron: fallo purgando pedidos pendientes", { horas: HORAS }, error);
    return NextResponse.json({ error: "Error purgando" }, { status: 500 });
  }
  const borrados = Number(data) || 0;
  if (borrados > 0) logger.info("cron: pedidos pendientes purgados", { borrados, horas: HORAS });
  return NextResponse.json({ ok: true, borrados });
}
