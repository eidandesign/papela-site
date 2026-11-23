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
// /whoweare = Brand Book 2026 (presentación a pantalla completa, iframe a public/brand-book)
// /mini-site-preview = preview del editor de Mini Sites (iframe del admin)
// /publicidad = pantalla vertical de la tienda (reproductor de anuncios; también es el preview del admin)
// /colabora/maestros/solicitud = propuesta del maestro paso a paso (pantalla completa, botón Salir propio)
// /tienda/checkout y /talleres/<id>/checkout = checkout ENCAPSULADO (nov-2026):
// sin navbar/footer para no fugar a nadie a un paso de pagar; el marco propio
// (MarcoCheckout) pone regreso, logo y pie legal. Las páginas /pago/* sí llevan
// el shell normal: ahí queremos que sigan navegando.
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
  "/whoweare",
  "/publicidad",
  "/colabora/maestros/solicitud",
  "/tienda/checkout",
];

// /talleres/<id>/checkout tiene un segmento dinámico en medio.
const CHECKOUT_TALLER_RE = /^\/talleres\/[^/]+\/checkout$/;

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Coincidencia por segmento exacto: "/club/<token>" es standalone pero
  // "/club-creativo" (sección pública) usa el shell normal del sitio.
  const isStandalone =
    STANDALONE_ROUTES.some((r) => pathname === r || pathname?.startsWith(r + "/")) ||
    CHECKOUT_TALLER_RE.test(pathname ?? "") ||
    isMiniSitePath(pathname);

  if (isStandalone) return <>{children}</>;

  return (
    <>
      <SiteNavbar />
      <main className="flex-1">{children}</main>
      <SiteFooter showClubBanner={!pathname?.startsWith("/club-creativo")} />
      <ProductDrawer />
      <WhatsAppFloatButton />
    </>
  );
}
