// Avisos del Club para la tarjeta de PRUEBA (/club/demo). Solo dev/preview.
import { NextResponse } from "next/server";
import { CLUB_DEMO_ON } from "@/components/site/club/clubTipos";
import { MENSAJES_DEMO } from "@/lib/club-demo";

export async function GET() {
  if (!CLUB_DEMO_ON) return NextResponse.json({ error: "No disponible" }, { status: 404 });
  return NextResponse.json({ mensajes: MENSAJES_DEMO });
}
