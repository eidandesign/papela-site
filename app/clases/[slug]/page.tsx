import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getClaseBySlug, getHorariosSemanales } from "@/lib/clases";
import { getActividades } from "@/lib/clases-actividades";
import { SITE_URL } from "@/lib/site";
import ReservaButton from "@/components/site/ReservaButton";
import ActividadCard from "@/components/site/ActividadCard";

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

  const actividades = getActividades(maestra.slug);
  const horariosSemanales = getHorariosSemanales(maestra.horarios);

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="w-[90%] mx-auto pt-40 md:pt-[200px] pb-16">
        {/* ── Hero: foto + perfil de la maestra ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Foto */}
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

          {/* Info */}
          <div className="flex flex-col">
            <h1 className="font-serif italic text-[#664917] text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[1.05]">
              {maestra.nombre}
            </h1>

            {maestra.tecnicas?.length > 0 && (
              <p className="font-sans text-[var(--color-muted)] text-[clamp(0.95rem,1.5vw,1.05rem)] leading-7 mt-3">
                {maestra.tecnicas.join(" · ")}
              </p>
            )}

            {maestra.descripcion && (
              <p className="font-sans text-[var(--color-text)] text-[17px] leading-7 mt-5">
                {maestra.descripcion}
              </p>
            )}

            {maestra.experiencia && (
              <p className="font-sans text-[var(--color-muted)] text-[15px] leading-7 mt-3">
                {maestra.experiencia}
              </p>
            )}

            {horariosSemanales.length > 0 && (
              <div className="mt-7">
                <p className="label text-[var(--color-terracota)]">Horarios disponibles</p>
                <ul className="mt-3 flex flex-col gap-1.5">
                  {horariosSemanales.map((h) => (
                    <li
                      key={`${h.dia}-${h.rango}`}
                      className="font-sans text-[var(--color-text)] text-[15px] leading-6"
                    >
                      <span className="font-semibold text-[#664917]">{h.dia}</span>{" "}
                      {h.rango}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-7">
              <ReservaButton
                horarios={maestra.horarios}
                claseNombre={maestra.nombre}
                whatsapp={maestra.whatsapp}
                actividades={actividades.map((a) => a.titulo)}
                label="Reservar Clase"
              />
            </div>
          </div>
        </section>

        {/* ── Clases que imparte ── */}
        {actividades.length > 0 && (
          <section className="mt-16 md:mt-24">
            <h2 className="text-center font-serif font-extralight text-[clamp(2rem,4.5vw,3.25rem)] text-[#403c3c] leading-tight mb-8 md:mb-12">
              Clases de {maestra.nombre}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {actividades.map((a) => (
                <ActividadCard key={a.titulo} actividad={a} />
              ))}
            </div>

            {/* CTA inferior para reservar */}
            <div className="flex justify-center mt-12">
              <ReservaButton
                horarios={maestra.horarios}
                claseNombre={maestra.nombre}
                whatsapp={maestra.whatsapp}
                actividades={actividades.map((a) => a.titulo)}
                label="Reservar Clase"
              />
            </div>
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
