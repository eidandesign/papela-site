"use client";

import { ShoppingBagIcon } from "@heroicons/react/24/solid";
import { useCartStore } from "@/lib/stores/cartStore";
import CartDrawer from "./CartDrawer";

export default function CartButton({ color = "rgba(255,255,255,0.9)" }: { color?: string }) {
  const { openCart, totalItems } = useCartStore();
  const count = totalItems();

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
