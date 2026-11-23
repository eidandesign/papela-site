"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
        // Destino del efecto "vuela al carrito" (lib/vuelo-carrito.ts)
        data-carrito-destino
        // p-2.5 = área táctil de ~44px; el badge vive DENTRO del padding, así ya
        // no se encima al dibujo de la bolsa ni se recorta contra el borde.
        className="relative p-2.5 -m-1.5 flex items-center justify-center"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <ShoppingBagIcon style={{ color, width: 22, height: 22 }} />
        {count > 0 && (
          // key={count} remonta el badge: pulso al cambiar el total (feedback
          // de llegada del vuelo al carrito).
          <motion.span
            key={count}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.45, 1] }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--color-terracota)] text-white text-[10px] font-bold flex items-center justify-center leading-none"
          >
            {count > 9 ? "9+" : count}
          </motion.span>
        )}
      </button>
      <CartDrawer />
    </>
  );
}
