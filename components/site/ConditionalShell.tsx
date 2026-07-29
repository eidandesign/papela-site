"use client";

import { usePathname } from "next/navigation";
import SiteNavbar from "./Navbar";
import SiteFooter from "./Footer";
import ProductDrawer from "./ProductDrawer";

// /club = tarjeta de lealtad del Club Creativo (link privado, solo logo + tarjeta)
// /cotizacion = cotización de proyecto (link privado, documento imprimible)
// /club-creativo/dopamina = juego inmersivo (lienzo a pantalla completa, botón Salir propio)
const STANDALONE_ROUTES = [
  "/links",
  "/satisfaccion-clases",
  "/satisfaccion-talleres",
  "/club",
  "/cotizacion",
  "/club-creativo/dopamina",
];

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Coincidencia por segmento exacto: "/club/<token>" es standalone pero
  // "/club-creativo" (sección pública) usa el shell normal del sitio.
  const isStandalone = STANDALONE_ROUTES.some(
    (r) => pathname === r || pathname?.startsWith(r + "/")
  );

  if (isStandalone) return <>{children}</>;

  return (
    <>
      <SiteNavbar />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <ProductDrawer />
    </>
  );
}
