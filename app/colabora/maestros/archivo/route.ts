import { NextResponse, type NextRequest } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/supabase/admin";
import { leerSesion } from "@/lib/maestros/sesion";
import { ARCHIVOS, BUCKET_ARCHIVOS, carpetaSolicitud, esUuid } from "@/lib/maestros/campos";

// POST /colabora/maestros/archivo — permiso para subir UN archivo de la
// solicitud (PDF o foto de su trabajo). Responde una URL firmada de subida al
// bucket privado `maestros-archivos`: el archivo va directo del navegador a
// Supabase (Vercel no acepta cuerpos de más de 4.5 MB). Solo con sesión. El
// bucket vuelve a validar tamaño (10 MB) y tipo.

const SIN_CACHE = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };

function nombreSeguro(nombre: string): string {
  const base = nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(-80);
  return base || "archivo";
}

export async function POST(req: NextRequest) {
  if (!(await leerSesion())) {
    return NextResponse.json({ error: "Tu sesión venció. Vuelve a escribir la contraseña." }, { status: 401, headers: SIN_CACHE });
  }
  if (!(await rateLimit(`maestros-archivo:${getClientIp(req)}`, 20, 60 * 60 * 1000))) {
    return NextResponse.json({ error: "Demasiados archivos seguidos. Intenta en un rato." }, { status: 429, headers: SIN_CACHE });
  }

  const body = (await req.json().catch(() => null)) as { solicitudId?: unknown; nombre?: unknown; tipo?: unknown; tamano?: unknown } | null;
  if (!body || !esUuid(body.solicitudId)) {
    return NextResponse.json({ error: "No pudimos preparar la subida." }, { status: 400, headers: SIN_CACHE });
  }
  const tipo = String(body.tipo ?? "");
  const tamano = Number(body.tamano);
  if (!(ARCHIVOS.tipos as readonly string[]).includes(tipo)) {
    return NextResponse.json({ error: "Solo PDF o imágenes (JPG, PNG o WEBP)." }, { status: 400, headers: SIN_CACHE });
  }
  if (!Number.isFinite(tamano) || tamano <= 0 || tamano > ARCHIVOS.maxBytes) {
    return NextResponse.json({ error: "Cada archivo puede pesar hasta 10 MB." }, { status: 400, headers: SIN_CACHE });
  }

  const sufijo = crypto.randomUUID().slice(0, 8);
  const path = `${carpetaSolicitud(body.solicitudId)}${sufijo}-${nombreSeguro(String(body.nombre ?? "archivo"))}`;

  try {
    const { data, error } = await createAdminClient().storage.from(BUCKET_ARCHIVOS).createSignedUploadUrl(path);
    if (error || !data) throw error ?? new Error("sin datos");
    return NextResponse.json({ path: data.path, token: data.token }, { headers: SIN_CACHE });
  } catch (error) {
    logger.error("maestros: no se pudo preparar la subida", {}, error);
    return NextResponse.json({ error: "No pudimos preparar la subida. Intenta de nuevo." }, { status: 500, headers: SIN_CACHE });
  }
}
