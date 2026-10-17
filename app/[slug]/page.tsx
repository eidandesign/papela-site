import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MiniSiteRenderer from "@/components/mini-sites/MiniSiteRenderer";
import { fetchMiniSite, MINI_SITE_SLUG_RE } from "@/lib/mini-sites";
import SiteNavbar from "@/components/site/Navbar";
import SiteFooter from "@/components/site/Footer";
import MenuDemo from "@/components/site/MenuDemo";
import WhatsAppLink from "@/components/site/WhatsAppLink";

function WaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
    </svg>
  );
}

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
  if (r.status !== "published") return { title: "Este negocio ya expiró", robots: { index: false, follow: false } };
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
    // Página de un Mini Site desactivado (venció o se dio de baja). No muestra
    // nada del cliente (la API ni lo manda): se vuelve vitrina de Papela, con
    // navbar y footer del sitio, para que quien escanee el QR pueda pedir el suyo.
    const waTexto = `Hola Papela 🌿 quiero tener mi menú en línea. (Vi papela-atelier.com/${slug})`;
    return (
      <>
        <SiteNavbar />
        {/* Hero verde: el navbar del sitio es transparente con letras crema
            (pensado para ir sobre un hero oscuro); el pt deja libre su franja fija. */}
        <main className="flex-1 bg-[var(--color-verde)] text-[var(--color-cremita)] flex items-center justify-center px-6 pt-[180px] md:pt-[220px] pb-24 text-center" style={{ minHeight: "100dvh" }}>
          <div className="w-full max-w-2xl flex flex-col items-center">
            <div className="mb-12 w-full"><MenuDemo /></div>
            <h1 className="font-serif text-3xl md:text-5xl mb-4">Este negocio ya expiró</h1>
            <p className="max-w-md text-base md:text-lg text-[var(--color-cremita)]/80 mb-9">
              ¿Quieres tener tu menú en línea? Mándanos mensaje por WhatsApp.
            </p>
            <WhatsAppLink
              ubicacion="mini_site_expirado"
              texto={waTexto}
              className="inline-flex items-center gap-2.5 rounded-full bg-[var(--color-whatsapp)] px-7 py-3.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-cremita)]/40"
            >
              <WaIcon className="h-5 w-5" />
              Escríbenos por WhatsApp
            </WhatsAppLink>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  return <MiniSiteRenderer site={r.site} mode="public" />;
}
