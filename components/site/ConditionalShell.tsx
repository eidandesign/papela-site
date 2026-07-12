"use client";

import { usePathname } from "next/navigation";
import SiteNavbar from "./Navbar";
import SiteFooter from "./Footer";
import ProductDrawer from "./ProductDrawer";

// /club = tarjeta de lealtad del Club Creativo (link privado, solo logo + tarjeta)
const STANDALONE_ROUTES = ["/links", "/satisfaccion-clases", "/satisfaccion-talleres", "/club"];

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalone = STANDALONE_ROUTES.some((r) => pathname?.startsWith(r));

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
