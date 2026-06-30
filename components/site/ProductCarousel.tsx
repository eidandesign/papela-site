"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import ProductCard from "./ProductCard";
import type { Producto } from "@/lib/productos";

/**
 * Carrusel de una sola fila con scroll horizontal + flechas circulares (verde).
 * Mobile: swipe nativo (flechas ocultas). Desktop: flechas para navegar.
 * Sigue el patrón de overflow-x del proyecto (spacers en lugar de padding).
 */
export default function ProductCarousel({ productos }: { productos: Producto[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    // tolerancia amplia a la izquierda: el snap deja ~16px de offset en reposo
    setCanLeft(scrollLeft > 32);
    setCanRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, productos.length]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex gap-8 overflow-x-auto snap-x snap-mandatory pb-2"
        style={{ scrollbarWidth: "none", scrollPaddingLeft: "5vw" }}
      >
        <div className="flex-shrink-0 w-[5vw]" aria-hidden="true" />
        {productos.map((p) => (
          <div key={p.id} className="snap-start">
            <ProductCard producto={p} variant="catalog" />
          </div>
        ))}
        <div className="flex-shrink-0 w-[5vw]" aria-hidden="true" />
      </div>

      {/* Flechas (solo desktop) */}
      <button
        type="button"
        aria-label="Anterior"
        onClick={() => scrollBy(-1)}
        className={`hidden md:flex absolute left-[calc(5vw-20px)] top-[40%] -translate-y-1/2 w-10 h-10 rounded-full bg-[var(--color-verde)] text-[var(--color-cremita)] items-center justify-center shadow-lg transition-opacity ${
          canLeft ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>
      <button
        type="button"
        aria-label="Siguiente"
        onClick={() => scrollBy(1)}
        className={`hidden md:flex absolute right-[calc(5vw-20px)] top-[40%] -translate-y-1/2 w-10 h-10 rounded-full bg-[var(--color-verde)] text-[var(--color-cremita)] items-center justify-center shadow-lg transition-opacity ${
          canRight ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
