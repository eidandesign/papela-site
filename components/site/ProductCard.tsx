"use client";

import Image from "next/image";
import { PlusIcon } from "@heroicons/react/24/solid";
import QuickAddButton from "./QuickAddButton";
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
  const { id, nombre, precio, imagen_url, stock } = producto;
  const isCatalog = variant === "catalog";
  // Con variaciones, el "+" abre el detalle para que el cliente elija una.
  const hasVariaciones = (producto.variaciones?.length ?? 0) > 0;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Ver detalle de ${nombre}`}
      onClick={() => open(producto)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(producto); } }}
      className={`group cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-verde)] rounded-2xl ${
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
        {hasVariaciones ? (
          <button
            type="button"
            aria-label="Ver opciones"
            onClick={(e) => { e.stopPropagation(); open(producto); }}
            className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-[var(--color-verde)] text-[var(--color-cremita)] flex items-center justify-center"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
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
    </div>
  );
}
