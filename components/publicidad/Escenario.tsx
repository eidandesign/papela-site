"use client";

import { useEffect, useState, type ReactNode } from "react";
import { LIENZO, MARGEN_SEGURO } from "@/lib/publicidad";

// "Escenario" fijo de 2160×3840 escalado con transform para llenar la ventana
// (contain + centrado sobre color-bg). Todo el diseño de los anuncios va en px
// del lienzo; así la misma página sirve a 4K, a 1080×1920 y al iframe del
// editor. `rotar` gira el contenido 90°/-90° por si la pantalla reporta el
// viewport en horizontal. Las guías (120 px) solo con ?guias=1.

export default function Escenario({ rotar, guias, children }: { rotar: 0 | 90 | -90; guias: boolean; children: ReactNode }) {
  const [escala, setEscala] = useState(0);

  useEffect(() => {
    function medir() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const girado = rotar !== 0;
      const dispW = girado ? h : w;
      const dispH = girado ? w : h;
      setEscala(Math.min(dispW / LIENZO.ancho, dispH / LIENZO.alto));
    }
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [rotar]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[var(--color-bg)]" style={{ cursor: "none" }}>
      <div
        className="absolute left-1/2 top-1/2 overflow-hidden"
        style={{
          width: LIENZO.ancho,
          height: LIENZO.alto,
          marginLeft: -LIENZO.ancho / 2,
          marginTop: -LIENZO.alto / 2,
          transform: `rotate(${rotar}deg) scale(${escala})`,
          transformOrigin: "center",
          visibility: escala ? "visible" : "hidden",
        }}
      >
        {children}
        {guias && (
          <div
            className="absolute pointer-events-none"
            aria-hidden="true"
            style={{
              inset: MARGEN_SEGURO,
              border: "6px dashed rgba(255,0,0,.75)",
              boxShadow: "0 0 0 2px rgba(255,255,255,.6) inset",
              zIndex: 9999,
            }}
          >
            <span className="absolute font-sans" style={{ top: 12, left: 12, fontSize: 40, color: "rgba(255,0,0,.9)", background: "rgba(255,255,255,.8)", padding: "8px 20px", borderRadius: 16 }}>
              Margen de seguridad {MARGEN_SEGURO} px · lienzo {LIENZO.ancho}×{LIENZO.alto}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
