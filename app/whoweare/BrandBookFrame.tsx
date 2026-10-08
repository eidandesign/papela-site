"use client";

import { useEffect, useRef } from "react";

// Le da el foco al iframe para que ←/→ naveguen sin tener que dar clic primero.
// Con useEffect además de onLoad: el iframe puede terminar de cargar antes de
// que React hidrate, y entonces el onLoad nunca llega.
export default function BrandBookFrame() {
  const ref = useRef<HTMLIFrameElement>(null);
  const enfoca = () => {
    ref.current?.focus();
    ref.current?.contentWindow?.focus();
  };
  useEffect(enfoca, []);
  return (
    <iframe
      ref={ref}
      src="/brand-book/index.html"
      title="Brand Book Papela 2026"
      onLoad={enfoca}
      className="fixed inset-0 block h-[100dvh] w-full border-0 bg-[var(--color-verde)]"
      allow="clipboard-write; fullscreen"
      allowFullScreen
    />
  );
}
