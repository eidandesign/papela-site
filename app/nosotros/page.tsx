import type { Metadata } from "next";
import Image from "next/image";
import {
  SparklesIcon,
  HeartIcon,
  StarIcon,
  PaintBrushIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";
import HeroSection from "@/components/site/HeroSection";

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: "Nosotros — La historia de Papela Atelier en Puebla" },
  description:
    "Conoce Papela Atelier: un espacio creativo en Puebla dedicado a la papelería, el arte y la expresión. Nuestra historia y el equipo detrás de cada taller.",
  alternates: { canonical: "https://www.papela-atelier.com/nosotros" },
};

const VALORES = [
  {
    icon: SparklesIcon,
    title: "Creatividad",
    body: "Nos gusta transformar ideas simples en detalles especiales.",
    bg: "#F0D9CC",
    iconColor: "#8C482A",
  },
  {
    icon: HeartIcon,
    title: "Cercanía",
    body: "Queremos atenderte con calma, amabilidad y mucha atención al detalle.",
    bg: "#C9D3C0",
    iconColor: "#2b3a2e",
  },
  {
    icon: StarIcon,
    title: "Calidad",
    body: "Cuidamos los productos, los materiales, los acabados y la forma en que entregamos cada proyecto.",
    bg: "#CED8D9",
    iconColor: "#1e2d36",
  },
  {
    icon: PaintBrushIcon,
    title: "Diseño",
    body: "Creemos que lo funcional también puede ser bonito.",
    bg: "#F0D9CC",
    iconColor: "#8C482A",
  },
  {
    icon: UserGroupIcon,
    title: "Comunidad",
    body: "Queremos construir un espacio donde las personas se sientan bienvenidas e inspiradas.",
    bg: "#C9D3C0",
    iconColor: "#2b3a2e",
  },
];

