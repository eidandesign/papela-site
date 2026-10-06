"use client";
import { create } from "zustand";
import type { Horario } from "@/lib/clases";
import type { TipoClasePublico } from "@/lib/clases-tipos";

/** Paquete que el alumno eligió en la página (precio total = precio + inscripción). */
export interface PaqueteReserva {
  id: string;
  nombre: string;
  precio: number;
  inscripcion: number;
  sesiones: number;
}

interface ReservaPayload {
  horarios: Horario[];
  claseNombre: string;
  whatsapp: string | null;
  tipos: TipoClasePublico[];
  // Clase ya elegida desde su tarjeta (la ventana abre con ella seleccionada).
  tipoInicial?: string | null;
  // Si viene, se aparta un PAQUETE: se elige la primera clase y se paga el paquete.
  paquete?: PaqueteReserva | null;
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
