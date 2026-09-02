"use client";

import { usePathname } from "next/navigation";
import SiteNavbar from "./Navbar";
import SiteFooter from "./Footer";
import ProductDrawer from "./ProductDrawer";
import WhatsAppFloatButton from "./WhatsAppFloatButton";
import { isMiniSitePath } from "@/lib/mini-sites";

// /club = tarjeta de lealtad del Club Creativo (link privado, solo logo + tarjeta)
// /cotizacion = cotización de proyecto (link privado, documento imprimible)
// /club-creativo/dopamina = juego inmersivo (lienzo a pantalla completa, botón Salir propio)
// /mini-site-preview = preview del editor de Mini Sites (iframe del admin)
// Los Mini Sites de clientes (/<slug>, un solo segmento que no es página del
// sitio) también son standalone: ver isMiniSitePath en lib/mini-sites.ts.
const STANDALONE_ROUTES = [
  "/links",
  "/mini-site-preview",
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
  const isStandalone =
    STANDALONE_ROUTES.some((r) => pathname === r || pathname?.startsWith(r + "/")) ||
    isMiniSitePath(pathname);

  if (isStandalone) return <>{children}</>;

  return (
    <>
      <SiteNavbar />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <ProductDrawer />
      <WhatsAppFloatButton />
    </>
  );
}
