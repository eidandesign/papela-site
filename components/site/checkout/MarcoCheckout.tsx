"use client";

import Link from "next/link";
import { ArrowLeftIcon, CheckIcon, ChevronRightIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import AnimatedLogo from "@/components/site/AnimatedLogo";
import WhatsAppLink from "@/components/site/WhatsAppLink";

// Marco del checkout "encapsulado": sin navbar ni footer del sitio (la ruta va
// en standalone en ConditionalShell) para que, a un paso de pagar, no haya
// menús que inviten a irse. Solo queda: regresar, el logo (→ inicio), dónde
// va el proceso, y abajo lo legal + ayuda por WhatsApp.

function Migas() {
  return (
    <ol className="flex items-center gap-1.5 font-sans text-xs text-[var(--color-muted)]" aria-label="Pasos de la compra">
      <li className="flex items-center gap-1 text-[var(--color-verde)]">
        <CheckIcon className="w-3.5 h-3.5" /> Carrito
      </li>
      <ChevronRightIcon aria-hidden="true" className="w-3 h-3" />
      <li className="font-semibold text-[var(--color-text)]" aria-current="step">Tus datos</li>
      <ChevronRightIcon aria-hidden="true" className="w-3 h-3" />
      <li>Pago seguro</li>
    </ol>
  );
}

export default function MarcoCheckout({
  backHref,
  backLabel,
  migas = false,
  children,
}: {
  backHref: string;
  backLabel: string;
  /** true = migas Carrito → Tus datos → Pago (tienda); false = pill "Pago seguro" (talleres). */
  migas?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <header className="w-[90%] mx-auto pt-6 md:pt-8">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <Link
            href={backHref}
            className="justify-self-start inline-flex items-center gap-1.5 font-sans text-sm text-[var(--color-muted)] hover:text-[var(--color-verde)] transition-colors"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{backLabel}</span>
            <span className="sm:hidden">Volver</span>
          </Link>
          <Link href="/" aria-label="Papela Atelier — inicio" className="justify-self-center">
            <AnimatedLogo color="var(--color-verde)" className="w-[88px] h-[88px] md:w-[104px] md:h-[104px]" />
          </Link>
          <div className="justify-self-end hidden sm:block">
            {migas ? (
              <Migas />
            ) : (
              <span className="inline-flex items-center gap-1.5 font-sans text-xs text-[var(--color-muted)]">
                <LockClosedIcon className="w-3.5 h-3.5" /> Pago seguro
              </span>
            )}
          </div>
        </div>
        {migas && (
          <div className="sm:hidden flex justify-center mt-5">
            <Migas />
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="w-[90%] mx-auto py-8 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-3 font-sans text-xs text-[var(--color-muted)]">
        <p>© {new Date().getFullYear()} Papela Atelier</p>
        <nav aria-label="Ayuda y legales" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <Link href="/terminos" className="hover:text-[var(--color-verde)] transition-colors">Términos</Link>
          <Link href="/privacidad" className="hover:text-[var(--color-verde)] transition-colors">Aviso de privacidad</Link>
          <WhatsAppLink
            ubicacion="checkout_pie"
            texto="Hola Papela 🌿 tengo una duda con mi compra en línea"
            className="font-semibold text-[var(--color-verde)] underline underline-offset-2"
          >
            ¿Dudas? Escríbenos
          </WhatsAppLink>
        </nav>
      </footer>
    </div>
  );
}
