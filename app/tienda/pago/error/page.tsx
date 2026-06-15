import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Error en el pago — Papela Atelier",
  robots: { index: false, follow: false },
};

export default function ErrorPage() {
  return (
    <section className="w-[90%] mx-auto pt-32 pb-24 flex flex-col items-center text-center gap-6">
      <span className="text-5xl">😕</span>
      <h1 className="font-serif font-extralight text-[clamp(2rem,5vw,3.5rem)] text-[#403C3C]">
        Hubo un problema
      </h1>
      <p className="font-sans text-[18px] text-[var(--color-muted)] max-w-md">
        No pudimos procesar tu pago. Puedes intentarlo de nuevo o escribirnos por WhatsApp.
      </p>
      <div className="flex flex-wrap gap-3 justify-center mt-4">
        <Link
          href="/productos"
          className="inline-flex items-center gap-2 rounded-full bg-[var(--color-verde)] text-[var(--color-cremita)] px-7 py-3.5 text-sm font-semibold"
        >
          Volver al catálogo
        </Link>
        <a
          href="https://wa.me/522211865590"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--color-verde)] text-[var(--color-verde)] px-7 py-3.5 text-sm font-semibold"
        >
          Contactar por WhatsApp
        </a>
      </div>
    </section>
  );
}
