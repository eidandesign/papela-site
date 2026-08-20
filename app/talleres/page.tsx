import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { getTalleres } from "@/lib/talleres";
import HeroSection from "@/components/site/HeroSection";
import TallerDescripcion from "@/components/site/TallerDescripcion";
import TallerGaleriaSection from "@/components/site/TallerGaleriaSection";

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: "Talleres de arte en Puebla — Papela Atelier" },
  description:
    "Talleres presenciales de acuarela, acrílico, cerámica y dibujo en Puebla. Para todos los niveles, con instructores especializados. ¡Llévate algo hecho por ti!",
  alternates: { canonical: "https://www.papela-atelier.com/talleres" },
  openGraph: {
    title: "Talleres de arte en Puebla — Papela Atelier",
    description:
      "Aprende acuarela, acrílico, cerámica y más en nuestros talleres presenciales en Puebla. ¡Llévate algo hecho por ti!",
    images: [{ url: "/images/talleres.avif", alt: "Talleres de arte Papela Atelier Puebla" }],
  },
};

function formatFecha(fecha: string | null) {
  if (!fecha) return "";
  const d = new Date(fecha);
  // `fecha` es fecha sola (sin hora): se interpreta como medianoche UTC. Forzamos
  // timeZone UTC para mostrar la fecha calendario literal y no desplazarla un día.
  return d
    .toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
    .toUpperCase();
}

// El admin guarda la hora como "HH:MM:SS"; en la tarjeta basta "HH:MM".
function formatHora(hora: string | null) {
  if (!hora) return "";
  return hora.slice(0, 5);
}

export default async function TalleresPage() {
  const talleres = await getTalleres();

  return (
    <>
      {/* Hero */}
      <HeroSection bgColor="#C4846A">
        <div className="flex-1 flex flex-col items-center justify-center text-center px-10 md:px-20 pt-[140px] md:pt-[180px] pb-16 md:pb-20">
          <span data-hero-badge className="inline-flex items-center border border-[var(--color-cremita)]/40 rounded-full px-5 py-2 mb-8">
            <span className="label text-[var(--color-cremita)]/70">
              Próximos Talleres
            </span>
          </span>
          <h1 className="font-serif italic text-[clamp(2.5rem,5.5vw,5rem)] leading-[1.05] text-[var(--color-cremita)] max-w-2xl mb-6">
            Aprende, crea y llévate un momento inolvidable
          </h1>
          <p className="font-sans text-[var(--color-cremita)]/90 text-[18px] leading-[24px] max-w-lg">
            Con nuestros talleres aprendes, son recreativos pero los maestros están preparados para enseñar con la experiencia necesaria en su rama.
          </p>
        </div>
      </HeroSection>

      {/* Taller cards */}
      <section className="w-[90%] mx-auto py-16">
        {talleres.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-serif font-extralight text-[2rem] text-[#403C3C] mb-3">Próximamente</p>
            <p className="text-[var(--color-muted)]">Estamos preparando nuevos talleres. ¡Vuelve pronto!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {talleres.map((taller) => {
              const agotado = taller.estado === "Agotado";
              return (
              <article
                key={taller.id}
                className={`flex flex-col bg-[#e7d8cf] border-2 border-[#d6bdb2] rounded-2xl p-4 transition-[transform,box-shadow] duration-300 ease-out ${
                  agotado ? "opacity-60" : "hover:-translate-y-1 hover:shadow-[4px_6px_0px_#d6bdb2]"
                }`}
              >
                {/* Image + thumbnails + lightbox */}
                <TallerGaleriaSection
                  mainImage={taller.imagen_url}
                  galeria={taller.imagenes}
                  titulo={taller.titulo}
                  instructorNombre={taller.instructor_nombre}
                  instructorInstagram={taller.instructor_instagram}
                  categoria={taller.categoria}
                  agotado={agotado}
                />

                {/* Body */}
                <div className="flex flex-col flex-1 pt-4">
                  {/* Categoría y "Agotado" viven sobre la foto (TallerGaleriaSection). */}
                  <div className="flex flex-col flex-1 items-start text-left gap-2 pb-4">
                    <div className="flex flex-col items-start gap-2 w-full border-b border-[#dbc2b3] pb-3">
                      {/* Link a la ficha del taller (/talleres/[id]): linking interno
                          crawleable hacia la página con schema Event. */}
                      {/* Alto fijo de 2 renglones (2 × 26px): así la fecha, el divisor
                          y la descripción arrancan a la misma altura en todas las
                          tarjetas del grid, tenga el título una línea o dos. */}
                      <h2 className="font-serif text-[#664917] text-[20px] leading-[26px] min-h-[52px] line-clamp-2">
                        <Link href={`/talleres/${taller.id}`} className="hover:underline underline-offset-4">
                          {taller.titulo}
                        </Link>
                      </h2>
                      <div className="flex flex-row flex-wrap items-baseline gap-x-2 gap-y-1 w-full">
                        {taller.fecha && (
                          <p className="font-sans text-[#664a18] text-[14px] leading-[20px]">
                            {formatFecha(taller.fecha)}
                          </p>
                        )}
                        {taller.fecha && taller.hora_inicio && (
                          <span aria-hidden="true" className="text-[#6e645f] text-[14px] leading-[20px]">·</span>
                        )}
                        {taller.hora_inicio && (
                          <p className="font-sans text-[#6e645f] text-[14px] leading-[20px]">
                            {formatHora(taller.hora_inicio)}{taller.hora_fin ? ` — ${formatHora(taller.hora_fin)}` : ""}
                          </p>
                        )}
                      </div>
                    </div>

                    {taller.descripcion && (
                      <TallerDescripcion
                        texto={taller.descripcion}
                        className="text-[14px] leading-[20px]"
                      />
                    )}
                  </div>

                  {/* Inversión + CTA */}
                  <div className="flex items-end justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="font-sans font-bold text-[#6e645f] text-[10px] tracking-[1px] uppercase leading-[15px]">
                        Inversión
                      </p>
                      <p className="font-serif font-extralight text-[#403c3c] text-[26px] leading-[30px]">
                        ${taller.precio.toLocaleString()}
                      </p>
                    </div>
                    {agotado ? (
                      <span
                        aria-disabled="true"
                        className="flex items-center justify-center gap-2 bg-[#9b8f86] text-[#f3e6cf] rounded-lg px-3.5 py-2.5 font-sans text-[15px] leading-[24px] cursor-not-allowed select-none"
                      >
                        Agotado
                      </span>
                    ) : (
                      <Link
                        href={`/talleres/${taller.id}/checkout`}
                        aria-label={`Apartar lugar en ${taller.titulo}`}
                        className="flex items-center justify-center gap-2 bg-[#12535c] text-[#f3e6cf] rounded-lg px-3.5 py-2.5 font-sans text-[15px] leading-[24px] hover:opacity-90 transition-opacity"
                      >
                        Apartar lugar
                        <ArrowRightIcon className="w-5 h-5" aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                </div>
              </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
