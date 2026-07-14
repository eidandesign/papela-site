"use client";
import { create } from "zustand";
import type { Horario } from "@/lib/clases";
import type { TipoClasePublico } from "@/lib/clases-tipos";

interface ReservaPayload {
  horarios: Horario[];
  claseNombre: string;
  whatsapp: string | null;
  tipos: TipoClasePublico[];
}

interface ReservaModalStore {
  data: ReservaPayload | null;
  open: (payload: ReservaPayload) => void;
  close: () => void;
}

export const useReservaModalStore = create<ReservaModalStore>((set) => ({
  data: null,
  open: (payload) => set({ data: payload }),
  close: () => set({ data: null }),
}));
