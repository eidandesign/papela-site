// Canje de un código de regalo en la tarjeta de PRUEBA. Solo dev/preview.
// Acepta cualquier código que empiece con "DEMO" y suma un pendiente por rascar.
import { NextResponse } from "next/server";
import { esClubDemo } from "@/components/site/club/clubTipos";
import { estadoDemo } from "@/lib/club-demo";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!esClubDemo(token)) return NextResponse.json({ error: "Tarjeta no encontrada" }, { status: 404 });

  const { codigo } = await req.json().catch(() => ({ codigo: "" }));
  if (typeof codigo !== "string" || !codigo.trim().toUpperCase().startsWith("DEMO")) {
    return NextResponse.json({ error: "Código no válido o vencido" }, { status: 400 });
  }
  const st = estadoDemo();
  st.pendientes += 1;
  return NextResponse.json({ ok: true, pendientes: st.pendientes });
}
