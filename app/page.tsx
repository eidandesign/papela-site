import Link from "next/link";
import TextCarousel from "@/components/site/TextCarousel";

// ─── Static data (replace with Supabase queries later) ────────────────────────

const INFO_CARDS = [
  {
    slug: "talleres",
    title: "Talleres",
    body: "Experiencias creativas con invitadxs cada mes.",
    href: "/talleres",
    bg: "bg-[var(--color-verde)]",
    text: "text-[var(--color-cremita)]",
  },
  {
    slug: "clases",
    title: "Clases",
    body: "Aprende técnicas nuevas y crea a tu ritmo.",
    href: "/clases",
    bg: "bg-[var(--color-cremita)]",
    text: "text-[var(--color-verde)]",
  },
  {
    slug: "personaliza",
    title: "Personaliza",
    body: "Stickers, toppers y detalles hechos a la medida.",
    href: "/productos",
    bg: "bg-[var(--color-terracota)]",
    text: "text-[var(--color-cremita)]",
  },
];

const LIBRETAS = [
  { name: "Special Melody", price: "$200.00 MXN", slug: "special-melody" },
  { name: "Painting Dreams", price: "$145.00 MXN", slug: "painting-dreams" },
  { name: "F.Champenois",   price: "$380.00 MXN", slug: "f-champenois" },
  { name: "Van Gogh 1",     price: "$280.00 MXN", slug: "van-gogh-1" },
];

const FAVORITOS = [
  { name: "Special Melody", price: "$200.00 MXN", slug: "special-melody" },
  { name: "Tom & Jerry",    price: "$320.00 MXN", slug: "tom-jerry" },
  { name: "Moonlit",        price: "$200.00 MXN", slug: "moonlit" },
  { name: "Cowboy Set",     price: "$145.00 MXN", slug: "cowboy-set" },
];

const IG_POSTS = [
  { id: 1, likes: 17, caption: "psic.fatimamtz" },
  { id: 2, likes: 9,  caption: "Puebla City" },
  { id: 3, likes: 8,  caption: "papela.atelier" },
];

// ─── Subcomponents ─────────────────────────────────────────────────────────────

function ProductCard({ name, price, slug }: { name: string; price: string; slug: string }) {
  return (
    <Link
      href={`/productos/${slug}`}
      className="group flex-shrink-0 w-[220px] md:w-[240px]"
    >
      <div className="w-full aspect-[3/4] rounded-2xl bg-[var(--color-cremita-2)] mb-3 overflow-hidden">
        {/* Product image — replace src with real image from Supabase Storage */}
        <div className="w-full h-full bg-gradient-to-br from-[var(--color-cremita)] to-[var(--color-cremita-2)] group-hover:scale-105 transition-transform duration-500" />
      </div>
      <p className="text-sm font-medium text-[var(--color-text)] leading-tight">{name}</p>
      <p className="text-sm text-[var(--color-muted)] mt-0.5">{price}</p>
    </Link>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      {/* ── Hero card — matches Figma 1392×855 rx=48 card with mx-24px ──── */}
      <section className="relative mt-6 mx-4 md:mx-6 rounded-[32px] md:rounded-[48px] bg-[var(--color-verde)] overflow-hidden min-h-[600px] md:min-h-[700px] flex flex-col">

        {/* Hero content */}
        <div className="relative flex-1 flex flex-col items-center justify-center text-center px-6 pt-[160px] md:pt-[180px] pb-32 md:pb-40">
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
          <p className="font-sans font-normal text-[var(--color-cremita)]/70 text-[24px] max-w-2xl leading-relaxed">
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
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </section>

      {/* ── Marquee ───────────────────────────────────────────────────────── */}
      <TextCarousel />

      {/* ── Info Cards ────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {INFO_CARDS.map((card) => (
            <Link
              key={card.slug}
              href={card.href}
              className={`group relative ${card.bg} ${card.text} rounded-2xl p-8 min-h-[240px] flex flex-col justify-between overflow-hidden hover:scale-[1.01] transition-transform duration-300`}
            >
              {/* Decorative circle */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />

              <div>
                <h3 className="font-serif italic text-3xl mb-3">{card.title}</h3>
                <p className="text-sm opacity-75 leading-relaxed max-w-[200px]">{card.body}</p>
              </div>
              <span className="flex items-center gap-1.5 text-sm font-medium mt-6 opacity-80 group-hover:opacity-100 transition-opacity">
                Ver más
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Nosotros ──────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-terracota)] mb-4">
              Sobre nosotros
            </p>
            <h2 className="font-serif italic text-[clamp(2.5rem,5vw,4rem)] text-[var(--color-verde)] leading-tight mb-6">
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
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-verde)] border border-[var(--color-verde)] rounded-full px-5 py-2.5 hover:bg-[var(--color-verde)] hover:text-[var(--color-cremita)] transition-colors"
            >
              Conoce nuestra historia
            </Link>
          </div>

          {/* Video / Image placeholder */}
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-[var(--color-cremita-2)]">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-cremita)] via-[var(--color-cremita-2)] to-[var(--color-verde)]/20" />
            {/* Replace with <video> pointing to Cloudinary/Supabase Storage URL */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/80 flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-[var(--color-verde)] ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Libretas ──────────────────────────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 mb-6 flex items-end justify-between">
          <h2 className="font-serif italic text-[clamp(1.8rem,3.5vw,2.8rem)] text-[var(--color-verde)]">
            Libretas
          </h2>
          <Link
            href="/productos?categoria=libretas"
            className="text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-verde)] transition-colors"
          >
            Ver todo →
          </Link>
        </div>
        <div className="pl-6 md:pl-[max(24px,calc((100vw-1280px)/2+24px))] flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {LIBRETAS.map((p) => (
            <ProductCard key={p.slug} {...p} />
          ))}
        </div>
      </section>

      {/* ── Los Favoritos ─────────────────────────────────────────────────── */}
      <section className="py-8 md:py-12 bg-[var(--color-cremita)]/40">
        <div className="max-w-7xl mx-auto px-6 mb-6 flex items-end justify-between">
          <h2 className="font-serif italic text-[clamp(1.8rem,3.5vw,2.8rem)] text-[var(--color-verde)]">
            Los favoritos
          </h2>
          <Link
            href="/productos"
            className="text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-verde)] transition-colors"
          >
            Ver todo →
          </Link>
        </div>
        <div className="pl-6 md:pl-[max(24px,calc((100vw-1280px)/2+24px))] flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {FAVORITOS.map((p) => (
            <ProductCard key={p.slug} {...p} />
          ))}
        </div>
      </section>

      {/* ── Instagram ─────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-terracota)] mb-3">
            Redes Sociales
          </p>
          <h2 className="font-serif italic text-[clamp(1.8rem,3.5vw,2.8rem)] text-[var(--color-verde)] mb-2">
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
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
