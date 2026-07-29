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

      {/* Dopamina — el juego creativo (card + modal ¿Cómo se juega?) */}
      <ScrollReveal>
        <SeccionDopamina />
      </ScrollReveal>

      {/* Tarjeta de Lealtad */}
      <section className="w-[90%] mx-auto py-14 md:py-20">
        <ScrollReveal>
          <article className="rounded-[28px] bg-[#E0D2CA] p-7 md:p-14 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="max-w-md">
              <p className="label text-[var(--color-terracota)] mb-4">Recompensas</p>
              <h2 className="font-serif text-[clamp(2rem,4vw,2.8rem)] leading-tight text-[#4A3B31] mb-5">
                Tarjeta de Lealtad
              </h2>
              <p className="font-sans text-[15px] leading-[23px] text-[#403C3C]/85">
                ¿Aún no cuentas con tu tarjeta digital? Pídela en Papela y empieza a obtener muchos
                beneficios y premios.
              </p>
            </div>

            {/* Ejemplo de la tarjeta (espacio listo para una foto real) */}
            <div className="relative rounded-[20px] bg-[var(--color-cremita-3)] min-h-[300px] md:min-h-[430px] flex items-center justify-center">
              <div className="w-[120px] md:w-[150px] aspect-square opacity-40">
                <AnimatedLogo color="var(--color-verde)" className="w-full h-full" />
              </div>
            </div>
          </article>
        </ScrollReveal>
      </section>
    </>
  );
}
