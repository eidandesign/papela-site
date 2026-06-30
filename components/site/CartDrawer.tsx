"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { XMarkIcon, MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useCartStore, COSTO_ENVIO, cartKey } from "@/lib/stores/cartStore";

export default function CartDrawer() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const {
    isOpen, closeCart, items, tipoEnvio,
    updateCantidad, removeItem, setTipoEnvio,
    subtotal, total, totalItems,
  } = useCartStore();

  // Intentional: gates the SSR portal so it renders client-side only.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleCheckout = () => {
    closeCart();
    router.push("/tienda/checkout");
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 z-[9998]"
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[var(--color-bg)] z-[9999] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)]">
              <h2 className="font-serif font-extralight text-2xl text-[#403C3C]">
                Tu carrito
                {totalItems() > 0 && (
                  <span className="ml-2 text-base text-[var(--color-muted)]">({totalItems()})</span>
                )}
              </h2>
              <button
                onClick={closeCart}
                aria-label="Cerrar carrito"
                className="p-2 rounded-full hover:bg-[var(--color-cremita-2)] transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-[var(--color-text)]" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <p className="font-serif font-extralight text-3xl text-[#403C3C]/40">vacío</p>
                  <p className="text-sm text-[var(--color-muted)]">
                    Agrega productos desde el catálogo
                  </p>
                </div>
              ) : (
                <ul className="flex flex-col gap-4">
                  {items.map((item) => (
                    <li
                      key={cartKey(item)}
                      className="flex gap-4 py-4 border-b border-[var(--color-border)] last:border-0"
                    >
                      {/* Image */}
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-[var(--color-cremita-2)]">
                        {item.imagenUrl ? (
                          <Image
                            src={item.imagenUrl}
                            alt={item.nombre}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-sm font-medium text-[var(--color-text)] leading-snug truncate">
                          {item.nombre}
                        </p>
                        <p className="font-sans text-sm text-[var(--color-verde)] mt-0.5">
                          ${(item.precio * item.cantidad).toLocaleString()} MXN
                        </p>
                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateCantidad(cartKey(item), item.cantidad - 1)}
                            className="w-7 h-7 rounded-full border border-[var(--color-border)] flex items-center justify-center hover:border-[var(--color-verde)] transition-colors"
                          >
                            <MinusIcon className="w-3 h-3 text-[var(--color-text)]" />
                          </button>
                          <span className="font-sans text-sm w-4 text-center">{item.cantidad}</span>
                          <button
                            onClick={() => updateCantidad(cartKey(item), item.cantidad + 1)}
                            className="w-7 h-7 rounded-full border border-[var(--color-border)] flex items-center justify-center hover:border-[var(--color-verde)] transition-colors"
                          >
                            <PlusIcon className="w-3 h-3 text-[var(--color-text)]" />
                          </button>
                          <button
                            onClick={() => removeItem(cartKey(item))}
                            className="ml-auto p-1 rounded-full hover:bg-[var(--color-cremita-2)] transition-colors"
                            aria-label="Eliminar"
                          >
                            <TrashIcon className="w-4 h-4 text-[var(--color-muted)]" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-[var(--color-border)] bg-[var(--color-bg)]">
                {/* Envío selector */}
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-2">
                    Entrega
                  </p>
                  <div className="flex flex-col gap-2">
                    {([
                      { value: "recoger", label: "Recoger en el atelier", sub: "Puebla, sin costo" },
                      { value: "envio", label: "Envío nacional", sub: `$${COSTO_ENVIO} MXN` },
                    ] as const).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setTipoEnvio(opt.value)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-colors ${
                          tipoEnvio === opt.value
                            ? "border-[var(--color-verde)] bg-[var(--color-verde)]/5"
                            : "border-[var(--color-border)] hover:border-[var(--color-verde)]/50"
                        }`}
                      >
                        <span className="font-sans text-sm text-[var(--color-text)]">{opt.label}</span>
                        <span
                          className={`font-sans text-sm font-medium ${
                            tipoEnvio === opt.value
                              ? "text-[var(--color-verde)]"
                              : "text-[var(--color-muted)]"
                          }`}
                        >
                          {opt.sub}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="flex flex-col gap-1 mb-4 text-sm font-sans">
                  <div className="flex justify-between text-[var(--color-muted)]">
                    <span>Subtotal</span>
                    <span>${subtotal().toLocaleString()} MXN</span>
                  </div>
                  <div className="flex justify-between text-[var(--color-muted)]">
                    <span>Envío</span>
                    <span>{tipoEnvio === "envio" ? `$${COSTO_ENVIO} MXN` : "Gratis"}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-[var(--color-text)] text-base mt-1 pt-2 border-t border-[var(--color-border)]">
                    <span>Total</span>
                    <span>${total().toLocaleString()} MXN</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="group w-full relative overflow-hidden rounded-full bg-[var(--color-verde)] text-[var(--color-cremita)] py-3.5 font-sans text-sm font-semibold"
                >
                  <span className="absolute inset-0 bg-black/10 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
                  <span className="relative">Continuar al checkout</span>
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
