// Catálogo del álbum para la tarjeta de PRUEBA (/club/demo). Solo dev/preview.
import { NextResponse } from "next/server";
import { CLUB_DEMO_ON } from "@/components/site/club/clubTipos";
import { catalogoDemo } from "@/lib/club-demo";

export async function GET() {
  if (!CLUB_DEMO_ON) return NextResponse.json({ error: "No disponible" }, { status: 404 });
  return NextResponse.json(await catalogoDemo());
}
