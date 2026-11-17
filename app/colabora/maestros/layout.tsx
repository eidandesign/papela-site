import type { Metadata } from "next";

// Página privada para maestros. noindex/nofollow aquí y en el header
// X-Robots-Tag (next.config.ts), fuera del sitemap. Esto NO es la protección:
// la protección es la contraseña validada en el servidor (lib/maestros/sesion.ts).
// La descripción es genérica a propósito: nada de cifras ni del contrato en
// metadatos.
export const metadata: Metadata = {
  title: { absolute: "Maestros — Papela Atelier" },
  description: "Espacio privado para maestros que colaboran con Papela Atelier.",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  openGraph: {
    title: "Maestros — Papela Atelier",
    description: "Espacio privado para maestros que colaboran con Papela Atelier.",
  },
};

export default function MaestrosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
