import { Suspense } from "react";
import PantallaPublicidad from "@/components/publicidad/PantallaPublicidad";

// /publicidad — reproductor de anuncios para la Samsung QM43C (URL Launcher).
// Parámetros: ?pantalla=tienda · ?rotar=90|-90 · ?guias=1 · ?demo=1 (anuncios de
// muestra, uno por plantilla, sin API) · ?preview=1 (iframe del editor del
// admin; recibe el borrador por postMessage).
export default function PublicidadPage() {
  return (
    <Suspense>
      <PantallaPublicidad />
    </Suspense>
  );
}
