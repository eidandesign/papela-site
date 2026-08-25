import type { Metadata } from "next";
import HeroSection from "@/components/site/HeroSection";
import ScrollReveal from "@/components/site/ScrollReveal";
import AnimatedLogo from "@/components/site/AnimatedLogo";
import SeccionDopamina from "@/components/site/dopamina/SeccionDopamina";

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: "Club Creativo — Papela Atelier" },
  description:
    "El espacio creativo de Papela: juega Dopamina, gana recompensas con la Tarjeta de Lealtad y comparte lo que creas.",
  alternates: { canonical: "https://www.papela-atelier.com/club-creativo" },
  openGraph: {
    title: "Club Creativo — Papela Atelier",
    description: "Juegos, premios y muchas cosas que compartir.",
  },
};

export default function ClubCreativoPage() {
  return (
    <>
      <HeroSection>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 md:px-20 pt-[140px] md:pt-[180px] pb-16 md:pb-20">
          <span data-hero-badge className="inline-flex items-center border border-[var(--color-cremita)]/40 rounded-full px-5 py-2 mb-8">
            <span className="label text-[var(--color-cremita)]/70">Club Creativo</span>
          </span>
          <h1 className="font-serif italic text-[clamp(2.5rem,5.5vw,5rem)] leading-[1.05] text-[var(--color-cremita)] max-w-2xl mb-6">
            Un espacio para jugar, crear y coleccionar
          </h1>
          <p className="font-sans text-[var(--color-cremita)]/90 text-[18px] leading-[24px] max-w-lg">
            Juegos, premios y muchas cosas que compartir.
          </p>
        </div>
      </HeroSection>

      {/* Cards estilo App Store "Today": visual a sangre + barra inferior con
          ícono/nombre/CTA. Lado a lado en desktop, apiladas en mobile. */}
      <section className="w-[90%] mx-auto py-14 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch">
        <ScrollReveal className="h-full">
          <SeccionDopamina />
        </ScrollReveal>

        {/* Tarjeta de Lealtad */}
        <ScrollReveal className="h-full" delay={0.1}>
          <article className="relative h-full rounded-[28px] overflow-hidden flex flex-col bg-[#E0D2CA] shadow-[0_18px_44px_rgba(74,59,49,0.12)]">
            <div className="relative flex-1 min-h-[340px] md:min-h-[420px]">
              {/* Marca de agua (espacio listo para una foto real de la tarjeta) */}
              <div className="absolute inset-x-0 top-0 bottom-[28%] flex items-center justify-center">
                <div className="w-[120px] md:w-[150px] aspect-square opacity-30">
                  <AnimatedLogo color="var(--color-verde)" className="w-full h-full" />
                </div>
              </div>

              <p className="label text-[var(--color-terracota)] absolute left-6 top-5 md:left-7 md:top-6">
                Recompensas
              </p>

              <div className="absolute inset-x-0 bottom-0 px-6 md:px-7 pt-16 pb-5 md:pb-6 bg-gradient-to-t from-[#4A3B31]/15 to-transparent">
                <h2 className="font-serif text-[clamp(2rem,3vw,2.6rem)] leading-none text-[#4A3B31] mb-2">
                  Tarjeta de Lealtad
                </h2>
                <p className="font-sans text-[14px] leading-[20px] text-[#403C3C]/85 max-w-sm">
                  Tu tarjeta digital: beneficios, premios y coleccionables por rascar.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 px-5 py-4 bg-[#CDB9AC]">
              <span aria-hidden="true" className="shrink-0 w-11 h-11 rounded-[12px] bg-white/55 flex items-center justify-center">
                <AnimatedLogo color="var(--color-verde)" className="w-7 h-7" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-sans text-[14px] font-semibold text-[#4A3B31] leading-tight">Tarjeta de Lealtad</p>
                <p className="font-sans text-[12px] text-[#4A3B31]/70">Se pide en Papela</p>
              </div>
              <a
                href={`https://wa.me/522211865590?text=${encodeURIComponent("Hola Papela 🌿 quiero mi Tarjeta de Lealtad del Club Creativo")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center rounded-full bg-[var(--color-verde)] text-[var(--color-cremita)] font-sans text-[13px] font-semibold px-5 py-2 hover:opacity-90 transition-opacity"
              >
                Pedir la mía
              </a>
            </div>
          </article>
        </ScrollReveal>
      </section>
    </>
  );
}
