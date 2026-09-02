import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MiniSiteRenderer from "@/components/mini-sites/MiniSiteRenderer";
import { fetchMiniSite, MINI_SITE_SLUG_RE } from "@/lib/mini-sites";

// Mini Site de un cliente de Papela: papela-atelier.com/<slug>.
// UNA sola página dinámica para todos los sitios: busca el Mini Site por slug
// en la API pública del admin (que a su vez resuelve con resolveMiniSite —
// mañana también por hostname para dominios propios), y lo renderiza con el
// mismo MiniSiteRenderer que usa el preview del editor.
//
// Convive con las rutas existentes: Next prioriza las rutas estáticas
// (/talleres, /clases…) sobre [slug]; lo que no exista responde el 404 normal.
// Ruta standalone (sin navbar/footer del sitio, ver ConditionalShell).

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const r = MINI_SITE_SLUG_RE.test(slug) ? await fetchMiniSite(slug) : null;

  if (!r) return { title: "Página no encontrada", robots: { index: false, follow: false } };
  if (r.status !== "published") return { title: "Sitio no disponible", robots: { index: false, follow: false } };
  const { site } = r;
  const descripcion = site.description || `${site.businessName} — redes, contacto y más en un solo lugar.`;
  return {
    title: { absolute: site.businessName },
    description: descripcion,
    alternates: { canonical: site.url },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      url: site.url,
      title: site.businessName,
      description: descripcion,
      siteName: site.businessName,
      ...(site.logoUrl ? { images: [{ url: site.logoUrl, alt: site.businessName }] } : {}),
    },
    twitter: {
      card: "summary",
      title: site.businessName,
      description: descripcion,
      ...(site.logoUrl ? { images: [site.logoUrl] } : {}),
    },
  };
}

export default async function MiniSitePage({ params }: Props) {
  const { slug } = await params;
  if (!MINI_SITE_SLUG_RE.test(slug)) notFound();

  const r = await fetchMiniSite(slug);
  if (!r) notFound();

  if (r.status === "disabled") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-[var(--color-bg)] text-[var(--color-text)]">
        <div className="text-center max-w-sm">
          <p className="font-serif text-2xl mb-2">Este sitio no está disponible actualmente.</p>
          <p className="text-sm text-[var(--color-muted)]">Vuelve a intentarlo más tarde.</p>
        </div>
      </div>
    );
  }

  return <MiniSiteRenderer site={r.site} mode="public" />;
}
