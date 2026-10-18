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
// Tope de espera al admin: WhatsApp genera el preview del link en el teléfono
// de quien lo pega y se rinde si la página tarda. Un admin lento (función en
// frío) no debe tirar el preview: se cae al título genérico y la tarjeta se
// sigue cargando en cliente como siempre.
const ADMIN_TIMEOUT_MS = 3000;

function consultarAdmin(token: string) {
  return fetch(`${CLUB_API}/${token}`, {
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(ADMIN_TIMEOUT_MS),
  });
}

async function existeEnAdmin(token: string): Promise<boolean> {
  try {
    const res = await consultarAdmin(token);
    return res.status !== 404;
  } catch {
    return true; // admin caído o lento: que el cliente lo intente y muestre su aviso
  }
}

// Preview personalizado al compartir el link (WhatsApp, etc.): título con el
// nombre del miembro y texto que vende el Club (Papela Coins + coleccionables).
// La IMAGEN de marca es ESTÁTICA: app/club/opengraph-image.tsx, pre-renderizada
// en el build (ver ahí por qué dejó de ser por miembro). Se referencia a mano
// porque el `openGraph` de esta página REEMPLAZA entero al del segmento padre
// (Next no fusiona openGraph en profundidad), así que la imagen heredada del
// archivo se perdía y WhatsApp recibía el link sin imagen.
const OG_IMAGE = { url: "/club/opengraph-image", width: 1200, height: 630, alt: "Club Creativo Papela — Papela Coins (cashback) y coleccionables" };
export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;

  let nombre: string | null = null;
  try {
    const res = await consultarAdmin(token);
    if (res.ok) {
      const data = await res.json();
      if (typeof data?.nombre === "string" && data.nombre.trim()) nombre = data.nombre.trim();
    }
  } catch {
    /* preview genérico si el admin no responde */
  }

  const titulo = nombre
    ? `La tarjeta de ${nombre} — Club Creativo Papela`
    : "Club Creativo Papela — Tu pase de miembro";
  const descripcion = nombre
    ? `${nombre}, este es tu pase del Club Creativo: ganas Papela Coins (cashback) en cada compra y coleccionables sorpresa para tu álbum. 🎨`
    : "Tu pase del Club Creativo Papela: Papela Coins (cashback) en cada compra y coleccionables sorpresa para tu álbum. 🎨";

  return {
    title: titulo,
    description: descripcion,
    robots: { index: false, follow: false },
    openGraph: {
      title: titulo,
      description: descripcion,
      type: "website",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: descripcion,
      images: [OG_IMAGE],
    },
  };
}

export default async function ClubCardPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!TOKEN_RE.test(token)) notFound();
  if (!esClubDemo(token) && !(await existeEnAdmin(token))) notFound();
  return <TarjetaClub />;
}
