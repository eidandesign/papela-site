"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productoId: string;
  nombre: string;
  precio: number;
  imagenUrl: string | null;
  cantidad: number;
}

export type TipoEnvio = "recoger" | "envio";

export const COSTO_ENVIO = 80;

interface CartStore {
  items: CartItem[];
  tipoEnvio: TipoEnvio;
  isOpen: boolean;

  addItem: (item: Omit<CartItem, "cantidad">) => void;
  removeItem: (productoId: string) => void;
  updateCantidad: (productoId: string, cantidad: number) => void;
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
          const existing = s.items.find((i) => i.productoId === item.productoId);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.productoId === item.productoId
                  ? { ...i, cantidad: i.cantidad + 1 }
                  : i
              ),
            };
          }
          return { items: [...s.items, { ...item, cantidad: 1 }] };
        });
      },

      removeItem: (productoId) => {
        set((s) => ({ items: s.items.filter((i) => i.productoId !== productoId) }));
      },

      updateCantidad: (productoId, cantidad) => {
        if (cantidad < 1) {
          get().removeItem(productoId);
          return;
        }
        set((s) => ({
          items: s.items.map((i) =>
            i.productoId === productoId ? { ...i, cantidad } : i
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
