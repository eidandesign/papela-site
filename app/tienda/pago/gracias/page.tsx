import Link from "next/link";
import type { Metadata } from "next";
import ClearCartOnMount from "@/components/site/ClearCartOnMount";
import PurchaseTracker from "@/components/site/PurchaseTracker";
import { compraAprobada } from "@/lib/ga4";
import { folioPedido } from "@/lib/tienda/aviso-pedido";

export const metadata: Metadata = {
  title: "¡Pedido recibido! — Papela Atelier",
  robots: { index: false, follow: false },
};

export default async function GraciasPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const compra = await compraAprobada(params, "producto");
  // MP regresa con ?external_reference=tienda:<uuid>; el folio es el mismo del
  // correo de confirmación. Solo se muestra si la referencia tiene esa forma.
  const ref = typeof params.external_reference === "string" ? params.external_reference : "";
  const folio = /^tienda:[0-9a-f-]{36}$/i.test(ref) ? folioPedido(ref) : null;
  return (
    <section className="w-[90%] mx-auto pt-48 md:pt-56 pb-24 flex flex-col items-center text-center gap-6">
      <ClearCartOnMount />
      {compra && <PurchaseTracker compra={compra} />}
      <span className="text-5xl">🌿</span>
      <h1 className="font-serif font-extralight text-[clamp(2rem,5vw,3.5rem)] text-[#403C3C]">
        ¡Gracias por tu pedido!
      </h1>
      {folio && (
        <p className="label text-[var(--color-terracota)]">Pedido N.º {folio}</p>
      )}
      <p className="font-sans text-[18px] text-[var(--color-muted)] max-w-md">
        Recibimos tu pago. Te mandamos la confirmación a tu correo y te avisaremos cuando tu pedido esté listo.
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
