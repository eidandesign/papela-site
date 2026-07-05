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
import ScrollReveal from "@/components/site/ScrollReveal";

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: "Nosotros — La historia de Papela Atelier en Puebla" },
  description:
    "Conoce Papela Atelier: un espacio creativo en Puebla dedicado a la papelería, el arte y la expresión. Nuestra historia y el equipo detrás de cada taller.",
  alternates: { canonical: "https://www.papela-atelier.com/nosotros" },
};

const HISTORIA_FOTOS = [
  { src: "/images/nosotros/historia-1.jpg", alt: "Inicio de la construcción de Papela" },
  { src: "/images/nosotros/historia-2.jpg", alt: "Obra de Papela en proceso" },
  { src: "/images/nosotros/historia-3.jpg", alt: "Fachada de Papela Atelier" },
  { src: "/images/nosotros/historia-4.jpg", alt: "Mural de Papela Atelier" },
  { src: "/images/nosotros/historia-5.jpg", alt: "Detalle de la entrada de Papela" },
  { src: "/images/nosotros/historia-6.jpg", alt: "El equipo afuera de Papela" },
];

const EQUIPO = [
  {
    nombre: "Adán",
    foto: "/images/nosotros/equipo-adan.jpg",
    parrafos: [
      "Creativo, meticuloso y siempre dispuesto a ayudar, lo verás a menudo en movimiento, ya que se preocupa por que todo salga casi perfecto.",
      "Con más de 20 años de experiencia como director creativo, diseñador y product designer, ha trabajado para reconocidas marcas como Palacio de Hierro, NASA (sí, la de las naves), Mattel y Microsoft, entre muchas otras a nivel mundial.",
    ],
  },
  {
    nombre: "Valeria",
    foto: "/images/nosotros/equipo-valeria.jpg",
    parrafos: [
      "Vale es la experta en talleres y clases, siempre al tanto de lo que mejor se adapta a tus necesidades. Con su ayuda, podrás ajustar tu proyecto a tu tiempo y presupuesto, convirtiendo tus ideas en realidad.",
      "Además, su creatividad desbordante garantiza que tu proyecto no solo se realice, sino que también brille con originalidad.",
    ],
  },
  {
    nombre: "Gabi",
    foto: "/images/nosotros/equipo-gabi.jpg",
    parrafos: [
      "Aquella que transforma ideas en cajas, flores o cualquier otra maravilla con su ingenio y creatividad.",
      "Siempre está lista para ofrecer soluciones ingeniosas, creando manualidades y obras sorprendentes que reflejan su talento excepcional.",
    ],
  },
];

