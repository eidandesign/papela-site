"use client";

import { useState } from "react";
import { ShoppingBagIcon, CheckIcon } from "@heroicons/react/24/solid";
import { useCartStore, cartKey } from "@/lib/stores/cartStore";

interface Props {
  productoId: string;
  nombre: string;
  precio: number;
  imagenUrl: string | null;
  stock: number;
  fullWidth?: boolean;
  variacionId?: string | null;
  variacionNombre?: string | null;
}

export default function AddToCartButton({ productoId, nombre, precio, imagenUrl, stock, fullWidth, variacionId, variacionNombre }: Props) {
  const [added, setAdded] = useState(false);
  const { items, addItem, openCart } = useCartStore();

  const key = cartKey({ productoId, variacionId });
  const cantidad = items.find((i) => cartKey(i) === key)?.cantidad ?? 0;
  const atLimit = cantidad >= stock;

  const handleAdd = () => {
    if (atLimit) return;
    addItem({ productoId, nombre, precio, imagenUrl, variacionId, variacionNombre });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      openCart();
    }, 700);
  };

  if (stock <= 0) {
    return (
      <button
        disabled
        className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-[var(--color-border)] text-[var(--color-muted)] px-7 py-3.5 text-sm font-semibold cursor-not-allowed"
      >
        Agotado
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      disabled={atLimit}
      className={`group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-verde)] text-[var(--color-cremita)] px-7 py-3.5 text-sm font-semibold overflow-hidden relative transition-all disabled:opacity-60 disabled:cursor-not-allowed ${fullWidth ? "flex-1" : "self-start"}`}
    >
      <span className="absolute inset-0 bg-black/10 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
      <span className="relative flex items-center gap-2">
        {added ? (
          <>
            <CheckIcon className="w-4 h-4" />
            Agregado
          </>
        ) : (
          <>
            <ShoppingBagIcon className="w-4 h-4" />
            Agregar al carrito
          </>
        )}
      </span>
    </button>
  );
}
