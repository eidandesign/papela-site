"use client";

import Image from "next/image";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/solid";
import QuickAddButton from "./QuickAddButton";
import { useCartStore } from "@/lib/stores/cartStore";
import { useProductDrawerStore } from "@/lib/stores/productDrawerStore";
import type { Producto } from "@/lib/productos";

export default function ProductCard({
  producto,
  fullWidth = false,
  variant = "default",
}: {
  producto: Producto;
  fullWidth?: boolean;
  /** "catalog" = diseño Figma compacto (imagen cuadrada, título serif) usado en el carrusel de /productos */
  variant?: "default" | "catalog";
}) {
  const open = useProductDrawerStore((s) => s.open);
  const items = useCartStore((s) => s.items);
  const { id, slug, nombre, precio, imagen_url, stock } = producto;
  const isCatalog = variant === "catalog";
  // Regla del "+" (nov-2026, pedido del dueño): con UNA sola opción (o
  // ninguna) agrega DIRECTO con el vuelo al carrito; con 2+ opciones abre el
  // drawer para elegir color/variable.
  const variaciones = (producto.variaciones ?? []).filter((v) => v.stock > 0);
  const unidades = items.filter((i) => i.productoId === id).reduce((a, i) => a + i.cantidad, 0);

  return (
    <div
      className={`group relative cursor-pointer rounded-2xl ${
        fullWidth
          ? "w-full"
          : isCatalog
          ? "flex-shrink-0 w-[200px] md:w-[240px]"
          : "flex-shrink-0 w-[220px] md:w-[240px]"
      }`}
    >
      <div
        className={`w-full ${
          isCatalog ? "aspect-square rounded-[16px]" : "aspect-[3/4] rounded-2xl"
        } bg-[var(--color-cremita-2)] mb-3 overflow-hidden relative`}
        data-producto-imagen
      >
        {imagen_url ? (
          <Image
            src={imagen_url}
            alt={nombre}
            fill
            sizes={fullWidth ? "(max-width: 768px) 45vw, (max-width: 1024px) 30vw, 23vw" : "240px"}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--color-cremita)] to-[var(--color-cremita-2)]" />
        )}
        {variaciones.length >= 2 ? (
          <button
            type="button"
            aria-label={`Elegir opción de ${nombre}`}
            onClick={(e) => { e.stopPropagation(); open(producto); }}
            className="absolute bottom-3 right-3 z-10 w-9 h-9 rounded-full bg-[var(--color-verde)] text-[var(--color-cremita)] flex items-center justify-center"
          >
            <PlusIcon className="w-4 h-4" />
            {unidades > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--color-terracota)] text-white text-[10px] font-bold flex items-center justify-center leading-none">
                {unidades}
              </span>
            )}
          </button>
        ) : variaciones.length === 1 ? (
          <QuickAddButton
            productoId={id}
            nombre={nombre}
            precio={variaciones[0].precio}
            imagenUrl={variaciones[0].imagen_url ?? imagen_url}
            stock={variaciones[0].stock}
            variacionId={variaciones[0].id}
            variacionNombre={variaciones[0].nombre}
          />
        ) : (
          <QuickAddButton
            productoId={id}
            nombre={nombre}
            precio={precio}
            imagenUrl={imagen_url}
            stock={stock}
          />
        )}
      </div>
      {isCatalog ? (
        <>
          <p className="font-serif text-[18px] leading-[24px] text-[var(--color-muted)]">{nombre}</p>
          <p className="text-[14px] text-[var(--color-muted)] mt-0.5">${precio.toLocaleString()} MXN</p>
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-[var(--color-text)] leading-tight">{nombre}</p>
          <p className="text-sm text-[var(--color-muted)] mt-0.5">${precio.toLocaleString()} MXN</p>
        </>
      )}
      {/* Overlay con href real a la ficha (/productos/[id]): da linking interno
          crawleable a las páginas de producto (antes eran huérfanas — solo
          sitemap). El click sigue abriendo el drawer; cmd/ctrl-click o el
          crawler llegan a la página completa. Los botones internos van con
          z-10 por encima del overlay. */}
      <Link
        href={`/productos/${slug ?? id}`}
        aria-label={`Ver detalle de ${nombre}`}
        onClick={(e) => { e.preventDefault(); open(producto); }}
        className="absolute inset-0 z-[1] rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-verde)]"
      />
    </div>
  );
}
