import type { Metadata } from "next";
import TarjetaClub from "@/components/site/TarjetaClub";

// Tarjeta de lealtad del Club Creativo Papela — link privado que Papela
// comparte al miembro. Los datos viven en el admin y se leen de su API
// pública (/api/public/club/[token]). Ruta standalone (sin navbar/footer,
// ver ConditionalShell) y noindex: el token es la única llave.
export const metadata: Metadata = {
  title: "Club Creativo Papela — Mi tarjeta",
  description: "Tarjeta de lealtad del Club Creativo Papela",
  robots: { index: false, follow: false },
};

export default function ClubCardPage() {
  return <TarjetaClub />;
}
