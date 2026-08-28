import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { getProductosPublicos } from "@/lib/productos-publicos";
import { seccionesPorColeccion } from "@/lib/colecciones";
import HeroSection from "@/components/site/HeroSection";
import ProductCarousel from "@/components/site/ProductCarousel";

export const revalidate = 60;

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
  const secciones = seccionesPorColeccion(productos);

  return (
    <>
      {/* ── Hero compacto: solo el título ── */}
      <HeroSection className="!min-h-0" showRibbon={false} showInk={false}>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8 md:px-20 pt-[140px] md:pt-[170px] pb-14 md:pb-16">
          <h1 className="font-serif italic text-[clamp(2.5rem,5.5vw,5rem)] leading-[1.05] text-[var(--color-cremita)] max-w-3xl">
            Todo lo que necesitas para crear, regalar e inspirarte
          </h1>
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
            <section key={sec.slug} className="py-8 md:py-10">
              <div className="w-[90%] mx-auto mb-6 flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-serif font-extralight text-[clamp(1.8rem,3.5vw,2.8rem)] text-[#403C3C]">
                    {sec.titulo}
                  </h2>
                  {sec.descripcion && (
                    <p className="font-sans text-[16px] text-[var(--color-muted)] -mt-1">
                      {sec.descripcion}
                    </p>
                  )}
                </div>
                <Link
                  href={`/productos/coleccion/${sec.slug}`}
                  className="group inline-flex items-center gap-1.5 flex-shrink-0 font-sans text-[14px] font-medium text-[var(--color-verde)]"
                >
                  Ver más
                  <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              <ProductCarousel productos={sec.productos} />
            </section>
          ))}
        </div>
      )}
    </>
  );
}
