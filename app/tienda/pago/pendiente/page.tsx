import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pago pendiente — Papela Atelier",
  robots: { index: false, follow: false },
};

export default function PendientePage() {
  return (
    <section className="w-[90%] mx-auto pt-32 pb-24 flex flex-col items-center text-center gap-6">
      <span className="text-5xl">⏳</span>
      <h1 className="font-serif font-extralight text-[clamp(2rem,5vw,3.5rem)] text-[#403C3C]">
        Pago pendiente
      </h1>
      <p className="font-sans text-[18px] text-[var(--color-muted)] max-w-md">
        Tu pago está siendo procesado. Te avisaremos por correo en cuanto se confirme.
      </p>
      <Link
        href="/productos"
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--color-verde)] text-[var(--color-cremita)] px-7 py-3.5 text-sm font-semibold"
      >
        Volver al catálogo
      </Link>
    </section>
  );
}