const VALORES = [
  {
    icon: SparklesIcon,
    title: "Creatividad",
    body: "Nos gusta transformar ideas simples en detalles especiales.",
    bg: "#F0D9CC",
  },
  {
    icon: HeartIcon,
    title: "Cercanía",
    body: "Queremos atenderte con calma, amabilidad y mucha atención.",
    bg: "#DFE7D8",
  },
  {
    icon: StarIcon,
    title: "Calidad",
    body: "Cuidamos los productos, los materiales, los acabados.",
    bg: "#DFE9EA",
  },
  {
    icon: PaintBrushIcon,
    title: "Diseño",
    body: "Creemos que lo funcional también puede ser bonito.",
    bg: "#F0E9CC",
  },
  {
    icon: UserGroupIcon,
    title: "Comunidad",
    body: "Queremos construir un espacio donde las personas se sientan bienvenidas.",
    bg: "#C9D3C0",
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
            Somos una papelería creativa donde el diseño, los materiales, los regalos, las impresiones, la personalización, el arte, la creatividad, el aprendizaje y los pequeños detalles se encuentran en un mismo lugar.
          </p>
        </div>
      </HeroSection>

      {/* ── Historia: texto + grid de fotos ── */}
      <section className="w-[90%] mx-auto py-16 md:py-24">
        <ScrollReveal>
          <div className="bg-[#E8E7E4] rounded-2xl px-8 md:px-16 py-12 md:py-20 flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
            {/* Text */}
            <div className="flex-1 flex flex-col gap-5 min-w-0">
              <h2 className="font-serif font-extralight text-[clamp(2rem,3.2vw,3rem)] text-[#403C3C] leading-[1.15]">
                El comienzo de algo hecho con mucho cariño.
              </h2>
              <p className="font-sans text-[var(--color-muted)] text-[17px] leading-relaxed">
                Papela nace de la idea de crear una papelería diferente: un espacio más cálido, más cuidado y más cercano. Queríamos alejarnos de la papelería tradicional y construir un lugar donde comprar una libreta, imprimir un proyecto, envolver un regalo o encontrar materiales creativos se sintiera como una experiencia.
              </p>
              <p className="font-sans text-[var(--color-muted)] text-[17px] leading-relaxed">
                Cada rincón de Papela está pensado para inspirar, resolver y conectar con personas que disfrutan los detalles, que reconocen el esfuerzo humano en la creación de obras, ilustraciones y aquello que está pensado con creatividad.
              </p>
              <p className="font-sans text-[var(--color-muted)] text-[17px] leading-relaxed">
                La imagen muestra el inicio de nuestro boceto para poder crear Papela.
              </p>
            </div>
            {/* Photo grid 3×2 */}
            <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
              {HISTORIA_FOTOS.map((foto) => (
                <div key={foto.src} className="relative aspect-square rounded-xl md:rounded-2xl overflow-hidden">
                  <Image
                    src={foto.src}
                    alt={foto.alt}
                    fill
                    sizes="(min-width: 1024px) 15vw, (min-width: 640px) 30vw, 45vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ── Quote con línea de tinta ── */}
      <section className="relative py-14 md:py-24 overflow-hidden">
        {/* Línea decorativa (boceto de tinta) cruzando la sección */}
        <Image
          src="/images/nosotros/linea.svg"
          alt=""
          aria-hidden="true"
          width={2304}
          height={442}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[160vw] max-w-none pointer-events-none select-none"
        />
        <ScrollReveal className="relative w-[90%] max-w-3xl mx-auto flex flex-col items-center text-center gap-6">
          <h2 className="font-serif font-extralight text-[clamp(1.8rem,3.2vw,3rem)] text-[#403C3C] leading-[1.15]">
            Cosas bien hechas, materiales bonitos, ideas que empiezan con una hoja en blanco.
          </h2>
          <p className="font-sans text-[var(--color-muted)] text-[17px] leading-relaxed max-w-xl">
            Creemos en los detalles que hacen que algo simple se vuelva especial. Papela combina papelería, diseño, creatividad y atención cercana para ayudarte a darle forma a tus ideas, ya sea para la escuela, tu empresa, un regalo, un proyecto personal o un momento importante.
          </p>
        </ScrollReveal>
      </section>

      {/* ── Nuestro objetivo + La comunidad ── */}
      <section className="w-[90%] mx-auto py-14 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          {
            titulo: "Nuestro objetivo",
            foto: "/images/nosotros/objetivo.jpg",
            fotoAlt: "El equipo de Papela trabajando en el atelier",
            body: "Detrás de Papela hay personas que aman crear, diseñar, resolver y cuidar los pequeños detalles. Nuestro equipo combina experiencia en diseño, queremos que cada persona que nos visite se sienta escuchada, bienvenida y acompañada.",
            tagline: "Un equipo de creativos para ti.",
          },
          {
            titulo: "La comunidad",
            foto: "/images/nosotros/comunidad.jpg",
            fotoAlt: "Personas de la comunidad reunidas en Papela",
            body: "Papela busca ser un punto de encuentro para vecinos, familias, estudiantes, emprendedores, artistas y personas creativas. Un lugar cercano donde puedas encontrar lo que necesitas, descubrir algo bonito o pedir ayuda para convertir una idea en algo real.",
            tagline: "Una papelería de barrio con alma de atelier.",
          },
        ].map((card, i) => (
          <ScrollReveal key={card.titulo} delay={i * 0.1}>
            <div className="bg-[#EBEBEB] rounded-2xl p-8 md:p-12 flex flex-col sm:flex-row gap-6 md:gap-10 items-start sm:items-stretch h-full">
              <div className="relative w-full sm:w-[180px] aspect-[199/283] sm:aspect-auto sm:self-stretch flex-shrink-0 rounded-2xl overflow-hidden min-h-[220px]">
                <Image
                  src={card.foto}
                  alt={card.fotoAlt}
                  fill
                  sizes="(min-width: 640px) 180px, 90vw"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 flex flex-col gap-4">
                <h2 className="font-serif font-extralight text-[clamp(1.7rem,2.5vw,2.4rem)] text-[#403C3C] leading-[1.15]">
                  {card.titulo}
                </h2>
                <p className="font-sans text-[var(--color-muted)] text-[15px] leading-relaxed">
                  {card.body}
                </p>
                <p className="font-serif italic text-[1.2rem] text-[#2b3a2e] leading-relaxed mt-auto">
                  {card.tagline}
                </p>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </section>

      {/* ── El Equipo ── */}
      <section className="w-[90%] mx-auto py-14 md:py-20">
        <ScrollReveal className="text-center mb-10 md:mb-14">
          <h2 className="font-serif font-extralight text-[clamp(2rem,3.2vw,3rem)] text-[#403C3C]">
            El Equipo
          </h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {EQUIPO.map((persona, i) => (
            <ScrollReveal key={persona.nombre} delay={i * 0.1}>
              <div className="bg-[#EDE3DA] rounded-2xl p-6 md:p-8 flex flex-col gap-5 h-full">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden">
                  <Image
                    src={persona.foto}
                    alt={`Retrato de ${persona.nombre}`}
                    fill
                    sizes="(min-width: 768px) 30vw, 90vw"
                    className="object-cover"
                  />
                </div>
                <h3 className="font-serif font-extralight italic text-[clamp(1.7rem,2.5vw,2.4rem)] text-[#403C3C] text-center">
                  {persona.nombre}
                </h3>
                <div className="flex flex-col gap-4">
                  {persona.parrafos.map((p) => (
                    <p key={p.slice(0, 24)} className="font-sans text-[var(--color-muted)] text-[16px] leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── Nuestros Valores ── */}
      <section className="w-[90%] mx-auto py-14 md:py-20">
        <ScrollReveal className="text-center mb-10 md:mb-14">
          <h2 className="font-serif font-extralight text-[clamp(2rem,3.2vw,3rem)] text-[#403C3C]">
            Nuestros Valores
          </h2>
        </ScrollReveal>
        {/* 3 + 2 centrado en desktop */}
        <div className="flex flex-wrap justify-center gap-5">
          {VALORES.map((v, i) => (
            <ScrollReveal
              key={v.title}
              delay={i * 0.06}
              className="w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]"
            >
              <div className="rounded-2xl p-8 flex flex-col gap-3 h-full" style={{ backgroundColor: v.bg }}>
                <v.icon className="w-5 h-5 text-[#403C3C]" />
                <h3 className="font-serif font-extralight italic text-[1.5rem] text-[var(--color-muted)]">
                  {v.title}
                </h3>
                <p className="font-sans text-[var(--color-muted)] text-[15px] leading-relaxed">{v.body}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── Cierre / Visítanos ── */}
      <section className="w-[90%] mx-auto py-10 pb-24">
        <div
          className="rounded-2xl px-8 md:px-20 py-16 md:py-20 flex flex-col items-center text-center gap-6"
          style={{ backgroundColor: "var(--color-verde)" }}
        >
          <span className="inline-flex items-center border border-[var(--color-cremita)]/30 rounded-full px-5 py-2">
            <span className="label text-[var(--color-cremita)]/60">
              Visítanos
            </span>
          </span>
          <h2 className="font-serif italic text-[clamp(2rem,4vw,3.5rem)] text-[var(--color-cremita)] leading-[1.1] max-w-2xl">
            Un lugar para encontrar algo útil, bonito o inspirador
          </h2>
          <p className="font-sans text-[var(--color-cremita)]/70 text-[17px] leading-relaxed max-w-xl">
            Ya sea que vengas por una impresión, una libreta, material para un proyecto, un regalo especial o una idea que quieres hacer realidad, queremos que Papela sea ese lugar al que siempre quieras volver.
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
