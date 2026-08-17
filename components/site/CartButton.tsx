"use client";

import { useEffect, useState } from "react";
import { ShoppingBagIcon } from "@heroicons/react/24/solid";
import { useCartStore } from "@/lib/stores/cartStore";
import CartDrawer from "./CartDrawer";

export default function CartButton({ color = "rgba(255,255,255,0.9)" }: { color?: string }) {
  const { openCart, totalItems } = useCartStore();
  // El carrito vive en localStorage: el server siempre renderiza sin badge.
  // Mostrarlo hasta después de montar evita el mismatch de hidratación.
  const [mounted, setMounted] = useState(false);
  // Intentional: gates the persisted-cart badge so SSR and first client render match.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);
  const count = mounted ? totalItems() : 0;

  return (
    <>
      <button
        onClick={openCart}
        aria-label="Abrir carrito"
        className="relative p-1 flex items-center justify-center"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <ShoppingBagIcon style={{ color, width: 22, height: 22 }} />
        {count > 0 && (
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--color-terracota)] text-white text-[9px] font-bold flex items-center justify-center leading-none"
          >
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>
      <CartDrawer />
    </>
  );
}
