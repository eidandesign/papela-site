import type { Metadata } from "next";
import BrandBookFrame from "./BrandBookFrame";

// Brand Book 2026 (presentación de Claude Design). Vive como archivos estáticos
// en public/brand-book/ — su visor (deck-stage.js) maneja navegación, animaciones
// y, en celular vertical, el modo de slides apiladas con scroll.
export const metadata: Metadata = {
  title: { absolute: "Quiénes somos — Brand Book Papela 2026" },
  description: "Estrategia, esencia y comunicación de marca de Papela.",
  robots: { index: false, follow: false },
};

export default function WhoWeArePage() {
  return <BrandBookFrame />;
}
