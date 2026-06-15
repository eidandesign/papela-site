import Link from "next/link";
import type { Metadata } from "next";
import ClearCartOnMount from "@/components/site/ClearCartOnMount";

export const metadata: Metadata = {
  title: "¡Pedido recibido! — Papela Atelier",
  robots: { index: false, follow: false },
};

export default function GraciasPage() {
  return (
    <section className="w-[90%] mx-auto pt-32 pb-24 flex flex-col items-center text-center gap-6">
      <ClearCartOnMount />
      <span className="text-5xl">🌿</span>
      <h1 className="font-serif font-extralight text-[clamp(2rem,5vw,3.5rem)] text-[#403C3C]">
        ¡Gracias por tu pedido!
      </h1>
      <p className="font-sans text-[18px] text-[var(--color-muted)] max-w-md">
        Recibimos tu pago. Nos pondremos en contacto contigo pronto para coordinar la entrega.
      </p>
      <Link
        href="/productos"
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--color-verde)] text-[var(--color-cremita)] px-7 py-3.5 text-sm font-semibold"
      >
        Seguir comprando
      </Link>
    </section>
  );
}
