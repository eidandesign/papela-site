import { NextResponse, type NextRequest } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";
import {
  avisarPostulacion,
  guardarPostulacion,
  validaPostulacion,
} from "@/lib/creadores/postulacion";

// POST /api/creadores/postulacion — recibe la postulación del formulario de
// /creadores. Valida en el servidor, guarda en `creadores_postulaciones`
// (estado `recibida`) y avisa a Papela por correo. Enviar NO es aceptación ni
// firma de contrato. Honeypot `sitio` + límite por IP.

const SIN_CACHE = { "Cache-Control": "no-store" };

export async function POST(req: NextRequest) {
  if (
    !(await rateLimit(
      `creadores-postulacion:${getClientIp(req)}`,
      5,
      60 * 60 * 1000,
    ))
  ) {
    return NextResponse.json(
      { error: "Demasiados envíos seguidos. Intenta en un rato." },
      { status: 429, headers: SIN_CACHE },
    );
  }

  let body: unknown;
  try {
    const texto = await req.text();
    if (texto.length > 20_000) throw new Error("demasiado grande");
    body = JSON.parse(texto);
  } catch {
    return NextResponse.json(
      { error: "No pudimos leer el formulario." },
      { status: 400, headers: SIN_CACHE },
    );
  }

  // Honeypot: el campo "sitio" está oculto para las personas. Si llega lleno
  // es un bot; se responde ok sin guardar nada.
  const trampa = (body as { sitio?: unknown } | null)?.sitio;
  if (typeof trampa === "string" && trampa.trim()) {
    return NextResponse.json({ ok: true }, { headers: SIN_CACHE });
  }

  const v = validaPostulacion(body);
  if (!v.ok)
    return NextResponse.json(
      { error: v.error },
      { status: 400, headers: SIN_CACHE },
    );

  const { ok, nueva } = await guardarPostulacion(v.datos);
  if (!ok) {
    return NextResponse.json(
      {
        error:
          "No pudimos enviar tu propuesta. Intenta de nuevo en unos minutos.",
      },
      { status: 500, headers: SIN_CACHE },
    );
  }
  // Solo la primera vez: un reintento de la misma postulación no reenvía el correo.
  if (nueva) {
    try {
      await avisarPostulacion(v.datos);
    } catch (error) {
      logger.error("creadores: falló el aviso", {}, error);
    }
  }
  return NextResponse.json({ ok: true }, { headers: SIN_CACHE });
}
