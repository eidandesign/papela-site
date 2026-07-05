import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import TextCarousel from "@/components/site/TextCarousel";
import ScrollReveal from "@/components/site/ScrollReveal";
import HeroExperience from "@/components/site/HeroExperience";
import ProductCarousel from "@/components/site/ProductCarousel";
import TalleresGallery from "@/components/site/TalleresGallery";
import { getProductosPorColeccion } from "@/lib/productos-publicos";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Papela Atelier — Papelería, talleres y clases de arte en Puebla",
  description:
    "Papelería creativa en Puebla: libretas artesanales, talleres de acuarela, acrílico, cerámica y clases de arte. Un espacio para crear y expresarte.",
  alternates: { canonical: "https://www.papela-atelier.com" },
};

const INFO_CARDS = [
  {
    slug: "talleres",
    title: "Talleres",
    body: "Experiencias creativas con invitadxs cada mes.",
    href: "/talleres",
    bg: "#F0D9CC",
    text: "#3a2e2b",
    image: "/images/talleres.avif",
  },
  {
    slug: "clases",
    title: "Clases",
    body: "Aprende técnicas nuevas y crea a tu ritmo.",
    href: "/clases",
    bg: "#C9D3C0",
    text: "#2b3a2e",
    image: "/images/clases.avif",
  },
  {
    slug: "personaliza",
    title: "Personaliza",
    body: "Stickers, toppers y detalles hechos a la medida.",
    href: "/personaliza",
    bg: "#CED8D9",
    text: "#1e2d36",
    image: "/images/personaliza.avif",
  },
];


// ─── Subcomponents ─────────────────────────────────────────────────────────────


// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [libretas, favoritos] = await Promise.all([
    getProductosPorColeccion("libretas"),
    getProductosPorColeccion("favoritos"),
  ]);

  return (
    <>
      {/* ── Hero — animated headline + pen ink-line cursor ──────────────────── */}
      <HeroExperience />

      {/* ── Marquee ───────────────────────────────────────────────────────── */}
      <TextCarousel />

      {/* ── Info Cards ────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20">
        {/* Mobile: horizontal scroll */}
        <div className="md:hidden flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none" style={{ scrollbarWidth: "none", scrollPaddingLeft: "20px" }}>
          <div className="flex-shrink-0 w-5" aria-hidden="true" />
          {INFO_CARDS.map((card) => (
            <Link
              key={card.slug}
              href={card.href}
              className="group snap-start flex-shrink-0 rounded-2xl overflow-hidden flex flex-col"
              style={{ backgroundColor: card.bg, color: card.text, width: "72vw", minWidth: "260px" }}
            >
              {/* Image top */}
              <div className="relative w-full" style={{ height: "200px" }}>
                <Image src={card.image} alt={card.title} fill sizes="72vw" className="object-cover" />
              </div>
              {/* Text bottom */}
              <div className="flex flex-col justify-between p-6 flex-1">
                <div>
                  <h3 className="font-serif italic text-[1.8rem] mb-2 leading-tight">{card.title}</h3>
                  <p className="text-[15px] leading-relaxed opacity-80">{card.body}</p>
                </div>
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-verde)] mt-6 group-hover:opacity-80 transition-opacity">
                  <ArrowRightIcon className="w-4 h-4 text-[var(--color-cremita)]" />
                </span>
              </div>
            </Link>
          ))}
          <div className="flex-shrink-0 w-5" aria-hidden="true" />
        </div>
        {/* Desktop: grid */}
        <div className="hidden md:grid w-[90%] mx-auto grid-cols-3 gap-4">
          {INFO_CARDS.map((card, i) => (
            <ScrollReveal key={card.slug} delay={i * 0.1} amount={0.15}>
              <Link
                href={card.href}
                className="group relative rounded-2xl overflow-hidden flex flex-row hover:scale-[1.01] transition-transform duration-300 h-[320px]"
                style={{ backgroundColor: card.bg, color: card.text }}
              >
                <div className="flex flex-col justify-between p-8 flex-1 min-w-0">
                  <div>
                    <h3 className="font-serif italic text-[2rem] mb-4 leading-tight">{card.title}</h3>
                    <p className="text-[16px] md:text-[18px] leading-relaxed opacity-80">{card.body}</p>
                  </div>
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-verde)] mt-8 group-hover:opacity-80 transition-opacity">
                    <ArrowRightIcon className="w-4 h-4 text-[var(--color-cremita)]" />
                  </span>
                </div>
                <div className="w-[52%] flex-shrink-0 p-3 pl-0 h-full">
                  <div className="relative w-full h-full rounded-xl overflow-hidden">
                    <Image src={card.image} alt={card.title} fill sizes="16vw" className="object-cover" />
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── Nosotros ──────────────────────────────────────────────────────── */}
      <section className="w-[90%] mx-auto py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-12 items-end">
          <ScrollReveal delay={0}>
            <div>
              <h2 className="font-serif font-extralight text-[clamp(2.5rem,5vw,4rem)] text-[#403C3C] leading-tight mb-6">
                Nosotros
              </h2>
              <p className="text-[var(--color-muted)] leading-relaxed text-base mb-8 max-w-md">
                Creamos un espacio cálido, bonito y creativo en Puebla donde
                encuentras desde lo básico que necesitas hasta detalles que
                inspiran. Nos encanta atenderte con cercanía, ayudarte a resolver
                y hacer que cada visita se sienta especial.
              </p>
              <Link
                href="/nosotros"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-verde)] border border-[var(--color-verde)] rounded-full px-5 py-2.5 overflow-hidden relative hover:text-[var(--color-cremita)] transition-colors duration-500"
                style={{ isolation: "isolate" }}
              >
                <span className="absolute inset-0 bg-[var(--color-verde)] -z-10 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]" />
                Conoce nuestra historia
                <ArrowRightIcon className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
              <video
                src="https://res.cloudinary.com/duxnks729/video/upload/v1778470212/magnific_stop-motions-aniamtion-th_2846395737_tmswe7.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Libretas ──────────────────────────────────────────────────────── */}
      {libretas.length > 0 && (
        <section className="py-12 md:py-16">
          <ScrollReveal className="w-[90%] mx-auto mb-6 flex items-end justify-between">
            <h2 className="font-serif font-extralight text-[clamp(1.8rem,3.5vw,2.8rem)] text-[#403C3C]">
              Libretas
            </h2>
            <Link
              href="/productos?categoria=libretas"
              className="text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-verde)] transition-colors"
            >
              Ver todo →
            </Link>
          </ScrollReveal>
          <ProductCarousel productos={libretas} />
        </section>
      )}

      {/* ── Más de 100 personas (galería animada) ─────────────────────────── */}
      <TalleresGallery cta={{ label: "Ver talleres", href: "/talleres" }} />

      {/* ── Los Favoritos ─────────────────────────────────────────────────── */}
      {favoritos.length > 0 && (
        <section className="py-8 md:py-12 bg-[var(--color-cremita)]/40">
          <ScrollReveal className="w-[90%] mx-auto mb-6 flex items-end justify-between">
            <h2 className="font-serif font-extralight text-[clamp(1.8rem,3.5vw,2.8rem)] text-[#403C3C]">
              Los favoritos
            </h2>
            <Link
              href="/productos"
              className="text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-verde)] transition-colors"
            >
              Ver todo →
            </Link>
          </ScrollReveal>
          <ProductCarousel productos={favoritos} />
        </section>
      )}

      {/* ── Instagram ─────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <ScrollReveal className="text-center mb-10 w-[90%] mx-auto px-5 md:px-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-terracota)] mb-3">
            Redes Sociales
          </p>
          <h2 className="font-serif font-extralight text-[clamp(1.8rem,3.5vw,2.8rem)] text-[#403C3C] mb-2">
            Únete a nuestra comunidad
          </h2>
          <p className="text-[var(--color-muted)] text-sm mb-5">
            Síguenos en Instagram
          </p>
          <a
            href="https://instagram.com/papela.atelier"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-verde)] border border-[var(--color-verde)] rounded-full px-5 py-2.5 hover:bg-[var(--color-verde)] hover:text-[var(--color-cremita)] transition-colors"
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            @papela.atelier
          </a>
        </ScrollReveal>

        {/* Mobile: horizontal scroll */}
        <div
          className="md:hidden flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", scrollPaddingLeft: "20px" }}
        >
          <div className="flex-shrink-0 w-5" aria-hidden="true" />
          {["/images/instagram-1.jpg", "/images/Instagram-2.jpg", "/images/Instagram-3.jpg"].map((src, i) => (
            <a
              key={i}
              href="https://instagram.com/papela.atelier"
              target="_blank"
              rel="noopener noreferrer"
              className="group snap-start flex-shrink-0 rounded-xl overflow-hidden bg-[var(--color-cremita-2)]"
              style={{ width: "72vw" }}
            >
              <Image
                src={src}
                alt="Post de Instagram de Papela Atelier"
                width={0}
                height={0}
                sizes="72vw"
                className="w-full h-auto group-hover:scale-105 transition-transform duration-500"
              />
            </a>
          ))}
          <div className="flex-shrink-0 w-5" aria-hidden="true" />
        </div>

        {/* Desktop: grid */}
        <div className="hidden md:grid grid-cols-3 gap-4 w-[90%] mx-auto">
          {["/images/instagram-1.jpg", "/images/Instagram-2.jpg", "/images/Instagram-3.jpg"].map((src, i) => (
            <a
              key={i}
              href="https://instagram.com/papela.atelier"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-xl overflow-hidden bg-[var(--color-cremita-2)]"
            >
              <Image
                src={src}
                alt="Post de Instagram de Papela Atelier"
                width={0}
                height={0}
                sizes="30vw"
                className="w-full h-auto group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
            </a>
          ))}
        </div>

        <div className="text-center mt-6">
          <a
            href="https://instagram.com/papela.atelier"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--color-muted)] hover:text-[var(--color-verde)] transition-colors"
          >
            Ver más en Instagram →
          </a>
        </div>
      </section>
    </>
  );
}
