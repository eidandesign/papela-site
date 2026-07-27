// Rascado de un sticker sorpresa en la tarjeta de PRUEBA. Solo dev/preview.
import { NextResponse } from "next/server";
import { esClubDemo } from "@/components/site/club/clubTipos";
import { revelarDemo } from "@/lib/club-demo";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!esClubDemo(token)) return NextResponse.json({ error: "Tarjeta no encontrada" }, { status: 404 });
  const rev = await revelarDemo();
  if (!rev) return NextResponse.json({ error: "No tienes stickers por revelar" }, { status: 400 });
  return NextResponse.json(rev);
}
