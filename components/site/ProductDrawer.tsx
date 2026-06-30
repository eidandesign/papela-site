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
  const [selectedVarId, setSelectedVarId] = useState<string | null>(null);
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

  // Al abrir/cambiar de producto: seleccionar la primera variación disponible.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    const vs = product?.variaciones ?? [];
    setSelectedVarId(vs.length > 0 ? vs[0].id : null);
  }, [product?.id]);

  if (!mounted) return null;

  // ── Valores a mostrar: la variación seleccionada manda; si no hay, el producto ──
  const variaciones = product?.variaciones ?? [];
  const selectedVar = variaciones.find((v) => v.id === selectedVarId) ?? null;
  const dispImagen = selectedVar?.imagen_url ?? product?.imagen_url ?? null;
  const dispPrecio = selectedVar?.precio ?? product?.precio ?? 0;
  const dispStock = selectedVar?.stock ?? product?.stock ?? 0;
  const dispColor = selectedVar?.color ?? product?.color ?? null;
  const dispMedida = selectedVar?.tamano ?? product?.medida ?? null;
  const dispNombreCompleto = selectedVar
    ? `${product?.nombre} · ${selectedVar.nombre}`
    : product?.nombre ?? "";

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
              {dispImagen ? (
                <Image
                  src={dispImagen}
                  alt={dispNombreCompleto}
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
                  ${dispPrecio.toLocaleString()} MXN
                </p>
              </div>

              {/* Variaciones — thumbnails (solo en stock) */}
              {variaciones.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
                    Opciones{selectedVar ? `: ${selectedVar.nombre}` : ""}
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {variaciones.map((v) => {
                      const activa = v.id === selectedVarId;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVarId(v.id)}
                          aria-label={v.nombre}
                          aria-pressed={activa}
                          title={v.nombre}
                          className={`relative w-16 h-16 rounded-xl overflow-hidden bg-[var(--color-cremita-2)] transition-all ${
                            activa
                              ? "ring-2 ring-[var(--color-verde)] ring-offset-2 ring-offset-[var(--color-bg)]"
                              : "ring-1 ring-[var(--color-border)] hover:ring-[var(--color-verde)]/50"
                          }`}
                        >
                          {v.imagen_url ? (
                            <Image src={v.imagen_url} alt={v.nombre} fill sizes="64px" className="object-cover" />
                          ) : (
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] text-center text-[var(--color-muted)] px-1">
                              {v.nombre}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Description */}
              {product.descripcion && (
                <p className="font-sans text-[17px] text-[var(--color-text)] leading-relaxed">
                  {product.descripcion}
                </p>
              )}

              {/* Attributes */}
              {(dispColor || dispMedida) && (
                <dl className="flex flex-wrap gap-x-8 gap-y-3">
                  {dispColor && (
                    <div className="flex flex-col gap-0.5">
                      <dt className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">Color</dt>
                      <dd className="font-sans text-sm text-[var(--color-text)] font-medium">{dispColor}</dd>
                    </div>
                  )}
                  {dispMedida && (
                    <div className="flex flex-col gap-0.5">
                      <dt className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">Medida</dt>
                      <dd className="font-sans text-sm text-[var(--color-text)] font-medium">{dispMedida}</dd>
                    </div>
                  )}
                </dl>
              )}

              {/* Stock status */}
              <p className={`text-sm font-sans flex items-center gap-1.5 ${dispStock > 0 ? "text-[var(--color-verde)]" : "text-[var(--color-muted)]"}`}>
                <span>{dispStock > 0 ? "✓" : "✕"}</span>
                {dispStock > 0
                  ? dispStock <= 3
                    ? `Solo ${dispStock} disponible${dispStock > 1 ? "s" : ""}`
                    : "Disponible"
                  : "Agotado"}
              </p>

            </div>

            {/* CTAs — fixed footer */}
            <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3 px-6 py-5 border-t border-[var(--color-border)] bg-[var(--color-bg)]">
              <a
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola Papela 🌿 me interesa: ${dispNombreCompleto}`)}`}
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
                nombre={dispNombreCompleto}
                precio={dispPrecio}
                imagenUrl={dispImagen}
                stock={dispStock}
                variacionId={selectedVar?.id ?? null}
                variacionNombre={selectedVar?.nombre ?? null}
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
