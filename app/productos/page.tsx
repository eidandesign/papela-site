import type { Metadata } from "next";
import { getProductosPublicos, type ProductoPublico } from "@/lib/productos-publicos";
import HeroSection from "@/components/site/HeroSection";
import ProductCard from "@/components/site/ProductCard";

export const revalidate = 60;

// Orden preferido de colecciones (igual que el home); el resto va después.
const ORDEN_COLECCIONES = ["libretas", "favoritos"];

function capitalizar(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const metadata: Metadata = {
  title: { absolute: "Catálogo de papelería y arte en Puebla — Papela Atelier" },
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
  // Solo los productos del catálogo público del admin (no todo Supabase).
  const productos = await getProductosPublicos();

  // Agrupar por colección (tags); los sin colección → "Más productos".
  const porColeccion = new Map<string, ProductoPublico[]>();
  const sinColeccion: ProductoPublico[] = [];
  for (const p of productos) {
    const tags = p.tags ?? [];
    if (tags.length === 0) {
      sinColeccion.push(p);
      continue;
    }
    for (const tag of tags) {
      const arr = porColeccion.get(tag) ?? [];
      arr.push(p);
      porColeccion.set(tag, arr);
    }
  }

  const ordenadas = [
    ...ORDEN_COLECCIONES.filter((t) => porColeccion.has(t)),
    ...[...porColeccion.keys()].filter((t) => !ORDEN_COLECCIONES.includes(t)),
  ];
  const secciones: { titulo: string; productos: ProductoPublico[] }[] = ordenadas.map((tag) => ({
    titulo: capitalizar(tag),
    productos: porColeccion.get(tag)!,
  }));
  if (sinColeccion.length > 0) {
    secciones.push({ titulo: "Más productos", productos: sinColeccion });
  }

  return (
    <>
      {/* ── Hero ── */}
      <HeroSection>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8 md:px-20 pt-[140px] md:pt-[180px] pb-16 md:pb-20">
          <span data-hero-badge className="inline-flex items-center border border-[var(--color-cremita)]/40 rounded-full px-5 py-2 mb-8">
            <span className="label text-[var(--color-cremita)]/70">
              Catálogo
            </span>
          </span>
          <h1 className="font-serif italic text-[clamp(2.5rem,5.5vw,5rem)] leading-[1.05] text-[var(--color-cremita)] max-w-3xl mb-6">
            Todo lo que necesitas para crear, regalar e inspirarte
          </h1>
          <p className="font-sans text-[var(--color-cremita)]/90 text-[18px] leading-[24px] max-w-xl">
            Libretas, stickers, materiales, papelería y mucho más. Encuentra algo bonito para cada momento.
          </p>
        </div>
      </HeroSection>

      {/* ── Secciones por colección (como en el home) ── */}
      {secciones.length === 0 ? (
        <section className="pt-16 pb-20 w-[90%] mx-auto">
          <p className="text-[var(--color-muted)]">No hay productos disponibles.</p>
        </section>
      ) : (
        <div className="pt-12 md:pt-16 pb-20">
          {secciones.map((sec) => (
            <section key={sec.titulo} className="py-8 md:py-10">
              <div className="w-[90%] mx-auto mb-6">
                <h2 className="font-serif font-extralight text-[clamp(1.8rem,3.5vw,2.8rem)] text-[#403C3C]">
                  {sec.titulo}
                </h2>
              </div>
              <div className="w-[90%] mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {sec.productos.map((p) => (
                  <ProductCard key={p.id} producto={p} fullWidth />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
