import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import BackToTop from "./BackToTop";

const WHATSAPP = "522211865590";

const SITEMAP: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Explora",
    links: [
      { href: "/productos", label: "Catálogo" },
      { href: "/personaliza", label: "Personalización" },
      { href: "/servicios", label: "Servicios" },
    ],
  },
  {
    title: "Aprende",
    links: [
      { href: "/talleres", label: "Talleres" },
      { href: "/clases", label: "Clases" },
    ],
  },
  {
    title: "Papela",
    links: [
      { href: "/nosotros", label: "Nosotros" },
      { href: "/privacidad", label: "Aviso de privacidad" },
      { href: "/terminos", label: "Términos" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="bg-[var(--color-bg)] border-t border-[var(--color-border)]">

      {/* Back to School — destacado (mismo fondo e imagen que el hero de la página) */}
      <div className="w-[90%] mx-auto pt-20 md:pt-24 overflow-x-clip">
        <Link
          href="/back-to-school"
          className="group relative flex flex-col rounded-[24px] px-7 py-7 md:px-10 md:py-9 min-h-[220px] md:min-h-[240px] justify-center"
        >
          {/* Fondo + textura + viñeta, recortados a las esquinas redondeadas */}
          <div className="absolute inset-0 z-0 overflow-hidden rounded-[24px]" style={{ backgroundColor: "#263834" }}>
            {/* Textura de pizarrón (misma del hero) */}
            <Image
              src="/images/back-to-school/pizarron.webp"
              alt=""
              fill
              aria-hidden="true"
              sizes="90vw"
              className="pointer-events-none absolute inset-0 object-cover"
              style={{ mixBlendMode: "soft-light", opacity: 0.9, filter: "grayscale(1) contrast(1.15) brightness(1.1)" }}
            />
            {/* Viñeta sutil (misma del hero) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(130% 100% at 50% 50%, transparent 45%, rgba(0,0,0,0.22) 100%)",
              }}
            />
          </div>

          {/* Niños del hero — en mobile corridos a la derecha; en desktop la
              cabeza sobresale del banner (efecto de salir del recuadro) */}
          <div className="pointer-events-none absolute z-10 bottom-0 -right-6 sm:right-1 md:right-3 w-[190px] sm:w-[270px] md:w-[360px] lg:w-[410px]">
            <Image
              src="/images/back-to-school/hero-ninos.png"
              alt="Niños listos para el regreso a clases"
              width={600}
              height={450}
              className="h-auto w-full object-contain"
              style={{ filter: "drop-shadow(12px 16px 20px rgba(0,0,0,0.45))" }}
            />
          </div>

          {/* Texto */}
          <div className="relative z-20 max-w-[56%] sm:max-w-[58%] md:max-w-[56%]">
            <p className="label whitespace-nowrap text-[var(--color-cremita)]/70 mb-2">Temporada escolar</p>
            <p className="font-serif italic text-[clamp(1.6rem,3.5vw,2.4rem)] leading-[1.05] text-[var(--color-cremita)]">
              Back to School
            </p>
            <p className="font-sans text-sm text-[var(--color-cremita)]/80 mt-2 max-w-md">
              Etiquetas escolares, lista de útiles y todo lo que necesites para este regreso a clases.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 font-sans text-sm font-medium text-[var(--color-cremita)]">
              Más información
              <span className="w-9 h-9 rounded-full bg-[var(--color-cremita)] flex items-center justify-center transition-transform group-hover:translate-x-1">
                <ArrowRightIcon className="w-4 h-4 text-[var(--color-verde)]" />
              </span>
            </span>
          </div>
        </Link>
      </div>

      {/* Top section — mapa de sitio + contacto */}
      <div className="w-[90%] mx-auto pt-12 pb-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">

        {/* Mapa de sitio */}
        {SITEMAP.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-4">
              {col.title}
            </p>
            <ul className="flex flex-col gap-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-[15px] text-[var(--color-text)] hover:text-[var(--color-verde)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        {/* Social */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-4">
            Síguenos
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/papela.atelier"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de Papela Atelier"
              className="w-10 h-10 rounded-full bg-[var(--color-verde)] flex items-center justify-center text-[var(--color-cremita)] hover:opacity-80 transition-opacity"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a
              href="https://facebook.com/papela.atelier"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook de Papela Atelier"
              className="w-10 h-10 rounded-full bg-[var(--color-verde)] flex items-center justify-center text-[var(--color-cremita)] hover:opacity-80 transition-opacity"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href="https://tiktok.com/@papela.atelier"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok de Papela Atelier"
              className="w-10 h-10 rounded-full bg-[var(--color-verde)] flex items-center justify-center text-[var(--color-cremita)] hover:opacity-80 transition-opacity"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.26 8.26 0 004.84 1.56V6.78a4.85 4.85 0 01-1.07-.09z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Contact */}
        <div className="col-span-2 md:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-4">
            Escríbenos
          </p>
          <a
            href={`https://wa.me/${WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-serif font-extralight text-[clamp(1.3rem,2vw,1.6rem)] text-[var(--color-verde)] hover:opacity-70 transition-opacity"
          >
            +52 221 186 5590
          </a>
          <p className="text-sm text-[var(--color-muted)] mt-2">hola@papela-atelier.com</p>
          <p className="text-sm text-[var(--color-muted)] mt-1">Puebla, México</p>
        </div>
      </div>

      {/* Big display text */}
      <div className="w-[90%] mx-auto overflow-hidden pb-4">
        <p
          className="font-serif font-extralight leading-none text-[var(--color-verde)] whitespace-nowrap"
          style={{ fontSize: "clamp(4rem, 14vw, 13rem)" }}
        >
          papela atelier
        </p>
      </div>

      {/* Bottom bar */}
      <div className="w-[90%] mx-auto border-t border-[var(--color-border)] py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[var(--color-muted)]">
        <span>© {new Date().getFullYear()} Papela Atelier. Todos los derechos reservados.</span>
        <BackToTop />
      </div>

    </footer>
  );
}
