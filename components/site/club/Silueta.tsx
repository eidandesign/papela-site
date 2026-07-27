"use client";

// Silueta de misterio: la imagen real pintada como pura sombra (brightness 0),
// para los coleccionables definidos que el miembro todavía NO tiene.
// Si el asset no existe (404), no deja el icono de imagen rota: se esconde y
// el espacio queda solo con su número. El chequeo de naturalWidth cubre las
// imágenes que fallaron ANTES de que React colgara el onError (caché rota).
// El padre la monta con key={src}, así un cambio de src remonta la pieza con
// `rota` limpio en vez de resetearlo aquí.

import { useEffect, useRef, useState } from "react";

export default function Silueta({ src, className }: { src: string; className: string }) {
  const [rota, setRota] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setRota(true);
  }, []);
  if (rota) return <div className={className} aria-hidden="true" />;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- asset del admin
    <img ref={ref} src={src} alt="" className={className} style={{ filter: "brightness(0)" }}
      loading="lazy" draggable={false} aria-hidden="true" onError={() => setRota(true)} />
  );
}
