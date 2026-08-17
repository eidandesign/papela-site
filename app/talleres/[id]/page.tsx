import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/solid";
import { getTalleres, type Taller } from "@/lib/talleres";
import TallerDescripcion from "@/components/site/TallerDescripcion";
import TalleresGallery from "@/components/site/TalleresGallery";

export const revalidate = 60;

const SITE_URL = "https://www.papela-atelier.com";

function formatFecha(fecha: string) {
  // `fecha` es fecha sola (sin hora): se interpreta como medianoche UTC. Forzamos
  // timeZone UTC para mostrar la fecha calendario literal y no desplazarla un día.
  return new Date(fecha).toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

// startDate/endDate ISO para el schema Event. La hora del admin viene "HH:MM";
// si trae otro formato la omitimos y mandamos solo la fecha (válido en schema.org).
// Offset fijo -06:00: México ya no tiene horario de verano.
function fechaIso(fecha: string, hora: string | null): string {
  const h = hora?.match(/^(\d{1,2}):(\d{2})/);
  if (!h) return fecha;
  return `${fecha}T${h[1].padStart(2, "0")}:${h[2]}:00-06:00`;
}

async function getTaller(id: string): Promise<Taller | undefined> {
  const talleres = await getTalleres();
  return talleres.find((t) => t.id === id);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const taller = await getTaller(id);
  if (!taller) return { robots: { index: false, follow: false } };

  const descripcion =
    taller.descripcion?.replace(/\s+/g, " ").trim().slice(0, 155) ??
    `Taller presencial de ${taller.categoria ?? "arte"} en Papela Atelier, Puebla. Cupo limitado, materiales incluidos.`;

  return {
    title: { absolute: `${taller.titulo} — Taller de arte en Puebla · Papela Atelier` },
    description: descripcion,
    alternates: { canonical: `${SITE_URL}/talleres/${taller.id}` },
    openGraph: {
      title: `${taller.titulo} — Taller en Puebla`,
      description: descripcion,
      images: taller.imagen_url ? [{ url: taller.imagen_url, alt: taller.titulo }] : undefined,
    },
  };
}

export default async function TallerDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const taller = await getTaller(id);
  if (!taller) notFound();

  const agotado = taller.estado === "Agotado";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Event",
        name: taller.titulo,
        description: taller.descripcion ?? undefined,
        ...(taller.fecha
          ? {
              startDate: fechaIso(taller.fecha, taller.hora_inicio),
              ...(taller.hora_fin ? { endDate: fechaIso(taller.fecha, taller.hora_fin) } : {}),
            }
          : {}),
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        image: taller.imagen_url ?? undefined,
        inLanguage: "es-MX",
        location: {
          "@type": "Place",
          name: "Papela Atelier",
          address: {
            "@type": "PostalAddress",
            streetAddress: "C. Hidalgo",
            addressLocality: "Heroica Puebla de Zaragoza",
            addressRegion: "Puebla",
            postalCode: "72830",
            addressCountry: "MX",
          },
        },
        organizer: { "@id": `${SITE_URL}/#business` },
        ...(taller.instructor_nombre
          ? { performer: { "@type": "Person", name: taller.instructor_nombre } }
          : {}),
        offers: {
          "@type": "Offer",
          price: taller.precio,
          priceCurrency: "MXN",
          availability: agotado ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
          url: `${SITE_URL}/talleres/${taller.id}`,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Talleres", item: `${SITE_URL}/talleres` },
          { "@type": "ListItem", position: 2, name: taller.titulo },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="w-[90%] mx-auto pt-[150px] md:pt-[200px] pb-16">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 max-w-[960px] mx-auto items-start">
          {/* Imagen */}
          <div className="flex flex-col gap-6 w-full md:w-[440px] md:flex-shrink-0">
            <Link
              href="/talleres"
              className="inline-flex items-center gap-2 text-sm font-sans font-medium text-[var(--color-verde)] hover:opacity-70 transition-opacity"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Volver a talleres
            </Link>
            {taller.imagen_url && (
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden">
                <Image
                  src={taller.imagen_url}
                  alt={`${taller.titulo} — taller en Papela Atelier, Puebla`}
                  fill
                  sizes="(min-width: 768px) 45vw, 90vw"
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-5 w-full md:flex-1 md:pt-10">
            <div className="flex flex-wrap items-center gap-2">
              {taller.categoria && (
                <span className="text-[10px] font-bold uppercase tracking-[1px] px-3 py-1 rounded-full bg-[var(--color-cremita)] text-[var(--color-verde)]">
                  {taller.categoria}
                </span>
              )}
              {agotado && (
                <span className="bg-[var(--color-terracota)] rounded-full px-3 py-1 font-sans font-bold text-[var(--color-cremita)] text-[10px] tracking-[1px] uppercase leading-[15px]">
                  Agotado
                </span>
              )}
            </div>

            <h1 className="font-serif italic text-[clamp(2rem,4vw,3rem)] text-[var(--color-text)] leading-[1.1]">
              {taller.titulo}
            </h1>

            {taller.instructor_nombre && (
              <p className="font-sans text-base text-[var(--color-muted)] -mt-2">
                Impartido por <span className="text-[var(--color-text)]">{taller.instructor_nombre}</span>
                {taller.instructor_instagram && (
                  <>
                    {" "}·{" "}
                    <a
                      href={`https://instagram.com/${taller.instructor_instagram.replace(/^@/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-verde)] hover:opacity-70"
                    >
                      @{taller.instructor_instagram.replace(/^@/, "")}
                    </a>
                  </>
                )}
              </p>
            )}

            {taller.fecha && (
              <p className="font-sans text-base text-[var(--color-text)] capitalize">
                {formatFecha(taller.fecha)}
                {taller.hora_inicio && (
                  <span className="normal-case">
                    {" "}· {taller.hora_inicio}
                    {taller.hora_fin ? ` — ${taller.hora_fin}` : ""} h
                  </span>
                )}
              </p>
            )}

            {taller.descripcion && <TallerDescripcion texto={taller.descripcion} />}

            <div className="flex items-end justify-between border-t border-[var(--color-border)] pt-5 mt-2">
              <div className="flex flex-col gap-1">
                <p className="font-sans font-bold text-[#6e645f] text-[10px] tracking-[1px] uppercase leading-[15px]">
                  Inversión
                </p>
                <p className="font-serif font-extralight text-[#403c3c] text-[32px] leading-[32px]">
                  ${taller.precio.toLocaleString()}
                </p>
              </div>
              {agotado ? (
                <span
                  aria-disabled="true"
                  className="flex items-center justify-center gap-2 bg-[#9b8f86] text-[#f3e6cf] rounded-lg px-4 py-3 font-sans text-[16px] leading-[24px] cursor-not-allowed select-none"
                >
                  Agotado
                </span>
              ) : (
                <Link
                  href={`/talleres/${taller.id}/checkout`}
                  aria-label={`Apartar lugar en ${taller.titulo}`}
                  className="flex items-center justify-center gap-2 bg-[#12535c] text-[#f3e6cf] rounded-lg px-4 py-3 font-sans text-[16px] leading-[24px] hover:opacity-90 transition-opacity"
                >
                  Apartar lugar
                  <ArrowRightIcon className="w-5 h-5" aria-hidden="true" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Galería animada de talleres + texto */}
      <TalleresGallery />
    </div>
  );
}
