import type { Metadata } from "next";
import MiniSitePreviewClient from "@/components/mini-sites/MiniSitePreviewClient";

// Preview en vivo para el editor de Mini Sites del admin. Se abre en un iframe
// dentro de admin.papela-atelier.com y recibe el borrador por postMessage; no
// lee ni guarda nada por su cuenta (sin datos, se queda en blanco).
// noindex + frame-ancestors solo para el admin (next.config.ts).

export const metadata: Metadata = {
  title: "Vista previa",
  robots: { index: false, follow: false },
};

export default function MiniSitePreviewPage() {
  return <MiniSitePreviewClient />;
}
