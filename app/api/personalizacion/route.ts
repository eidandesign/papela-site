import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nombre = typeof body.nombre === "string" ? body.nombre.trim() : "";
    const telefono = typeof body.telefono === "string" ? body.telefono.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const tipo = typeof body.tipo === "string" ? body.tipo.trim() : "";
    const ocasion = typeof body.ocasion === "string" ? body.ocasion.trim() : "";
    const mensaje = typeof body.mensaje === "string" ? body.mensaje.trim() : "";

    // Validación server-side (el endpoint es público)
    if (nombre.length < 2 || nombre.length > 100) {
      return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });
    }
    if (telefono.length < 7 || telefono.length > 30) {
      return NextResponse.json({ error: "Teléfono inválido" }, { status: 400 });
    }
    if (email && (!EMAIL_RE.test(email) || email.length > 150)) {
      return NextResponse.json({ error: "Correo inválido" }, { status: 400 });
    }
    if (mensaje.length < 5 || mensaje.length > 1000) {
      return NextResponse.json({ error: "Cuéntanos un poco más sobre tu idea" }, { status: 400 });
    }
    if (tipo.length > 100 || ocasion.length > 100) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const supabase = await createClient();
    const { error: dbError } = await supabase.from("personalizacion_solicitudes").insert({
      nombre,
      telefono,
      email: email || null,
      tipo: tipo || null,
      ocasion: ocasion || null,
      mensaje,
    });

    if (dbError) {
      logger.error("personalizacion insert failed", { code: dbError.code }, dbError);
      return NextResponse.json({ error: "No se pudo enviar tu solicitud" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("personalizacion request failed", {}, error);
    return NextResponse.json({ error: "No se pudo enviar tu solicitud" }, { status: 500 });
  }
}
