import { NextResponse, type NextRequest } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  BUCKET_FOTOS,
  FOTOS,
  carpetaPostulacion,
  esUuid,
} from "@/lib/creadores/config";

// POST /api/creadores/foto — permiso para subir UNA foto de producto de la
// postulación (/creadores). Responde una URL firmada de subida al bucket
// PRIVADO `creadores-fotos`: la foto va directo del navegador a Supabase
// (Vercel no acepta cuerpos de más de 4.5 MB). El bucket vuelve a validar
// tamaño (8 MB) y tipo (JPG, PNG, WEBP). Público: limitado por IP.

const SIN_CACHE = { "Cache-Control": "no-store" };

function nombreSeguro(nombre: string): string {
  const base = nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(-80);
  return base || "foto";
}

export async function POST(req: NextRequest) {
  if (
    !(await rateLimit(`creadores-foto:${getClientIp(req)}`, 30, 60 * 60 * 1000))
  ) {
    return NextResponse.json(
      { error: "Demasiadas fotos seguidas. Intenta en un rato." },
      { status: 429, headers: SIN_CACHE },
    );
  }

  const body = (await req.json().catch(() => null)) as {
    id?: unknown;
    nombre?: unknown;
    tipo?: unknown;
    tamano?: unknown;
  } | null;
  if (!body || !esUuid(body.id)) {
    return NextResponse.json(
      { error: "No pudimos preparar la subida." },
      { status: 400, headers: SIN_CACHE },
    );
  }
  const tipo = String(body.tipo ?? "");
  const tamano = Number(body.tamano);
  if (!(FOTOS.tipos as readonly string[]).includes(tipo)) {
    return NextResponse.json(
      { error: "Solo imágenes JPG, PNG o WEBP." },
      { status: 400, headers: SIN_CACHE },
    );
  }
  if (!Number.isFinite(tamano) || tamano <= 0 || tamano > FOTOS.maxBytes) {
    return NextResponse.json(
      { error: "Cada foto puede pesar hasta 8 MB." },
      { status: 400, headers: SIN_CACHE },
    );
  }

  const sufijo = crypto.randomUUID().slice(0, 8);
  const path = `${carpetaPostulacion(body.id)}${sufijo}-${nombreSeguro(String(body.nombre ?? "foto"))}`;

  try {
    const { data, error } = await createAdminClient()
      .storage.from(BUCKET_FOTOS)
      .createSignedUploadUrl(path);
    if (error || !data) throw error ?? new Error("sin datos");
    return NextResponse.json(
      { path: data.path, token: data.token },
      { headers: SIN_CACHE },
    );
  } catch (error) {
    logger.error("creadores: no se pudo preparar la subida", {}, error);
    return NextResponse.json(
      { error: "No pudimos preparar la subida. Intenta de nuevo." },
      { status: 500, headers: SIN_CACHE },
    );
  }
}
