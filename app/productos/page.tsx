import type { Metadata } from "next";
import { getProductos } from "@/lib/productos";
import ProductosCatalog from "@/components/site/ProductosCatalog";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Catálogo de papelería y materiales de arte en Puebla",
  description:
    "Explora el catálogo de Papela Atelier: libretas artesanales, materiales de pintura, acuarelas, pinceles y papelería creativa. Envíos en Puebla.",
  alternates: { canonical: "https://www.papela-atelier.com/productos" },
  openGraph: {
    title: "Catálogo de papelería creativa — Papela Atelier Puebla",
    description:
      "Libretas artesanales, materiales de arte y papelería creativa. Todo lo que necesitas para crear en Puebla.",
  },
};

export default async function ProductosPage() {
  const productos = await getProductos();
  const categorias = [...new Set(productos.map((p) => p.categoria).filter(Boolean))] as string[];

  return (
    <>
      {/* ── Hero ── */}
      <section
        className="relative mt-6 rounded-[32px] md:rounded-[48px] overflow-hidden h-[80vh] flex flex-col items-center justify-center text-center px-8 md:px-20"
        style={{ backgroundColor: "var(--color-verde)", width: "98vw", marginLeft: "1vw", marginRight: "1vw" }}
      >
        <span className="inline-flex items-center border border-[var(--color-cremita)]/40 rounded-full px-5 py-2 mb-8">
          <span className="font-sans text-[10px] font-medium tracking-[0.22em] uppercase text-[var(--color-cremita)]/70">
            Catálogo
          </span>
        </span>
        <h1 className="font-serif italic text-[clamp(2.5rem,5.5vw,5rem)] leading-[1.05] text-[var(--color-cremita)] max-w-3xl mb-6">
          Todo lo que necesitas para crear, regalar e inspirarte
        </h1>
        <p className="font-sans text-[var(--color-cremita)]/70 text-base md:text-lg max-w-xl leading-relaxed">
          Libretas, stickers, materiales, papelería y mucho más. Encuentra algo bonito para cada momento.
        </p>
      </section>

      <section className="pt-16 pb-20 w-[90%] mx-auto">
        {productos.length === 0 ? (
          <p className="text-[var(--color-muted)]">No hay productos disponibles.</p>
        ) : (
          <ProductosCatalog productos={productos} categorias={categorias} />
        )}
      </section>
    </>
  );
}