export default function NosotrosPage() {
  return (
    <>
      {/* ── Hero ── */}
      <HeroSection>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8 md:px-20 pt-[140px] md:pt-[180px] pb-16 md:pb-20">
          <span data-hero-badge className="inline-flex items-center border border-[var(--color-cremita)]/40 rounded-full px-5 py-2 mb-8">
            <span className="label text-[var(--color-cremita)]/70">
              Sobre Nosotros
            </span>
          </span>

          <h1 className="font-serif italic text-[clamp(2.5rem,5.5vw,5rem)] leading-[1.05] text-[var(--color-cremita)] max-w-3xl mb-6">
            Papela nació para hacer más bonito lo cotidiano
          </h1>

          <p className="font-sans text-[var(--color-cremita)]/90 text-[18px] leading-[24px] max-w-2xl">
            Somos una papelería creativa donde el diseño, los materiales, los regalos, las impresiones y los pequeños detalles se encuentran en un mismo lugar.
          </p>
        </div>
      </HeroSection>

      {/* ── Historia ── */}
      <section className="w-[90%] mx-auto py-20 md:py-28">
        <div className="bg-[#EAE6DC] rounded-2xl flex flex-col md:flex-row items-center gap-10 md:gap-20 px-8 md:px-16 py-14 md:py-20">
          {/* Text */}
          <div className="flex-1 flex flex-col gap-5 min-w-0">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-terracota)]">
              Nuestra historia
            </span>
            <h2 className="font-serif font-extralight text-[clamp(2rem,3.5vw,3rem)] text-[#403C3C] leading-[1.15]">
              Un espacio más cálido, más cuidado y más cercano
            </h2>
            <p className="font-sans text-[var(--color-muted)] text-[17px] leading-relaxed">
              Papela nace de la idea de crear una papelería diferente: un espacio más cálido, más cuidado y más cercano. Queríamos alejarnos de la papelería tradicional y construir un lugar donde comprar una libreta, imprimir un proyecto, envolver un regalo o encontrar materiales creativos se sintiera como una experiencia.
            </p>
            <p className="font-sans text-[var(--color-muted)] text-[17px] leading-relaxed">
              Cada rincón de Papela está pensado para inspirar, resolver y conectar con personas que disfrutan los detalles.
            </p>
          </div>
          {/* Image */}
          <div className="relative w-full md:w-[440px] h-[300px] md:h-[420px] flex-shrink-0 rounded-[20px] overflow-hidden">
            <Image
              src="/images/clases.avif"
              alt="Historia de Papela"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── Esencia ── */}
      <section className="w-[90%] mx-auto pb-20">
        <div className="flex flex-col md:flex-row gap-12 md:gap-20 items-start">
          {/* Left label */}
          <div className="md:w-[220px] flex-shrink-0 pt-1">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-terracota)]">
              Nuestra esencia
            </span>
          </div>
          {/* Right content */}
          <div className="flex-1 flex flex-col gap-6">
            <h2 className="font-serif font-extralight text-[clamp(2rem,3.5vw,3rem)] text-[#403C3C] leading-[1.15]">
              Cosas bien hechas, materiales bonitos, ideas que empiezan con una hoja en blanco.
            </h2>
            <p className="font-sans text-[var(--color-muted)] text-[17px] leading-relaxed max-w-2xl">
              Creemos en los detalles que hacen que algo simple se vuelva especial. Papela combina papelería, diseño, creatividad y atención cercana para ayudarte a darle forma a tus ideas, ya sea para la escuela, la oficina, un regalo, un proyecto personal o un momento importante.
            </p>
          </div>
        </div>
      </section>

      {/* ── Equipo + Comunidad ── */}
      <section className="w-[90%] mx-auto pb-20 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Equipo */}
        <div className="bg-[#F0D9CC] rounded-2xl p-10 md:p-12 flex flex-col gap-5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#8C482A]">El equipo</span>
          <h2 className="font-serif font-extralight text-[clamp(1.8rem,2.5vw,2.5rem)] text-[#403C3C] leading-[1.15]">
            El equipo detrás de Papela
          </h2>
          <p className="font-sans text-[var(--color-muted)] text-[16px] leading-relaxed">
            Detrás de Papela hay personas que aman crear, diseñar, resolver y cuidar los pequeños detalles. Nuestro equipo combina experiencia en diseño, atención al cliente, papelería, materiales y procesos creativos para ofrecer una experiencia más cercana y personalizada.
          </p>
          <p className="font-sans text-[var(--color-muted)] text-[16px] leading-relaxed">
            Queremos que cada persona que nos visite se sienta escuchada, bienvenida y acompañada.
          </p>
        </div>

        {/* Comunidad */}
        <div className="bg-[#C9D3C0] rounded-2xl p-10 md:p-12 flex flex-col gap-5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#2b3a2e]">Comunidad</span>
          <h2 className="font-serif font-extralight text-[clamp(1.8rem,2.5vw,2.5rem)] text-[#403C3C] leading-[1.15]">
            Un espacio para la comunidad
          </h2>
          <p className="font-sans text-[var(--color-muted)] text-[16px] leading-relaxed">
            Papela busca ser un punto de encuentro para vecinos, familias, estudiantes, emprendedores, artistas y personas creativas. Un lugar cercano donde puedas encontrar lo que necesitas, descubrir algo bonito o pedir ayuda para convertir una idea en algo real.
          </p>
          <p className="font-serif italic text-[1.2rem] text-[#2b3a2e] leading-relaxed mt-auto">
            Una papelería de barrio con alma de atelier.
          </p>
        </div>
      </section>

      {/* ── Valores ── */}
      <section className="w-[90%] mx-auto pb-20">
        <div className="flex flex-col items-center text-center mb-12 gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-terracota)]">
            Lo que nos define
          </span>
          <h2 className="font-serif font-extralight text-[clamp(2rem,3.5vw,3rem)] text-[#403C3C] leading-tight">
            Valores de Papela
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {VALORES.map((v) => (
            <div
              key={v.title}
              className="rounded-2xl p-8 flex flex-col gap-4"
              style={{ backgroundColor: v.bg }}
            >
              <div className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center flex-shrink-0">
                <v.icon className="w-5 h-5" style={{ color: v.iconColor }} />
              </div>
              <h3 className="font-serif font-extralight text-[1.5rem] text-[#403C3C]">{v.title}</h3>
              <p className="font-sans text-[var(--color-muted)] text-[15px] leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Cierre ── */}
      <section className="w-[90%] mx-auto pb-24">
        <div
          className="rounded-2xl px-8 md:px-20 py-16 md:py-20 flex flex-col items-center text-center gap-6"
          style={{ backgroundColor: "var(--color-verde)" }}
        >
          <span className="inline-flex items-center border border-[var(--color-cremita)]/30 rounded-full px-5 py-2">
            <span className="font-sans text-[10px] font-medium tracking-[0.22em] uppercase text-[var(--color-cremita)]/60">
              Visítanos
            </span>
          </span>
          <h2 className="font-serif italic text-[clamp(2rem,4vw,3.5rem)] text-[var(--color-cremita)] leading-[1.1] max-w-2xl">
            Un lugar para encontrar algo útil, bonito o inspirador
          </h2>
          <p className="font-sans text-[var(--color-cremita)]/70 text-[17px] leading-relaxed max-w-xl">
            Ya sea que vengas por una impresión, una libreta, material para un proyecto, un regalo especial o una idea que quieres hacer realidad, queremos que Papela sea ese lugar al que siempre puedas volver.
          </p>
          <a
            href="https://wa.me/522211865590"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 bg-[var(--color-cremita)] text-[var(--color-verde)] font-sans font-medium text-base px-8 py-4 rounded-full hover:opacity-90 transition-opacity"
          >
            Visítanos en Papela
          </a>
        </div>
      </section>
    </>
  );
}
