import { NextResponse, type NextRequest } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";
import { leerSesion } from "@/lib/maestros/sesion";
import { CAMPOS_FICHA, CAMPOS_OBLIGATORIOS, esUuid, saneaArchivos, saneaDatosContrato, saneaPortafolio } from "@/lib/maestros/campos";
import { guardarSolicitud } from "@/lib/maestros/solicitud";
import { avisarPropuesta } from "@/lib/maestros/aviso";

// POST /colabora/maestros/enviar — guarda la propuesta del maestro (último paso
// de /colabora/maestros/solicitud) en `maestros_solicitudes`. Papela la revisa
// en Admin → Maestros (y le llega un aviso por correo, lib/maestros/aviso.ts)
// y, una vez aprobada, firman juntos el acuerdo. Solo con
// sesión. `solicitudId` (uuid del navegador) hace el envío idempotente: un
// doble clic o un reintento actualizan la misma solicitud.

const SIN_CACHE = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };

export async function POST(req: NextRequest) {
  if (!(await leerSesion())) {
    return NextResponse.json({ error: "Tu sesión venció. Vuelve a escribir la contraseña." }, { status: 401, headers: SIN_CACHE });
  }
  if (!(await rateLimit(`maestros-enviar:${getClientIp(req)}`, 10, 60 * 60 * 1000))) {
    return NextResponse.json({ error: "Demasiados envíos seguidos. Intenta en un rato." }, { status: 429, headers: SIN_CACHE });
  }

  let body: unknown;
  try {
    const texto = await req.text();
    if (texto.length > 20_000) throw new Error("demasiado grande");
    body = JSON.parse(texto);
  } catch {
    return NextResponse.json({ error: "No pudimos leer el formulario." }, { status: 400, headers: SIN_CACHE });
  }

  const datos = saneaDatosContrato(body);
  const { solicitudId, portafolio, archivos } = (body ?? {}) as { solicitudId?: unknown; portafolio?: unknown; archivos?: unknown };
  if (!datos || !esUuid(solicitudId)) {
    return NextResponse.json({ error: "Elige qué vas a impartir." }, { status: 400, headers: SIN_CACHE });
  }
  const v = datos.valores;
  if (CAMPOS_OBLIGATORIOS.some((id) => !v[id])) {
    return NextResponse.json({ error: "Déjanos tu nombre, teléfono, correo e Instagram." }, { status: 400, headers: SIN_CACHE });
  }
  if (CAMPOS_FICHA[datos.modalidad].some((c) => !c.soloPdf && !v[c.id])) {
    return NextResponse.json({ error: "Completa los datos de tu clase o taller." }, { status: 400, headers: SIN_CACHE });
  }

  try {
    const extra = { portafolio: saneaPortafolio(portafolio), archivos: saneaArchivos(archivos, solicitudId) };
    const ok = await guardarSolicitud(solicitudId, datos, extra);
    if (!ok) throw new Error("upsert falló");
    // Aviso por correo a Papela (nunca rompe el envío: la propuesta ya se guardó).
    await avisarPropuesta(solicitudId, datos, extra);
    return NextResponse.json({ ok: true }, { headers: SIN_CACHE });
  } catch (error) {
    logger.error("maestros: no se pudo guardar la propuesta", { modalidad: datos.modalidad }, error);
    return NextResponse.json(
      { error: "No pudimos enviar tu propuesta. Intenta de nuevo o escríbenos por WhatsApp." },
      { status: 500, headers: SIN_CACHE },
    );
  }
}
