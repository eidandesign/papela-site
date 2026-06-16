"use client";

import Image from "next/image";
import QuickAddButton from "./QuickAddButton";
import { useProductDrawerStore } from "@/lib/stores/productDrawerStore";
import type { Producto } from "@/lib/productos";

export default function ProductCard({
  producto,
  fullWidth = false,
}: {
  producto: Producto;
  fullWidth?: boolean;
}) {
  const open = useProductDrawerStore((s) => s.open);
  const { id, nombre, precio, imagen_url, stock } = producto;

  return (
    <div
      onClick={() => open(producto)}
      className={`group cursor-pointer ${
        fullWidth ? "w-full" : "flex-shrink-0 w-[220px] md:w-[240px]"
      }`}
    >
      <div className="w-full aspect-[3/4] rounded-2xl bg-[var(--color-cremita-2)] mb-3 overflow-hidden relative">
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
        <QuickAddButton
          productoId={id}
          nombre={nombre}
          precio={precio}
          imagenUrl={imagen_url}
          stock={stock}
        />
      </div>
      <p className="text-sm font-medium text-[var(--color-text)] leading-tight">{nombre}</p>
      <p className="text-sm text-[var(--color-muted)] mt-0.5">${precio.toLocaleString()} MXN</p>
    </div>
  );
}
