import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

// Reporte de reproducción de video de la pantalla de la tienda (oct-2026).
// La pantalla (Samsung Tizen) no tiene consola a la mano: cuando un video de
// fondo no arranca, /publicidad manda aquí el motivo (error del medio, play()
// rechazado, reduced-motion, qué códecs dice soportar) y se lee en los logs
// de Vercel buscando "[publicidad-diag]". Solo registra; no guarda nada.
// Campos acotados y recortados: nada de PII, solo el estado del <video> y el UA.

const MAX = 2000;

export async function POST(req: Request) {
  if (!(await rateLimit(`publicidad-diag:${getClientIp(req)}`, 30, 60_000))) {
    return new NextResponse(null, { status: 429 });
  }
  const texto = (await req.text()).slice(0, MAX);
  let datos: unknown = texto;
  try {
    datos = JSON.parse(texto);
  } catch {
    // se registra tal cual (recortado)
  }
  console.info("[publicidad-diag]", JSON.stringify({ ua: req.headers.get("user-agent")?.slice(0, 300), datos }));
  return new NextResponse(null, { status: 204 });
}
