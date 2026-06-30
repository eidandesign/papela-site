"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productoId: string;
  nombre: string;
  precio: number;
  imagenUrl: string | null;
  cantidad: number;
  // Variación elegida (opcional). Una variación es una línea distinta del carrito.
  variacionId?: string | null;
  variacionNombre?: string | null;
}

export type TipoEnvio = "recoger" | "envio";

export const COSTO_ENVIO = 80;

/**
 * Clave única de una línea del carrito. Un producto sin variación usa su id;
 * con variación, `${productoId}::${variacionId}`, así cada variante es su
 * propia línea. Compatible con líneas viejas (sin variacionId → solo productoId).
 */
export function cartKey(item: { productoId: string; variacionId?: string | null }): string {
  return item.variacionId ? `${item.productoId}::${item.variacionId}` : item.productoId;
}

interface CartStore {
  items: CartItem[];
  tipoEnvio: TipoEnvio;
  isOpen: boolean;

  addItem: (item: Omit<CartItem, "cantidad">) => void;
  removeItem: (key: string) => void;
  updateCantidad: (key: string, cantidad: number) => void;
  clearCart: () => void;
  setTipoEnvio: (tipo: TipoEnvio) => void;
  openCart: () => void;
  closeCart: () => void;

  subtotal: () => number;
  total: () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      tipoEnvio: "recoger",
      isOpen: false,

      addItem: (item) => {
        set((s) => {
          const key = cartKey(item);
          const existing = s.items.find((i) => cartKey(i) === key);
          if (existing) {
            return {
              items: s.items.map((i) =>
                cartKey(i) === key ? { ...i, cantidad: i.cantidad + 1 } : i
              ),
            };
          }
          return { items: [...s.items, { ...item, cantidad: 1 }] };
        });
      },

      removeItem: (key) => {
        set((s) => ({ items: s.items.filter((i) => cartKey(i) !== key) }));
      },

      updateCantidad: (key, cantidad) => {
        if (cantidad < 1) {
          get().removeItem(key);
          return;
        }
        set((s) => ({
          items: s.items.map((i) =>
            cartKey(i) === key ? { ...i, cantidad } : i
          ),
        }));
      },

      clearCart: () => set({ items: [], tipoEnvio: "recoger" }),

      setTipoEnvio: (tipo) => set({ tipoEnvio: tipo }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      subtotal: () => get().items.reduce((acc, i) => acc + i.precio * i.cantidad, 0),
      total: () => {
        const s = get();
        return s.subtotal() + (s.tipoEnvio === "envio" ? COSTO_ENVIO : 0);
      },
      totalItems: () => get().items.reduce((acc, i) => acc + i.cantidad, 0),
    }),
    {
      name: "papela-cart",
      partialize: (s: CartStore) => ({ items: s.items, tipoEnvio: s.tipoEnvio }),
    }
  )
);
