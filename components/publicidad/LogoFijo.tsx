"use client";

import AnimatedLogo from "@/components/site/AnimatedLogo";
import { LIENZO, MARGEN_SEGURO } from "@/lib/publicidad";

// Logo de Papela FIJO arriba al centro, encima de todos los anuncios: no entra
// en el crossfade, así se queda quieto mientras cambian las fotos y solo se
// mueven los ojitos (mirada aleatoria + parpadeo, la misma cara del sitio).
// Sin sombra ni halo detrás, a petición del dueño (oct-2026).

export const LOGO_LADO = 450;

export default function LogoFijo() {
  return (
    <div
      aria-hidden
      className="absolute pointer-events-none"
      style={{ top: MARGEN_SEGURO, left: (LIENZO.ancho - LOGO_LADO) / 2, width: LOGO_LADO, height: LOGO_LADO, zIndex: 1 }}
    >
      <AnimatedLogo className="w-full h-full" mirada="aleatoria" />
    </div>
  );
}
