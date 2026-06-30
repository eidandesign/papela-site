"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/solid";
import { useCartStore, cartKey } from "@/lib/stores/cartStore";

interface Props {
  productoId: string;
  nombre: string;
  precio: number;
  imagenUrl: string | null;
  stock: number;
}

export default function QuickAddButton({ productoId, nombre, precio, imagenUrl, stock }: Props) {
  const { items, addItem, updateCantidad, openCart } = useCartStore();
  const [justAdded, setJustAdded] = useState(false);

  const cartItem = items.find((i) => cartKey(i) === productoId);
  const cantidad = cartItem?.cantidad ?? 0;
  const expanded = cantidad > 0;
  const atLimit = cantidad >= stock;

  if (stock <= 0) return null;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (atLimit) return;
    addItem({ productoId, nombre, precio, imagenUrl });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 600);
  };

  const handleMinus = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateCantidad(productoId, cantidad - 1);
  };

  const handlePlus = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ productoId, nombre, precio, imagenUrl });
  };

  const handleOpenCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openCart();
  };

  return (
    <motion.div
      layout
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
      className="absolute bottom-3 right-3 flex items-center overflow-hidden"
      style={{
        background: "var(--color-verde)",
        borderRadius: 999,
        height: 36,
      }}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {expanded ? (
          // ── Expanded: − [n] + ──────────────────────────
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center"
          >
            {/* − */}
            <button
              onClick={handleMinus}
              className="w-9 h-9 flex items-center justify-center text-[var(--color-cremita)] active:opacity-70 flex-shrink-0"
            >
              <MinusIcon className="w-3.5 h-3.5" />
            </button>

            {/* Número */}
            <button
              onClick={handleOpenCart}
              className="min-w-[20px] text-center overflow-hidden flex items-center justify-center"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={cantidad}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -8, opacity: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="font-sans text-sm font-semibold text-[var(--color-cremita)] block"
                >
                  {cantidad}
                </motion.span>
              </AnimatePresence>
            </button>

            {/* + */}
            <button
              onClick={handlePlus}
              disabled={atLimit}
              className="w-9 h-9 flex items-center justify-center flex-shrink-0 transition-opacity disabled:opacity-30"
              style={{ color: "var(--color-cremita)" }}
            >
              <PlusIcon className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ) : (
          // ── Collapsed: solo + ──────────────────────────
          <motion.button
            key="add"
            onClick={handleAdd}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="w-9 h-9 flex items-center justify-center text-[var(--color-cremita)]"
          >
            <motion.div
              animate={justAdded ? { rotate: 90, scale: 1.2 } : { rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 600, damping: 20 }}
            >
              <PlusIcon className="w-4 h-4" />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
