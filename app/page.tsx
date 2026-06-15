import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import TextCarousel from "@/components/site/TextCarousel";
import { getProductos } from "@/lib/productos";

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
    href: "/productos",
    bg: "#CED8D9",
    text: "#1e2d36",
    image: "/images/personaliza.avif",
  },
];


const IG_POSTS = [
  { id: 1, likes: 17, caption: "psic.fatimamtz" },
  { id: 2, likes: 9,  caption: "Puebla City" },
  { id: 3, likes: 8,  caption: "papela.atelier" },
];

// ─── Subcomponents ─────────────────────────────────────────────────────────────

function ProductCard({ id, nombre, precio, imagen_url }: { id: string; nombre: string; precio: number; imagen_url: string | null }) {
  return (
    <Link href={`/productos/${id}`} className="group flex-shrink-0 w-[220px] md:w-[240px]">
      <div className="w-full aspect-[3/4] rounded-2xl bg-[var(--color-cremita-2)] mb-3 overflow-hidden relative">
        {imagen_url ? (
          <Image src={imagen_url} alt={nombre} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--color-cremita)] to-[var(--color-cremita-2)] group-hover:scale-105 transition-transform duration-500" />
        )}
      </div>
      <p className="text-sm font-medium text-[var(--color-text)] leading-tight">{nombre}</p>
      <p className="text-sm text-[var(--color-muted)] mt-0.5">${precio.toLocaleString()} MXN</p>
    </Link>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [libretas, favoritos] = await Promise.all([
    getProductos("Papelería"),
    getProductos(undefined, 12),
  ]);

  return (
    <>
      {/* ── Hero card — matches Figma 1392×855 rx=48 card with mx-24px ──── */}
      <section className="relative mt-6 mx-[1vw] rounded-[32px] md:rounded-[48px] bg-[var(--color-verde)] overflow-hidden h-[80vh] flex flex-col" style={{width: '98vw', marginLeft: '1vw', marginRight: '1vw'}}>

        {/* Hero content */}
        <div className="relative flex-1 flex flex-col items-center justify-center text-center px-6 pt-[140px] md:pt-[180px] pb-20 md:pb-40">
          {/* Pill badge — outline style */}
          <span className="inline-flex items-center border border-[var(--color-cremita)]/40 rounded-full px-5 py-2 mb-8 md:mb-10">
            <span className="font-sans text-[10px] font-medium tracking-[0.22em] uppercase text-[var(--color-cremita)]/70">
              Una pape bien bonita
            </span>
          </span>

          {/* Headline — PP Editorial New italic, both lines cremita */}
          <h1 className="font-serif italic text-[clamp(3rem,7.5vw,6.5rem)] leading-[1.02] text-[var(--color-cremita)] mb-6 md:mb-8">
            Lo que imaginas<br />
            comienza aquí
          </h1>

          {/* Description — Satoshi regular (not italic) for visibility */}
          <p className="font-sans font-normal text-[var(--color-cremita)]/70 text-base md:text-[22px] max-w-2xl leading-relaxed">
            Desde una cartulina de último minuto hasta stickers, regalos,
            talleres y clases creativas.
          </p>
        </div>

        {/* Decorative ribbon path — full width at bottom */}
        <svg
          viewBox="-67 133 1526 294"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute bottom-0 left-0 right-0 w-full h-auto pointer-events-none"
          preserveAspectRatio="none"
        >
          <path
            d="M864.984 271.314C876.502 294.712 907.345 334.037 995.323 300.643C1104.1 259.357 1331.53 279.964 1457.77 390.325M864.984 271.314C862.261 265.785 860.617 261.143 859.555 258.563C856.233 250.495 861.138 246.328 865.113 247.716C867.789 248.648 870.875 251.417 869.083 258.563C867.993 262.897 866.624 267.156 864.984 271.314ZM864.984 271.314C779.94 487.307 -39.135 506.19 -66.2061 133.911"
            stroke="#F3E6CF"
            strokeOpacity="0.8"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>
      </section>

      {/* ── Marquee ───────────────────────────────────────────────────────── */}
      <TextCarousel />

      {/* ── Info Cards ────────────────────────────────────────────────────── */}
      <section className="w-[90%] mx-auto py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {INFO_CARDS.map((card) => (
            <Link
              key={card.slug}
              href={card.href}
              className="group relative rounded-2xl overflow-hidden flex flex-row hover:scale-[1.01] transition-transform duration-300"
              style={{ backgroundColor: card.bg, color: card.text, height: "320px" }}
            >
              {/* Text side */}
              <div className="flex flex-col justify-between p-8 flex-1 min-w-0">
                <div>
                  <h3 className="font-serif italic text-[2rem] mb-4 leading-tight">{card.title}</h3>
                  <p className="text-[16px] md:text-[18px] leading-relaxed opacity-80">{card.body}</p>
                </div>
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-verde)] mt-8 group-hover:opacity-80 transition-opacity">
                  <ArrowRightIcon className="w-4 h-4 text-[var(--color-cremita)]" />
                </span>
              </div>
              {/* Image side */}
              <div className="w-[52%] flex-shrink-0 p-3 pl-0 h-full">
                <div className="relative w-full h-full rounded-xl overflow-hidden">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Nosotros ──────────────────────────────────────────────────────── */}
      <section className="w-[90%] mx-auto py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-12 items-end">
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
        </div>
      </section>

      {/* ── Libretas ──────────────────────────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="w-[90%] mx-auto mb-6 flex items-end justify-between">
          <h2 className="font-serif font-extralight text-[clamp(1.8rem,3.5vw,2.8rem)] text-[#403C3C]">
            Libretas
          </h2>
          <Link
            href="/productos?categoria=libretas"
            className="text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-verde)] transition-colors"
          >
            Ver todo →
          </Link>
        </div>
        <div className="pl-5 md:pl-[max(80px,calc((100vw-1280px)/2+80px))] flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {libretas.map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      </section>

      {/* ── Los Favoritos ─────────────────────────────────────────────────── */}
      <section className="py-8 md:py-12 bg-[var(--color-cremita)]/40">
        <div className="w-[90%] mx-auto mb-6 flex items-end justify-between">
          <h2 className="font-serif font-extralight text-[clamp(1.8rem,3.5vw,2.8rem)] text-[#403C3C]">
            Los favoritos
          </h2>
          <Link
            href="/productos"
            className="text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-verde)] transition-colors"
          >
            Ver todo →
          </Link>
        </div>
        <div className="pl-5 md:pl-[max(80px,calc((100vw-1280px)/2+80px))] flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {favoritos.map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      </section>

      {/* ── Instagram ─────────────────────────────────────────────────────── */}
      <section className="w-[90%] mx-auto py-16 md:py-20">
        <div className="text-center mb-10">
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
        </div>

        {/* IG post grid — placeholders until real embed or API */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {IG_POSTS.map((post) => (
            <a
              key={post.id}
              href="https://instagram.com/papela.atelier"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-xl overflow-hidden bg-[var(--color-cremita-2)]"
            >
              <div className="w-full h-full bg-gradient-to-br from-[var(--color-cremita)] via-[#e8d5b0] to-[var(--color-terracota)]/30" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end p-3">
                <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  ❤ {post.likes}
                </span>
              </div>
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
