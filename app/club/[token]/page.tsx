import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TarjetaClub from "@/components/site/TarjetaClub";
import { esClubDemo } from "@/components/site/club/clubTipos";

// Tarjeta de lealtad del Club Creativo Papela — link privado que Papela
// comparte al miembro. Los datos viven en el admin y se leen de su API
// pública (/api/public/club/[token]). Ruta standalone (sin navbar/footer,
// ver ConditionalShell) y noindex: el token es la única llave.

const CLUB_API = "https://admin.papela-atelier.com/api/public/club";

// Mismo formato que CLUB_TOKEN_RE del admin: lo que no calza ni se consulta.
const TOKEN_RE = /^[a-z0-9](?:[a-z0-9-]{1,78}[a-z0-9])?$/i;

// Un token inexistente responde 404 de verdad (auditoría 2026-10-16, Fase 1
// #11): antes la página cargaba con 200 y la tarjeta mostraba el error en
// cliente, así que un escaneo de tokens no distinguía válidos de inválidos
// por el status y los buscadores podían indexar la cáscara. La demo (/club/demo,
// solo dev/preview) no pasa por el admin.
async function existeEnAdmin(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${CLUB_API}/${token}`, { next: { revalidate: 300 } });
    return res.status !== 404;
  } catch {
    return true; // admin caído: que el cliente lo intente y muestre su aviso
  }
}

// Preview personalizado al compartir el link (WhatsApp, etc.): título con el
// nombre del miembro. La IMAGEN de marca se genera al vuelo y la inyecta Next
// automáticamente desde app/club/[token]/opengraph-image.tsx.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;

  let nombre: string | null = null;
  try {
    const res = await fetch(`${CLUB_API}/${token}`, { next: { revalidate: 300 } });
    if (res.ok) {
      const data = await res.json();
      if (typeof data?.nombre === "string" && data.nombre.trim()) nombre = data.nombre.trim();
    }
  } catch {
    /* preview genérico si el admin no responde */
  }

  const titulo = nombre
    ? `La tarjeta de ${nombre} — Club Creativo Papela`
    : "Club Creativo Papela — Mi tarjeta";
  const descripcion = nombre
    ? `${nombre}, este es tu pase del Club Creativo Papela: junta coleccionables y desbloquea recompensas. 🎨`
    : "Tarjeta de lealtad del Club Creativo Papela Atelier — junta coleccionables y gana premios.";

  return {
    title: titulo,
    description: descripcion,
    robots: { index: false, follow: false },
    openGraph: {
      title: titulo,
      description: descripcion,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: descripcion,
    },
  };
}

export default async function ClubCardPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!TOKEN_RE.test(token)) notFound();
  if (!esClubDemo(token) && !(await existeEnAdmin(token))) notFound();
  return <TarjetaClub />;
}
