import Link from "next/link";
import Image from "next/image";
import { getProductos } from "@/lib/productos";

export const revalidate = 60;

export default async function ProductosPage() {
  const productos = await getProductos();

  return (
    <section className="pt-32 md:pt-40 pb-20 w-[90%] mx-auto">
      <h1 className="font-serif font-extralight text-[clamp(2.5rem,5vw,4rem)] text-[#403C3C] mb-12">
        Catálogo
      </h1>

      {productos.length === 0 ? (
        <p className="text-[var(--color-muted)]">No hay productos disponibles.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productos.map((p) => (
            <Link key={p.id} href={`/productos/${p.id}`} className="group">
              <div className="aspect-[3/4] rounded-2xl bg-[var(--color-cremita-2)] overflow-hidden mb-3 relative">
                {p.imagen_url ? (
                  <Image
                    src={p.imagen_url}
                    alt={p.nombre}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[var(--color-cremita)] to-[var(--color-cremita-2)]" />
                )}
              </div>
              <p className="text-sm font-medium text-[var(--color-text)] leading-tight">{p.nombre}</p>
              <p className="text-sm text-[var(--color-muted)] mt-0.5">${p.precio.toLocaleString()} MXN</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
