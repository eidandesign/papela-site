import Link from "next/link";
import { XCircleIcon } from "@heroicons/react/24/solid";

export default function TallerPagoError() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-5">
      <div className="text-center max-w-md">
        <XCircleIcon className="w-16 h-16 text-[var(--color-terracota)] mx-auto mb-6" />
        <h1 className="font-serif italic text-[clamp(2rem,4vw,3rem)] text-[var(--color-text)] mb-4">
          Algo salió mal
        </h1>
        <p className="font-sans text-[var(--color-muted)] text-base leading-relaxed mb-8">
          No se pudo completar el pago. No se realizó ningún cargo. Por favor intenta de nuevo o contáctanos por WhatsApp.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/talleres"
            className="inline-flex items-center justify-center gap-2 bg-[var(--color-verde)] text-[var(--color-cremita)] font-sans font-semibold px-8 py-4 rounded-full hover:opacity-90 transition-opacity"
          >
            Volver a talleres
          </Link>
          <a
            href="https://wa.me/522211865590"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 border border-[var(--color-verde)] text-[var(--color-verde)] font-sans font-semibold px-8 py-4 rounded-full hover:bg-[var(--color-verde)] hover:text-[var(--color-cremita)] transition-colors"
          >
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
