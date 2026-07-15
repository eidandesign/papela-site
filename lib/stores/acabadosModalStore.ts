"use client";
import { create } from "zustand";

export interface PaqueteSeleccionado {
  nombre: string;
  precio: number;
}

interface AcabadosModalStore {
  paquete: PaqueteSeleccionado | null;
  open: (paquete: PaqueteSeleccionado) => void;
  close: () => void;
}

export const useAcabadosModalStore = create<AcabadosModalStore>((set) => ({
  paquete: null,
  open: (paquete) => set({ paquete }),
  close: () => set({ paquete: null }),
}));
