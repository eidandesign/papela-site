import type { Metadata } from "next";
// Clases de la pantalla SIN @layer para el Chrome 94 del reproductor Yodeck (ver el archivo).
import "./compat.css";

// Pantalla vertical de la tienda (señalización digital): no es para personas
// en el navegador, así que no se indexa ni entra al sitemap (robots.ts la
// excluye). Standalone en ConditionalShell y sin GTM/Pixel (AnalyticsScripts).
export const metadata: Metadata = {
  title: "Pantalla de la tienda",
  robots: { index: false, follow: false },
};

export default function PublicidadLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
