"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { Producto } from "@/lib/productos";

export default function ProductosCatalog({ productos, categorias }: { productos: Producto[]; categorias: string[] }) {
  const [activa, setActiva] = useState<string | null>(null);

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
    </>
  );
}
