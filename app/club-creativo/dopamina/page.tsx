import type { Metadata } from "next";
import DopaminaJuego from "@/components/site/dopamina/DopaminaJuego";

export const metadata: Metadata = {
  title: { absolute: "Dopamina — Club Creativo · Papela Atelier" },
  description:
    "Explota tres burbujas misteriosas, descubre una combinación inesperada y crea algo antes de que termine el tiempo. El juego creativo del Club Creativo de Papela.",
  alternates: { canonical: "https://www.papela-atelier.com/club-creativo/dopamina" },
  openGraph: {
    title: "Dopamina — Papela Atelier",
    description: "Tres burbujas, una combinación inesperada y el tiempo corriendo. ¿Qué vas a crear?",
  },
};

export default function DopaminaPage() {
  return <DopaminaJuego />;
}
