"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useProductDrawerStore } from "@/lib/stores/productDrawerStore";
import AddToCartButton from "./AddToCartButton";

const WHATSAPP = "522211865590";

export default function ProductDrawer() {
  const [mounted, setMounted] = useState(false);
  const { product, close } = useProductDrawerStore();
  const isOpen = product !== null;

  // Intentional: gates the SSR portal so it renders client-side only.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && product && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
            className="fixed inset-0 bg-black/40 z-[9998]"
          />

          {/* Panel */}
          <motion.aside
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
            className="fixed right-0 top-0 h-full left-[15%] sm:left-auto sm:w-full sm:max-w-lg bg-[var(--color-bg)] z-[9999] flex flex-col shadow-2xl rounded-l-3xl sm:rounded-none"
          >
            {/* Image + close button on top */}
            <div className="relative w-full aspect-square flex-shrink-0 bg-[var(--color-cremita-2)]">
              {product.imagen_url ? (
                <Image
                  src={product.imagen_url}
                  alt={product.nombre}
                  fill
                  sizes="(max-width: 512px) 100vw, 512px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[var(--color-cremita)] to-[var(--color-cremita-2)]" />
              )}
              <button
                onClick={close}
                aria-label="Cerrar"
                className="absolute top-4 right-4 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-5 px-6 py-6 flex-1 overflow-y-auto">
              {/* Name + Price */}
              <div>
                <h2 className="font-serif font-extralight text-[clamp(1.8rem,5vw,2.4rem)] text-[#403C3C] leading-tight">
                  {product.nombre}
                </h2>
                <p className="font-sans text-2xl text-[var(--color-verde)] mt-2">
                  ${product.precio.toLocaleString()} MXN
                </p>
              </div>

              {/* Description */}
              {product.descripcion && (
                <p className="font-sans text-[17px] text-[var(--color-text)] leading-relaxed">
                  {product.descripcion}
                </p>
              )}

              {/* Attributes */}
              {(product.color || product.medida) && (
                <dl className="flex flex-wrap gap-x-8 gap-y-3">
                  {product.color && (
                    <div className="flex flex-col gap-0.5">
                      <dt className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">Color</dt>
                      <dd className="font-sans text-sm text-[var(--color-text)] font-medium">{product.color}</dd>
                    </div>
                  )}
                  {product.medida && (
                    <div className="flex flex-col gap-0.5">
                      <dt className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">Medida</dt>
                      <dd className="font-sans text-sm text-[var(--color-text)] font-medium">{product.medida}</dd>
                    </div>
                  )}
                </dl>
              )}

              {/* Stock status */}
              <p className={`text-sm font-sans flex items-center gap-1.5 ${product.stock > 0 ? "text-[var(--color-verde)]" : "text-[var(--color-muted)]"}`}>
                <span>{product.stock > 0 ? "✓" : "✕"}</span>
                {product.stock > 0
                  ? product.stock <= 3
                    ? `Solo ${product.stock} disponible${product.stock > 1 ? "s" : ""}`
                    : "Disponible"
                  : "Agotado"}
              </p>

            </div>

            {/* CTAs — fixed footer */}
            <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3 px-6 py-5 border-t border-[var(--color-border)] bg-[var(--color-bg)]">
              <a
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola Papela 🌿 me interesa: ${product.nombre}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="sm:flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-verde)] text-[var(--color-verde)] px-5 py-3.5 text-sm font-semibold hover:bg-[var(--color-verde)]/5 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Consultar por WhatsApp
              </a>
              <AddToCartButton
                productoId={product.id}
                nombre={product.nombre}
                precio={product.precio}
                imagenUrl={product.imagen_url ?? null}
                stock={product.stock}
                fullWidth
              />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
