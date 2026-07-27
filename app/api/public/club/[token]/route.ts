// Tarjeta de PRUEBA del Club (/club/demo) — espeja el GET/PATCH del admin.
// Solo dev/preview: en producción responde 404 (ver CLUB_DEMO_ON).
// `?reset=1` devuelve la tarjeta a su estado inicial (stickers, pendientes y
// personalización), útil para volver a probar el rascado.

import { NextResponse } from "next/server";
import { esClubDemo } from "@/components/site/club/clubTipos";
import { estadoDemo, resetDemo } from "@/lib/club-demo";

export const dynamic = "force-dynamic";

const noEncontrada = () => NextResponse.json({ error: "Tarjeta no encontrada" }, { status: 404 });

function tarjeta(st: ReturnType<typeof estadoDemo>) {
  return {
    nombre: st.nombre,
    desde: st.desde,
    numero: st.numero,
    estilo: st.estilo,
    stickers: {
      obtenidos: st.album.length,
      pendientes: st.pendientes,
      album: st.album,
      detalles: st.detalles,
    },
  };
}

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!esClubDemo(token)) return noEncontrada();
  const reset = new URL(req.url).searchParams.has("reset");
  return NextResponse.json(tarjeta(reset ? resetDemo() : estadoDemo()));
}

export async function PATCH(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!esClubDemo(token)) return noEncontrada();
  const body = await req.json().catch(() => ({}));
  const st = estadoDemo();
  if (body?.estilo && typeof body.estilo === "object") st.estilo = body.estilo;
  return NextResponse.json({ ok: true, estilo: st.estilo });
}
