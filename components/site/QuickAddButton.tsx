"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon, MinusIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useCartStore, cartKey } from "@/lib/stores/cartStore";
import { volarAlCarrito } from "@/lib/vuelo-carrito";

interface Props {
  productoId: string;
  nombre: string;
  precio: number;
  imagenUrl: string | null;
  stock: number;
  /** Producto con UNA sola variación: se agrega directo esa variación (nov-2026). */
  variacionId?: string | null;
  variacionNombre?: string | null;
}

/** − (36) + número (24) + + (36). */
const ANCHO_ABIERTO = 96;

export default function QuickAddButton({ productoId, nombre, precio, imagenUrl, stock, variacionId = null, variacionNombre = null }: Props) {
  const { items, addItem, updateCantidad, openCart } = useCartStore();
  const [justAdded, setJustAdded] = useState(false);

  const key = variacionId ? `${productoId}::${variacionId}` : productoId;
  const cartItem = items.find((i) => cartKey(i) === key);
  const cantidad = cartItem?.cantidad ?? 0;
  const expanded = cantidad > 0;
  const atLimit = cantidad >= stock;

  if (stock <= 0) return null;

  const agrega = (e: React.MouseEvent) => {
    addItem({ productoId, nombre, precio, imagenUrl, stock, variacionId, variacionNombre });
    volarAlCarrito(e.currentTarget as HTMLElement, imagenUrl);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (atLimit) return;
    agrega(e);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 600);
  };

  const handleMinus = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateCantidad(key, cantidad - 1);
  };

  const handlePlus = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (atLimit) return;
    agrega(e);
  };

  const handleOpenCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openCart();
  };

  return (
    <div
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
      className="absolute bottom-3 right-3 z-10 flex items-center overflow-hidden"
      style={{
        background: "var(--color-verde)",
        borderRadius: 999,
        height: 36,
      }}
    >
      {/* mode="wait": primero se cierra una forma y luego abre la otra. Antes
          el contenedor animaba su tamaño con `layout` (transform de escala) y,
          al quitar el último, la pastilla se deformaba en óvalo un rato. Ahora
          el ancho se anima de verdad (36 ⇄ ANCHO_ABIERTO) y nada se estira. */}
      <AnimatePresence mode="wait" initial={false}>
        {expanded ? (
          // ── Expanded: − [n] + ──────────────────────────
          <motion.div
            key="expanded"
            initial={{ width: 36, opacity: 0 }}
            animate={{ width: ANCHO_ABIERTO, opacity: 1 }}
            exit={{ width: 36, opacity: 0 }}
            transition={{ width: { duration: 0.26, ease: [0.32, 0.72, 0, 1] }, opacity: { duration: 0.14 } }}
            // justify-end: crece hacia la izquierda y el + queda donde estaba.
            className="flex items-center justify-end overflow-hidden"
          >
            <div className="flex items-center flex-shrink-0">
            {/* − (con 1 en el carrito es un bote: ese toque lo quita del carrito) */}
            <button
              type="button"
              onClick={handleMinus}
              aria-label={cantidad === 1 ? `Quitar del carrito: ${nombre}` : `Quitar uno: ${nombre}`}
              className="w-9 h-9 flex items-center justify-center text-[var(--color-cremita)] active:opacity-70 flex-shrink-0 cursor-pointer"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={cantidad === 1 ? "bote" : "menos"}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex"
                >
                  {cantidad === 1 ? <TrashIcon className="w-3.5 h-3.5" /> : <MinusIcon className="w-3.5 h-3.5" />}
                </motion.span>
              </AnimatePresence>
            </button>

            {/* Número */}
            <button
              type="button"
              onClick={handleOpenCart}
              aria-label={`${cantidad} en el carrito — ver carrito`}
              className="w-6 h-9 text-center overflow-hidden flex items-center justify-center cursor-pointer"
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
              type="button"
              onClick={handlePlus}
              aria-label={atLimit ? `Sin más existencias de ${nombre}` : `Agregar uno más: ${nombre}`}
              disabled={atLimit}
              className="w-9 h-9 flex items-center justify-center flex-shrink-0 transition-opacity disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              style={{ color: "var(--color-cremita)" }}
            >
              <PlusIcon className="w-3.5 h-3.5" />
            </button>
            </div>
          </motion.div>
        ) : (
          // ── Collapsed: solo + ──────────────────────────
          <motion.button
            key="add"
            type="button"
            aria-label={`Agregar al carrito: ${nombre}`}
            onClick={handleAdd}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="boton-mas h-9 px-[10px] flex items-center justify-center text-[var(--color-cremita)] cursor-pointer"
          >
            <motion.div
              animate={justAdded ? { rotate: 90, scale: 1.2 } : { rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 600, damping: 20 }}
            >
              <PlusIcon className="w-4 h-4" />
            </motion.div>
            <span aria-hidden className="boton-mas-texto font-sans text-[13px] font-semibold">Agregar</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
