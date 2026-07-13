import type { Metadata } from "next";
import TarjetaClub from "@/components/site/TarjetaClub";

// Tarjeta de lealtad del Club Creativo Papela — link privado que Papela
// comparte al miembro. Los datos viven en el admin y se leen de su API
// pública (/api/public/club/[token]). Ruta standalone (sin navbar/footer,
// ver ConditionalShell) y noindex: el token es la única llave.

const CLUB_API = "https://admin.papela-atelier.com/api/public/club";

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

export default function ClubCardPage() {
  return <TarjetaClub />;
}
