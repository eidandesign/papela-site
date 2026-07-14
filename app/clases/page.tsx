import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPinIcon } from "@heroicons/react/24/solid";
import { getClasesConHorarios } from "@/lib/clases";
import { getPublico } from "@/lib/clases-actividades";
import { getTiposClase } from "@/lib/clases-tipos";
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
  const [maestras, tiposClase] = await Promise.all([
    getClasesConHorarios(),
    getTiposClase(),
  ]);

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
          <div className="flex flex-col gap-5 md:gap-6">
            {maestras.map((maestra) => {
              const publico = getPublico(maestra.slug);
              const tipos = tiposClase.filter((t) => t.claseId === maestra.id);
              return (
                <article
                  key={maestra.id}
                  className="w-full bg-[#e7d8cf] border-2 border-[#d6bdb2] rounded-2xl p-5 md:p-8 flex flex-col md:flex-row items-center gap-5 md:gap-10"
                >
                  {/* Foto + badge de edad */}
                  <div className="relative w-full md:w-[370px] flex-shrink-0 aspect-[4/3] rounded-xl overflow-hidden border-2 border-[#d6bdb2]">
                    {maestra.foto ? (
                      <Image
                        src={maestra.foto}
                        alt={maestra.nombre}
                        fill
                        sizes="(max-width: 768px) 90vw, 370px"
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

                  {/* Nombre + técnicas + descripción + CTAs */}
                  <div className="flex flex-col gap-3 flex-1 min-w-0">
                    <h3 className="font-serif italic text-[#664917] text-[clamp(1.6rem,2.5vw,2rem)] leading-tight">
                      {maestra.nombre}
                    </h3>
                    {maestra.tecnicas?.length > 0 && (
                      <p className="font-sans text-[var(--color-muted)] text-sm leading-snug">
                        {maestra.tecnicas.join(" · ")}
                      </p>
                    )}
                    {maestra.descripcion && (
                      <p className="font-sans text-[var(--color-text)] text-base leading-relaxed">
                        {maestra.descripcion}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2.5 mt-1">
                      <Link
                        href={`/clases/${maestra.slug}`}
                        className="inline-flex items-center justify-center rounded-full border border-[var(--color-verde)] px-5 py-2.5 font-sans text-sm font-semibold text-[var(--color-verde)] hover:bg-[var(--color-verde)] hover:text-[var(--color-cremita)] transition-colors"
                      >
                        Ver más detalles
                      </Link>
                      <ReservaButton
                        horarios={maestra.horarios}
                        claseNombre={maestra.nombre}
                        whatsapp={maestra.whatsapp}
                        tipos={tipos}
                        label="Reservar Clase"
                        size="sm"
                        showArrow={false}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Club de Arcilla banner ── */}
      <section className="w-[90%] mx-auto pb-12 md:pb-16">
        <div className="relative rounded-[32px] md:rounded-[48px] overflow-hidden">
          <Image
            src="/images/fondo_arcilla_banner.jpg"
            alt=""
            fill
            className="object-cover"
            sizes="90vw"
          />

          <Image
            src="/images/linea_rosa_club.png"
            alt=""
            width={3078}
            height={729}
            aria-hidden="true"
            className="absolute inset-x-0 top-10 md:top-1/2 md:-translate-y-1/2 w-full h-auto pointer-events-none"
          />

          <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-10 px-8 md:px-14 py-14 md:py-6">
            {/* Texto */}
            <div className="flex-1 flex flex-col items-center text-center gap-3">
              <Image
                src="/images/club_arcilla_nombre.png"
                alt="Club de Arcilla"
                width={457}
                height={204}
                className="w-[220px] md:w-[300px] h-auto"
              />
              <p className="font-serif text-[var(--color-cremita)] text-lg md:text-xl">
                Todos los Jueves de 5:00 a 7:00 pm
              </p>
              <p className="flex items-center gap-1.5 font-sans text-[var(--color-cremita)]/80 text-sm">
                <MapPinIcon aria-hidden="true" className="w-4 h-4 flex-shrink-0" />
                Lomas de Angelópolis – Papela Atelier
              </p>
              <a
                href={`https://wa.me/522211865590?text=${encodeURIComponent("Hola Papela 🌿 quiero unirme al Club de Arcilla")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-verde)] px-6 py-2.5 font-sans text-sm font-semibold text-[var(--color-cremita)] hover:opacity-90 transition-opacity"
              >
                ¡Quiero Unirme!
              </a>
            </div>

            {/* Foto */}
            <div className="relative w-full md:w-[58%] aspect-[1508/750] flex-shrink-0">
              <Image
                src="/images/clases_club_arcilla.png"
                alt="Sesión del Club de Arcilla en Papela Atelier"
                fill
                className="object-contain"
                sizes="(min-width: 768px) 58vw, 90vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Intro ── */}
      <section className="w-[90%] mx-auto py-12 md:py-16 flex flex-col items-center gap-8 md:gap-10">
        <div className="relative w-full max-w-[340px] aspect-square rounded-[20px] overflow-hidden">
          <Image
            src="/images/clases.avif"
            alt="Clase en Papela Atelier"
            fill
            sizes="340px"
            className="object-cover"
          />
        </div>
        <h2 className="font-serif font-extralight text-[clamp(2rem,3.5vw,3rem)] text-black leading-[1.17] text-center max-w-[620px]">
          A veces solo hace falta una mesa, tus manos y alguien que te guíe.
        </h2>
      </section>
    </>
  );
}
