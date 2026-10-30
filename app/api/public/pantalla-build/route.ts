import { NextResponse } from "next/server";

// Build del deploy en vivo. La pantalla de la tienda lo compara con el que
// trae incrustado (NEXT_PUBLIC_PUBLICIDAD_BUILD) y, si cambió, se recarga
// sola al terminar el anuncio en curso: antes el código nuevo solo entraba
// con la recarga de cada 6 h o apagando la tele (reabrir la app de Tizen la
// trae del fondo sin recargar). ⚠️ La ruta NO empieza con
// /api/public/publicidad a propósito: el service worker cachea esas y sin
// red devolvería un build viejo/nuevo y la pantalla se recargaría en bucle.

export const dynamic = "force-dynamic";

export function GET() {
  const build = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? process.env.VERCEL_DEPLOYMENT_ID ?? "dev";
  return NextResponse.json({ build }, { headers: { "Cache-Control": "no-store" } });
}
