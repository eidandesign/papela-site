import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getClaseBySlug, getClases } from "@/lib/clases";
import { getActividades } from "@/lib/clases-actividades";
import { SITE_URL } from "@/lib/site";
import ActividadesGrid from "@/components/site/ActividadesGrid";

export const revalidate = 60;

// Prerenderiza el detalle de cada maestra activa (son pocas); las nuevas
// se generan on-demand y se cachean con el mismo revalidate.
export async function generateStaticParams() {
  const maestras = await getClases();
  return maestras.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const maestra = await getClaseBySlug(slug);

  if (!maestra) {
    return { title: "Clase no encontrada", robots: { index: false, follow: false } };
  }

  const tecnicas = maestra.tecnicas?.join(", ") || "arte";
  const desc =
    maestra.descripcion?.slice(0, 155) ??
    `Clases de ${tecnicas} con ${maestra.nombre} en Papela Atelier, Puebla.`;
  const url = `${SITE_URL}/clases/${maestra.slug}`;

  return {
    title: { absolute: `${maestra.nombre}, maestra de ${tecnicas} — Papela Atelier` },
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title: `${maestra.nombre}, maestra en Papela Atelier`,
      description: desc,
      url,
      images: maestra.foto ? [{ url: maestra.foto, alt: maestra.nombre }] : undefined,
    },
  };
}

// Perfil de la maestra (oct-2026, a petición del dueño): SOLO quién es — foto,
// nombre, lo que enseña, descripción y experiencia — y abajo "Más
// información" (sus actividades con imágenes). Las clases, horarios y precios
// viven en /clases: la clase es de Papela, no depende de quién la da.
export default async function ClaseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const maestra = await getClaseBySlug(slug);
  if (!maestra) notFound();

  const actividades = getActividades(maestra.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: maestra.nombre,
    description: maestra.descripcion ?? undefined,
    image: maestra.foto ?? undefined,
    knowsAbout: maestra.tecnicas?.length ? maestra.tecnicas : undefined,
    worksFor: { "@type": "Organization", name: "Papela Atelier", url: SITE_URL },
    url: `${SITE_URL}/clases/${maestra.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="w-[90%] mx-auto pt-40 md:pt-[200px] pb-16">
        {/* ── Perfil ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="relative w-full aspect-[4/3] md:aspect-[624/520] rounded-2xl overflow-hidden">
            {maestra.foto ? (
              <Image
                src={maestra.foto}
                alt={maestra.nombre}
                fill
                sizes="(max-width: 768px) 90vw, 45vw"
                className="object-cover object-center"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-[#5d7c80]" />
            )}
          </div>

          <div className="flex flex-col">
            <h1 className="font-serif italic text-[#664917] text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[1.05]">
              {maestra.nombre}
            </h1>

            {maestra.tecnicas?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {maestra.tecnicas.map((t) => (
                  <span key={t} className="rounded-full bg-[#f2f0e9] px-3 py-1.5 font-sans text-sm text-[var(--color-muted)]">
                    {t}
                  </span>
                ))}
              </div>
            )}

            {maestra.descripcion && (
              <p className="font-sans text-[var(--color-text)] text-[17px] leading-7 mt-6 whitespace-pre-line">{maestra.descripcion}</p>
            )}

            {maestra.experiencia && (
              <p className="font-sans text-[var(--color-muted)] text-[15px] leading-7 mt-3 whitespace-pre-line">{maestra.experiencia}</p>
            )}

            <div className="mt-8">
              <Link
                href="/clases"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-verde)] px-7 py-3.5 font-sans text-sm font-semibold text-[var(--color-cremita)] hover:opacity-90 transition-opacity"
              >
                Ver clases de Papela
              </Link>
            </div>
          </div>
        </section>

        {/* ── Más información: lo que se trabaja con ella ── */}
        {actividades.length > 0 && (
          <section className="mt-16 md:mt-24">
            <h2 className="text-center font-serif font-extralight text-[clamp(2rem,4.5vw,3.25rem)] text-[#403c3c] leading-tight mb-8 md:mb-12">
              Más información
            </h2>
            <ActividadesGrid actividades={actividades} />
          </section>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/clases"
            className="font-sans text-sm text-[var(--color-muted)] hover:text-[var(--color-verde)] transition-colors"
          >
            ← Ver todas las clases
          </Link>
        </div>
      </div>
    </>
  );
}
