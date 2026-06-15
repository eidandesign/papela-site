"use client";

import Image from "next/image";
import { useState } from "react";
import type { Producto } from "@/lib/productos";
import QuickAddButton from "./QuickAddButton";
import { useProductDrawerStore } from "@/lib/stores/productDrawerStore";

export default function ProductosCatalog({ productos, categorias }: { productos: Producto[]; categorias: string[] }) {
  const [activa, setActiva] = useState<string | null>(null);
  const openDrawer = useProductDrawerStore((s) => s.open);

  const filtrados = activa ? productos.filter((p) => p.categoria === activa) : productos;

  return (
    <>
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-10">
        <button
          onClick={() => setActiva(null)}
          className={`text-[11px] font-semibold uppercase tracking-widest px-4 py-2 rounded-full border transition-colors duration-200 ${
            activa === null
              ? "bg-[var(--color-verde)] text-[var(--color-cremita)] border-[var(--color-verde)]"
              : "bg-transparent text-[var(--color-muted)] border-[var(--color-border)] hover:border-[var(--color-verde)] hover:text-[var(--color-verde)]"
          }`}
        >
          Todos
        </button>
        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiva(cat)}
            className={`text-[11px] font-semibold uppercase tracking-widest px-4 py-2 rounded-full border transition-colors duration-200 ${
              activa === cat
                ? "bg-[var(--color-verde)] text-[var(--color-cremita)] border-[var(--color-verde)]"
                : "bg-transparent text-[var(--color-muted)] border-[var(--color-border)] hover:border-[var(--color-verde)] hover:text-[var(--color-verde)]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtrados.length === 0 ? (
        <p className="text-[var(--color-muted)] py-12 text-center">No hay productos en esta categoría.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtrados.map((p) => (
            <div
              key={p.id}
              onClick={() => openDrawer(p)}
              className="group cursor-pointer"
            >
              <div className="aspect-[3/4] rounded-2xl bg-[var(--color-cremita-2)] overflow-hidden mb-3 relative">
                {p.imagen_url ? (
                  <Image
                    src={p.imagen_url}
                    alt={p.nombre}
                    fill
                    sizes="(max-width: 768px) 45vw, (max-width: 1024px) 30vw, 22vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[var(--color-cremita)] to-[var(--color-cremita-2)]" />
                )}
                <QuickAddButton
                  productoId={p.id}
                  nombre={p.nombre}
                  precio={p.precio}
                  imagenUrl={p.imagen_url ?? null}
                  stock={p.stock}
                />
              </div>
              <p className="text-sm font-medium text-[var(--color-text)] leading-tight">{p.nombre}</p>
              <p className="text-sm text-[var(--color-muted)] mt-0.5">${p.precio.toLocaleString()} MXN</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
