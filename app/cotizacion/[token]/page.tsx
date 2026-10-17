import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CotizacionDoc from "@/components/site/CotizacionDoc";

// Cotización de proyecto — link privado que Papela comparte al cliente.
// Los datos viven en el admin y se leen de su API pública
// (/api/public/cotizacion/[token]). Ruta standalone (sin navbar/footer,
// ver ConditionalShell) y noindex: el token es la única llave.

// En dev el endpoint vive en el admin local; en producción, en el deployado.
const COTIZACION_API =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/api/public/cotizacion"
    : "https://admin.papela-atelier.com/api/public/cotizacion";

// Mismo formato que COTIZACION_TOKEN_RE del admin.
const TOKEN_RE = /^[a-z0-9](?:[a-z0-9-]{1,78}[a-z0-9])?$/i;

// Token inexistente → 404 real (auditoría 2026-10-16, Fase 1 #11); ver la
// nota equivalente en app/club/[token]/page.tsx.
async function existeEnAdmin(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${COTIZACION_API}/${token}`, { next: { revalidate: 300 } });
    return res.status !== 404;
  } catch {
    return true;
  }
}

// Preview al compartir el link por WhatsApp: título con el nombre del proyecto.
// La IMAGEN de marca se genera al vuelo y la inyecta Next automáticamente
// desde app/cotizacion/[token]/opengraph-image.tsx.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;

  let proyecto: string | null = null;
  try {
    const res = await fetch(`${COTIZACION_API}/${token}`, { next: { revalidate: 300 } });
    if (res.ok) {
      const data = await res.json();
      if (typeof data?.proyecto === "string" && data.proyecto.trim()) proyecto = data.proyecto.trim();
    }
  } catch {
    /* preview genérico si el admin no responde */
  }

  const titulo = proyecto
    ? `Cotización: ${proyecto} — Papela Atelier`
    : "Cotización — Papela Atelier";
  const descripcion = "Tu cotización de Papela Atelier: detalle del proyecto, tiempos de entrega y total. ✨";

  return {
    title: titulo,
    description: descripcion,
    robots: { index: false, follow: false },
    openGraph: { title: titulo, description: descripcion, type: "website" },
    twitter: { card: "summary_large_image", title: titulo, description: descripcion },
  };
}

export default async function CotizacionPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!TOKEN_RE.test(token)) notFound();
  if (!(await existeEnAdmin(token))) notFound();
  return <CotizacionDoc />;
}
