// Código de regalo de un repetido en la tarjeta de PRUEBA. Solo dev/preview.
// El código es de mentiras: sirve para ver el modal y el envío por WhatsApp.
import { NextResponse } from "next/server";
import { esClubDemo } from "@/components/site/club/clubTipos";
import { estadoDemo } from "@/lib/club-demo";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!esClubDemo(token)) return NextResponse.json({ error: "Tarjeta no encontrada" }, { status: 404 });

  const { stickerId } = await req.json().catch(() => ({ stickerId: null }));
  const mio = estadoDemo().album.find((a) => a.id === stickerId);
  if (!mio || mio.cantidad < 2) {
    return NextResponse.json({ error: "Solo puedes regalar un sticker repetido" }, { status: 400 });
  }
  return NextResponse.json({ codigo: `DEMO-${Math.random().toString(36).slice(2, 8).toUpperCase()}` });
}
