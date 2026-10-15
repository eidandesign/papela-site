import { NextRequest, NextResponse } from "next/server";
import { conUtm } from "@/lib/utm";

// Link corto del mensaje semanal al grupo de vecinos: papela-atelier.com/w
// (o /w?to=/talleres). Redirige con UTM para que GA4 no lo cuente como "Direct".
const UTM = { source: "whatsapp", medium: "grupo_vecinos", campaign: "semanal" };

export function GET(req: NextRequest) {
  const to = req.nextUrl.searchParams.get("to");
  // Solo rutas internas: "/algo", nunca "//dominio" ni "/\dominio" (open redirect).
  const destino = to && /^\/(?![/\\])/.test(to) ? to : "/";
  return NextResponse.redirect(new URL(conUtm(destino, UTM), req.nextUrl.origin), 307);
}
