"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useCartStore } from "@/lib/stores/cartStore";
import type { Producto } from "@/lib/productos";

// Quick add para productos CON variaciones (nov-2026): el "+" de la tarjeta ya
// NO abre el ProductDrawer — despliega un mini selector sobre la misma imagen
// (patrón "elige tu talla" de tiendas): un tap en la variación agrega 1 al
// carrito y el panel se cierra solo mostrando el contador en el botón.
// El detalle completo sigue a un tap de distancia: la tarjeta abre el drawer.

const CIERRE_MS = 450;

export default function QuickAddVariaciones({ producto }: { producto: Producto }) {
  const { items, addItem } = useCartStore();
  const [open, setOpen] = useState(false);
  const [recienId, setRecienId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const primeraRef = useRef<HTMLButtonElement>(null);
  const cierraRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const variaciones = (producto.variaciones ?? []).filter((v) => v.stock > 0);

  // Unidades de ESTE producto en el carrito, sumando todas sus variaciones.
  const total = items
    .filter((i) => i.productoId === producto.id)
    .reduce((a, i) => a + i.cantidad, 0);

  const cantidadDe = (variacionId: string) =>
    items.find((i) => i.productoId === producto.id && i.variacionId === variacionId)?.cantidad ?? 0;

  // Cerrar con click fuera y con Escape; foco a la primera opción al abrir.
  useEffect(() => {
    if (!open) return;
    primeraRef.current?.focus();
    const fuera = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", fuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("pointerdown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [open]);

  useEffect(() => () => { if (cierraRef.current) clearTimeout(cierraRef.current); }, []);

  if (variaciones.length === 0) return null;

  const frena = (e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const agregar = (e: React.MouseEvent, v: (typeof variaciones)[number]) => {
    frena(e);
    if (cantidadDe(v.id) >= v.stock) return;
    addItem({
      productoId: producto.id,
      nombre: producto.nombre,
      precio: v.precio,
      imagenUrl: v.imagen_url ?? producto.imagen_url,
      stock: v.stock,
      variacionId: v.id,
      variacionNombre: v.nombre,
    });
    setRecienId(v.id);
    if (cierraRef.current) clearTimeout(cierraRef.current);
    cierraRef.current = setTimeout(() => {
      setOpen(false);
      setRecienId(null);
    }, CIERRE_MS);
  };

  return (
    <div ref={rootRef} onClick={frena} onPointerDown={(e) => e.stopPropagation()}>
      {/* Botón + con contador (mismo lenguaje que el badge del carrito del navbar) */}
      <button
        type="button"
        aria-label={
          total > 0
            ? `${total} en el carrito — agregar otra opción de ${producto.nombre}`
            : `Agregar al carrito: ${producto.nombre} — elige una opción`
        }
        aria-expanded={open}
        onClick={(e) => { frena(e); setOpen((o) => !o); }}
        className="absolute bottom-3 right-3 z-10 w-9 h-9 rounded-full bg-[var(--color-verde)] text-[var(--color-cremita)] flex items-center justify-center"
      >
        <motion.span
          animate={open ? { rotate: 45 } : { rotate: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="flex"
        >
          <PlusIcon className="w-4 h-4" />
        </motion.span>
        <AnimatePresence>
          {total > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
              className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--color-terracota)] text-white text-[10px] font-bold flex items-center justify-center leading-none"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={total}
                  initial={{ y: 6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -6, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {total}
                </motion.span>
              </AnimatePresence>
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Mini selector de variación, sobre la imagen de la tarjeta */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            role="group"
            aria-label={`Opciones de ${producto.nombre}`}
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 450, damping: 32 }}
            className="absolute inset-x-1.5 bottom-1.5 z-20 rounded-xl bg-white border border-[var(--color-border)] shadow-[0_8px_30px_rgba(0,0,0,0.14)] p-1.5"
          >
            <div className="flex items-center justify-between pl-2 pr-0.5 pb-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted)]">
                Elige una opción
              </p>
              <button
                type="button"
                aria-label="Cerrar opciones"
                onClick={(e) => { frena(e); setOpen(false); }}
                className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--color-muted)] hover:bg-[var(--color-cremita-3)]"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[186px] overflow-y-auto flex flex-col gap-0.5 overscroll-contain">
              {variaciones.map((v, idx) => {
                const enCarrito = cantidadDe(v.id);
                const tope = enCarrito >= v.stock;
                const recien = recienId === v.id;
                const foto = v.imagen_url ?? producto.imagen_url;
                return (
                  <button
                    key={v.id}
                    ref={idx === 0 ? primeraRef : undefined}
                    type="button"
                    disabled={tope}
                    aria-label={
                      tope
                        ? `${v.nombre}: sin más existencias`
                        : `Agregar ${producto.nombre} — ${v.nombre}, $${v.precio.toLocaleString()}`
                    }
                    onClick={(e) => agregar(e, v)}
                    className="w-full flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-[var(--color-cremita-3)] active:bg-[var(--color-cremita-2)] disabled:opacity-40 disabled:hover:bg-transparent"
                  >
                    <span className="relative w-8 h-8 flex-shrink-0 rounded-lg overflow-hidden bg-[var(--color-cremita-2)]">
                      {foto && <Image src={foto} alt="" fill sizes="32px" className="object-cover" />}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-sans text-xs font-medium text-[var(--color-text)] truncate">
                        {v.nombre}
                      </span>
                      <span className="block font-sans text-[11px] text-[var(--color-muted)]">
                        ${v.precio.toLocaleString()}{tope ? " · máximo disponible" : ""}
                      </span>
                    </span>
                    <span className="flex-shrink-0 w-6 flex justify-end">
                      {recien ? (
                        <motion.span
                          initial={{ scale: 0.4, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 600, damping: 20 }}
                        >
                          <CheckIcon className="w-4 h-4 text-[var(--color-verde)]" />
                        </motion.span>
                      ) : enCarrito > 0 ? (
                        <span className="min-w-[20px] h-5 px-1 rounded-full bg-[var(--color-verde)] text-[var(--color-cremita)] text-[10px] font-bold flex items-center justify-center">
                          {enCarrito}
                        </span>
                      ) : (
                        <PlusIcon className="w-3.5 h-3.5 text-[var(--color-muted)]" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
