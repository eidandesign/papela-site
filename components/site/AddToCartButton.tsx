"use client";

import { useState } from "react";
import { ShoppingBagIcon, CheckIcon } from "@heroicons/react/24/solid";
import { useCartStore } from "@/lib/stores/cartStore";

interface Props {
  productoId: string;
  nombre: string;
  precio: number;
  imagenUrl: string | null;
  enStock: boolean;
}

export default function AddToCartButton({ productoId, nombre, precio, imagenUrl, enStock }: Props) {
  const [added, setAdded] = useState(false);
  const { addItem, openCart } = useCartStore();

  const handleAdd = () => {
    addItem({ productoId, nombre, precio, imagenUrl });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      openCart();
    }, 700);
  };

  if (!enStock) {
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
      className="group inline-flex items-center justify-center gap-2 self-start rounded-full bg-[var(--color-verde)] text-[var(--color-cremita)] px-7 py-3.5 text-sm font-semibold overflow-hidden relative transition-all"
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
