import { NextResponse, type NextRequest } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";
import { leerSesion } from "@/lib/maestros/sesion";
import { saneaDatosContrato } from "@/lib/maestros/campos";
import { generarContratoPdf, nombreArchivoContrato } from "@/lib/maestros/contrato-pdf";

// POST /colabora/maestros/contrato — arma el PDF del Acuerdo de colaboración
// con los datos que recibe. Hoy la página ya no lo descarga (el maestro manda
// su propuesta y firman juntos); se conserva para generar el acuerdo
// prellenado cuando Papela lo necesite. Solo con sesión vigente: no hay archivo público
// del contrato, así que conocer esta URL no sirve sin la cookie. Lo que se
// escribe NO se guarda (se usa para dibujar el PDF y se descarta).

const SIN_CACHE = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };

export async function POST(req: NextRequest) {
  const sesion = await leerSesion();
  if (!sesion) {
    return NextResponse.json({ error: "Tu sesión venció. Vuelve a escribir la contraseña." }, { status: 401, headers: SIN_CACHE });
  }

  if (!(await rateLimit(`maestros-contrato:${getClientIp(req)}`, 30, 60 * 60 * 1000))) {
    return NextResponse.json({ error: "Demasiadas descargas seguidas. Intenta en un rato." }, { status: 429, headers: SIN_CACHE });
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
  if (!datos) {
    return NextResponse.json({ error: "Elige la modalidad del acuerdo." }, { status: 400, headers: SIN_CACHE });
  }

  try {
    const pdf = generarContratoPdf(datos);

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        ...SIN_CACHE,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${nombreArchivoContrato(datos)}"`,
      },
    });
  } catch (error) {
    logger.error("maestros: no se pudo generar el contrato", { modalidad: datos.modalidad }, error);
    return NextResponse.json({ error: "No pudimos generar el PDF. Intenta de nuevo." }, { status: 500, headers: SIN_CACHE });
  }
}
