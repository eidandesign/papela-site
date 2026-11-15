import { NextRequest, NextResponse } from "next/server";
import { conUtm } from "@/lib/utm";

// Link corto del mensaje semanal al grupo de vecinos: papela-atelier.com/w
// (o /w?to=/talleres). Redirige con UTM para que GA4 no lo cuente como "Direct".
const UTM = { source: "whatsapp", medium: "grupo_vecinos", campaign: "semanal" };

export function GET(req: NextRequest) {
  const to = req.nextUrl.searchParams.get("to");
  // Solo rutas internas: "/algo", nunca "//dominio" ni "/\dominio" (open redirect).
  // Además se compara el origen del resultado: "/.//dominio" pasa la primera
  // prueba y al normalizarse la ruta queda "//dominio" (otro sitio).
  const destino = to && /^\/(?![/\\])[A-Za-z0-9\-_./~%?&=#]*$/.test(to) ? to : "/";
  const origen = req.nextUrl.origin;
  let url = new URL(conUtm(destino, UTM), origen);
  if (url.origin !== origen) url = new URL(conUtm("/", UTM), origen);
  return NextResponse.redirect(url, 307);
}
