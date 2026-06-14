import Link from "next/link";

export default function SiteNavbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[var(--color-bg)]/90 backdrop-blur-sm border-b border-[var(--color-border)]">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link
            href="/productos"
            className="text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-verde)] transition-colors"
          >
            Catálogo
          </Link>
          <Link
            href="/talleres"
            className="text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-verde)] transition-colors"
          >
            Talleres
          </Link>
        </div>

        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <span className="font-serif text-xl tracking-wide text-[var(--color-verde)]">
            Papela
          </span>
        </Link>

        <div className="flex items-center gap-10">
          <Link
            href="/clases"
            className="text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-verde)] transition-colors"
          >
            Clases
          </Link>
          <Link
            href="/nosotros"
            className="text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-verde)] transition-colors"
          >
            Nosotros
          </Link>
        </div>
      </nav>
    </header>
  );
}
