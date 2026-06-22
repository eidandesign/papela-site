import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getClasesConHorarios } from "@/lib/clases";
import { getActividades, getPublico } from "@/lib/clases-actividades";
import HeroSection from "@/components/site/HeroSection";
import ReservaButton from "@/components/site/ReservaButton";

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: "Clases de arte en Puebla — Papela Atelier" },
  description:
    "Clases regulares de pintura, acuarela y acrílico en Puebla con maestras especializadas. Para principiantes y niveles avanzados. Aprende a tu ritmo.",
  alternates: { canonical: "https://www.papela-atelier.com/clases" },
  openGraph: {
    title: "Clases de arte en Puebla — Papela Atelier",
    description:
      "Clases regulares de pintura y técnicas artísticas para todos los niveles en Puebla.",
    images: [{ url: "/images/clases.avif", alt: "Clases de arte Papela Atelier Puebla" }],
  },
};

export default async function ClasesPage() {
  const maestras = await getClasesConHorarios();

  return (
    <>
      {/* ── Hero ── */}
      <HeroSection bgColor="#4F8674">
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8 md:px-16 pt-[140px] md:pt-[180px] pb-16 md:pb-20">
          <span data-hero-badge className="inline-flex items-center border border-[var(--color-cremita)]/60 rounded-full px-6 py-2 mb-8">
            <span className="label text-[var(--color-cremita)]">
              Clases Creativas
            </span>
          </span>

          <h1 className="font-serif italic text-[clamp(2.8rem,6.5vw,5.5rem)] leading-[1.05] text-[var(--color-cremita)] max-w-4xl mb-8">
            Clases creativas para volver a conectar con tus manos
          </h1>

          <p className="font-sans text-[var(--color-cremita)]/90 text-[18px] leading-[24px] max-w-2xl">
            Pinta, dibuja, modela y crea en un espacio pensado para aprender con calma, explorar materiales y disfrutar el proceso. En Papela tenemos clases para niños, jóvenes y adultos, con maestras que acompañan cada proyecto paso a paso.
          </p>
        </div>
      </HeroSection>

      {/* ── Maestras grid ── */}
      <section className="w-[90%] mx-auto pt-12 md:pt-16 pb-12 md:pb-16">
        {/* Section heading */}
        <h2 className="font-serif font-extralight text-[clamp(1.8rem,3.5vw,3rem)] text-black leading-tight text-center mb-8 md:mb-10">
          Tus próximas guías
        </h2>

        {/* Cards */}
        {maestras.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-serif font-extralight text-[2rem] text-[#403C3C] mb-3">Próximamente</p>
            <p className="text-[var(--color-muted)]">Estamos preparando nuevas clases. ¡Vuelve pronto!</p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-5 md:gap-6">
            {maestras.map((maestra) => {
              const publico = getPublico(maestra.slug);
              const actividades = getActividades(maestra.slug).map((a) => a.titulo);
              return (
                <article
                  key={maestra.id}
                  className="w-full sm:w-[340px] lg:w-[360px] bg-[#e7d8cf] border-2 border-[#d6bdb2] rounded-2xl p-4 md:p-5 flex flex-col gap-4 transition-[transform,box-shadow] duration-300 ease-out hover:shadow-[4px_6px_0px_#d6bdb2] hover:-translate-y-1"
                >
                  {/* Foto + badge de edad */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-[#d6bdb2]">
                    {maestra.foto ? (
                      <Image
                        src={maestra.foto}
                        alt={maestra.nombre}
                        fill
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 400px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-cremita)] to-[#c9d3c0]" />
                    )}
                    {publico && (
                      <span className="absolute bottom-3 left-3 bg-[#f9eae3] text-[var(--color-terracota)] text-[10px] font-semibold uppercase tracking-[0.16em] px-3 py-1.5 rounded-full">
                        {publico}
                      </span>
                    )}
                  </div>

                  {/* Nombre + técnicas */}
                  <div className="flex flex-col gap-1 px-1 flex-1">
                    <h3 className="font-serif italic text-[#664917] text-[clamp(1.5rem,2vw,1.75rem)] leading-tight">
                      {maestra.nombre}
                    </h3>
                    {maestra.tecnicas?.length > 0 && (
                      <p className="font-sans text-[var(--color-muted)] text-sm leading-snug">
                        {maestra.tecnicas.join(" · ")}
                      </p>
                    )}
                  </div>

                  {/* CTAs */}
                  <div className="flex items-center gap-2.5">
                    <Link
                      href={`/clases/${maestra.slug}`}
                      className="flex-shrink-0 inline-flex items-center justify-center rounded-full border border-[var(--color-verde)] px-5 py-2.5 font-sans text-sm font-semibold text-[var(--color-verde)] hover:bg-[var(--color-verde)] hover:text-[var(--color-cremita)] transition-colors"
                    >
                      Ver detalles
                    </Link>
                    <ReservaButton
                      horarios={maestra.horarios}
                      claseNombre={maestra.nombre}
                      whatsapp={maestra.whatsapp}
                      actividades={actividades}
                      label="Reservar Clase"
                      size="sm"
                      showArrow={false}
                      className="flex-1"
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Intro card ── */}
      <section className="w-[90%] mx-auto py-12 md:py-16">
        <div className="bg-[#EAE6DC] rounded-2xl flex flex-col md:flex-row items-center gap-10 md:gap-[148px] px-8 md:px-20 py-14 md:py-[72px]">
          {/* Text */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            <h2 className="font-serif font-extralight text-[clamp(2rem,3.5vw,3rem)] text-black leading-[1.17]">
              A veces solo hace falta una mesa, buenos materiales y alguien que te guíe.
            </h2>
            <p className="font-sans text-[var(--color-text)] text-[clamp(1rem,1.3vw,1.5rem)] leading-[1.35]">
              Nuestras clases están pensadas para que cada persona avance a su ritmo: desde quien quiere aprender una técnica desde cero, hasta quien busca un momento creativo para desconectarse, practicar y crear algo propio.
            </p>
          </div>
          {/* Image */}
          <div className="relative w-full md:w-[486px] h-[320px] md:h-[440px] flex-shrink-0 rounded-[20px] overflow-hidden">
            <Image
              src="/images/clases.avif"
              alt="Clase en Papela Atelier"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>
    </>
  );
}
