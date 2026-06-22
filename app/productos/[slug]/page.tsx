import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductoById } from "@/lib/productos";
import { SITE_URL } from "@/lib/site";
import AddToCartButton from "@/components/site/AddToCartButton";

export const revalidate = 60;

const WHATSAPP = "522211865590";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const producto = await getProductoById(slug);

  if (!producto) {
    return { title: "Producto no encontrado", robots: { index: false, follow: false } };
  }

  const desc =
    producto.descripcion?.slice(0, 155) ??
    `${producto.nombre} — papelería y materiales de arte en Papela Atelier, Puebla.`;
  const url = `${SITE_URL}/productos/${producto.id}`;

  return {
    title: { absolute: `${producto.nombre} — Papela Atelier` },
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title: `${producto.nombre} — Papela Atelier`,
      description: desc,
      url,
      images: producto.imagen_url
        ? [{ url: producto.imagen_url, alt: producto.nombre }]
        : undefined,
    },
  };
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const producto = await getProductoById(slug);

  if (!producto) notFound();

  const enStock = producto.stock > 0;
  const waText = encodeURIComponent(`Hola Papela 🌿 me interesa: ${producto.nombre}`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: producto.nombre,
    description: producto.descripcion ?? undefined,
    image: producto.imagen_url ?? undefined,
    category: producto.categoria ?? undefined,
    brand: { "@type": "Brand", name: "Papela Atelier" },
    offers: {
      "@type": "Offer",
      price: producto.precio,
      priceCurrency: "MXN",
      availability: enStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/productos/${producto.id}`,
      seller: { "@type": "Organization", name: "Papela Atelier" },
    },
  };

  return (
    <section className="w-[90%] mx-auto pt-28 md:pt-32 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <Link
        href="/productos"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-verde)] transition-colors mb-8"
      >
        ← Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
        {/* Image */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[var(--color-cremita-2)]">
          {producto.imagen_url ? (
            <Image
              src={producto.imagen_url}
              alt={producto.nombre}
              fill
              sizes="(max-width: 768px) 90vw, 45vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[var(--color-cremita)] to-[var(--color-cremita-2)]" />
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          {producto.categoria && (
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-terracota)] mb-3">
              {producto.categoria}
            </span>
          )}
          <h1 className="font-serif font-extralight text-[clamp(2rem,4vw,3rem)] text-[#403C3C] leading-tight mb-4">
            {producto.nombre}
          </h1>
          <p className="font-sans text-2xl text-[var(--color-verde)] mb-6">
            ${producto.precio.toLocaleString()} MXN
          </p>

          {producto.descripcion && (
            <p className="font-sans text-[18px] text-[var(--color-text)] leading-relaxed mb-6">
              {producto.descripcion}
            </p>
          )}

          {(producto.color || producto.medida) && (
            <dl className="flex flex-wrap gap-x-10 gap-y-2 mb-8 text-sm">
              {producto.color && (
                <div>
                  <dt className="text-[var(--color-muted)]">Color</dt>
                  <dd className="text-[var(--color-text)] font-medium">{producto.color}</dd>
                </div>
              )}
              {producto.medida && (
                <div>
                  <dt className="text-[var(--color-muted)]">Medida</dt>
                  <dd className="text-[var(--color-text)] font-medium">{producto.medida}</dd>
                </div>
              )}
            </dl>
          )}

          <p className="text-sm text-[var(--color-muted)] mb-6">
            {enStock ? "✓ Disponible" : "Por el momento agotado"}
          </p>

          <div className="flex flex-wrap gap-3">
            <AddToCartButton
              productoId={producto.id}
              nombre={producto.nombre}
              precio={producto.precio}
              imagenUrl={producto.imagen_url ?? null}
              stock={producto.stock}
            />
            <a
              href={`https://wa.me/${WHATSAPP}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-[var(--color-verde)] text-[var(--color-verde)] px-6 py-3.5 text-sm font-semibold hover:bg-[var(--color-verde)]/5 transition-colors"
            >
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
