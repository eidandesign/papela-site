"use client";
import { create } from "zustand";
import type { Producto } from "@/lib/productos";

interface ProductDrawerStore {
  product: Producto | null;
  open: (product: Producto) => void;
  close: () => void;
}

export const useProductDrawerStore = create<ProductDrawerStore>((set) => ({
  product: null,
  open: (product) => set({ product }),
  close: () => set({ product: null }),
}));
