import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getClaseBySlug } from "@/lib/clases";
import { SITE_URL } from "@/lib/site";
import ClaseCalendar from "@/components/site/ClaseCalendar";

export const revalidate = 60;

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
    title: { absolute: `Clases de ${tecnicas} con ${maestra.nombre} — Puebla` },
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title: `Clases de ${tecnicas} con ${maestra.nombre}`,
      description: desc,
      url,
      images: maestra.foto ? [{ url: maestra.foto, alt: maestra.nombre }] : undefined,
    },
  };
}

export default async function ClaseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const maestra = await getClaseBySlug(slug);

  if (!maestra) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `Clases de ${maestra.tecnicas?.join(", ") || "arte"} con ${maestra.nombre}`,
    description: maestra.descripcion ?? undefined,
    image: maestra.foto ?? undefined,
    inLanguage: "es-MX",
    provider: {
      "@type": "Organization",
      name: "Papela Atelier",
      url: SITE_URL,
    },
    offers: {
      "@type": "Offer",
      category: "Clases de arte",
      priceCurrency: "MXN",
      availability:
        maestra.horarios.length > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
      url: `${SITE_URL}/clases/${maestra.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ── Detalle: dos columnas (foto + info / calendario) ── */}
      <section className="w-[90%] mx-auto pt-40 md:pt-[200px] pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-start">
          {/* Izquierda — foto card + descripción/experiencia */}
          <div className="flex flex-col gap-8">
            {/* Foto card con overlay del nombre */}
            <div className="relative w-full aspect-[624/567] rounded-2xl overflow-hidden">
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
              <div className="absolute bottom-4 left-4 max-w-[88%] bg-[#f9eae3] rounded-2xl px-6 md:px-10 py-3 md:py-4">
                <h1 className="font-serif italic text-[#664917] text-[clamp(1.8rem,4.5vw,3rem)] leading-[1.12]">
                  {maestra.nombre}
                </h1>
                {maestra.tecnicas?.length > 0 && (
                  <p className="font-sans text-[#403c3c] text-[clamp(0.9rem,1.6vw,1.125rem)] leading-7 mt-0.5">
                    {maestra.tecnicas.join(" · ")}
                  </p>
                )}
              </div>
            </div>

            {maestra.descripcion && (
              <div className="flex flex-col gap-3">
                <span className="self-start bg-[#fdeee8] text-black text-[12px] tracking-[2px] uppercase font-sans px-2 py-px rounded-[10px]">
                  Descripción
                </span>
                <p className="font-sans text-[#403c3c] text-[18px] leading-7">
                  {maestra.descripcion}
                </p>
              </div>
            )}

            {maestra.experiencia && (
              <div className="flex flex-col gap-3">
                <span className="self-start bg-[#fdeee8] text-black text-[12px] tracking-[2px] uppercase font-sans px-2 py-px rounded-[10px]">
                  Experiencia
                </span>
                <p className="font-sans text-[#403c3c] text-[18px] leading-7">
                  {maestra.experiencia}
                </p>
              </div>
            )}
          </div>

          {/* Derecha — calendario */}
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h2 className="font-serif font-extralight text-[clamp(2.2rem,5vw,3.5rem)] text-[#403c3c] leading-tight mb-1">
                Elige tu horario
              </h2>
              <p className="font-sans text-[var(--color-muted)] text-sm">
                Selecciona el día y hora que más te acomode.
              </p>
            </div>

            {maestra.horarios.length > 0 ? (
              <ClaseCalendar horarios={maestra.horarios} claseNombre={maestra.nombre} />
            ) : (
              <div className="bg-[#f2f0e9] rounded-xl px-5 py-8 text-center">
                <p className="font-serif font-extralight text-xl text-[#403C3C] mb-2">Próximamente</p>
                <p className="font-sans text-[var(--color-muted)]">
                  No hay horarios disponibles por el momento.
                </p>
              </div>
            )}

            <Link href="/clases" className="text-center font-sans text-sm text-[var(--color-muted)] hover:text-[var(--color-verde)] transition-colors">
              ← Ver todas las clases
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
