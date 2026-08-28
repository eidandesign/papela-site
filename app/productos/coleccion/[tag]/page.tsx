import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { getProductosPublicos } from "@/lib/productos-publicos";
import { seccionesPorColeccion } from "@/lib/colecciones";
import ProductCard from "@/components/site/ProductCard";

export const revalidate = 60;

async function getSeccion(tag: string) {
  const productos = await getProductosPublicos();
  const secciones = seccionesPorColeccion(productos);
  return secciones.find((s) => s.slug === decodeURIComponent(tag)) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const seccion = await getSeccion(tag);
  if (!seccion) return { title: "Colección no encontrada" };
  return {
    title: { absolute: `${seccion.titulo} — Papela Atelier` },
    description: `Explora la colección ${seccion.titulo} de Papela Atelier: papelería creativa y materiales de arte en Puebla.`,
    alternates: { canonical: `https://www.papela-atelier.com/productos/coleccion/${seccion.slug}` },
  };
}

export default async function ColeccionPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const seccion = await getSeccion(tag);
  if (!seccion) notFound();

  return (
    // El navbar mobile (logo grande centrado) es más alto que el desktop (una fila)
    <div className="pt-[150px] md:pt-[130px] pb-20">
      {/* ── Encabezado compacto ── */}
      <div className="w-[90%] mx-auto mb-6 md:mb-8">
        <Link
          href="/productos"
          className="group inline-flex items-center gap-1.5 font-sans text-[14px] font-medium text-[var(--color-verde)] mb-3"
        >
          <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Volver al catálogo
        </Link>
        <div className="flex items-baseline gap-3">
          <h1 className="font-serif font-extralight text-[clamp(1.8rem,3.5vw,2.8rem)] text-[#403C3C]">
            {seccion.titulo}
          </h1>
          <p className="font-sans text-[14px] text-[var(--color-muted)]">
            {seccion.productos.length}{" "}
            {seccion.productos.length === 1 ? "producto" : "productos"}
          </p>
        </div>
        {seccion.descripcion && (
          <p className="font-sans text-[16px] text-[var(--color-muted)] -mt-1">
            {seccion.descripcion}
          </p>
        )}
      </div>

      {/* ── Grid de productos (sin scroll horizontal) ── */}
      <div className="w-[90%] mx-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-10">
        {seccion.productos.map((p) => (
          <ProductCard key={p.id} producto={p} variant="catalog" fullWidth />
        ))}
      </div>
    </div>
  );
}
