import type { CSSProperties } from "react";

// Moneda Papela Coin: dorada, con canto, aro grabado y la cara del logo de
// Papela en relieve (máscara de Logo-papela-verde.svg). Flota y "voltea"
// un poco (CSS en globals.css: .club-flota + .club-moneda-gira); con
// prefers-reduced-motion se queda quieta. Puro adorno: aria-hidden.

export default function MonedaPapela({
  tam,
  className = "",
  retraso = 0,
  t2 = 6,
  t3 = 7,
}: {
  tam: number;
  className?: string;
  retraso?: number;
  t2?: number;
  t3?: number;
}) {
  const vars = {
    "--retraso": `${retraso}s`,
    "--t2": `${t2}s`,
    "--t3": `${t3}s`,
    "--dy": `${-Math.round(tam * 0.14)}px`,
  } as CSSProperties;
  return (
    <div aria-hidden="true" className={`pointer-events-none ${className}`} style={vars}>
      <div className="club-flota">
        <div className="club-moneda-gira relative rounded-full" style={{ width: tam, height: tam }}>
          {/* Canto (grosor) */}
          <span
            className="absolute inset-0 rounded-full translate-y-[6%]"
            style={{ background: "linear-gradient(180deg,#b9822a,#7a4f12)", boxShadow: "0 14px 26px rgba(0,0,0,0.35)" }}
          />
          {/* Cara */}
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 32% 28%, #fff4c4 0%, #f7d774 22%, #e9b23f 55%, #c98a22 85%, #b07418 100%)",
              boxShadow: "inset 0 0 0 2px rgba(255,240,190,0.55), inset 0 -3px 6px rgba(120,70,10,0.35)",
            }}
          />
          {/* Aro grabado */}
          <span
            className="absolute rounded-full"
            style={{
              inset: "9%",
              border: `${Math.max(1, tam * 0.025)}px solid rgba(150,95,20,0.55)`,
              boxShadow: "0 1px 0 rgba(255,240,190,0.6), inset 0 1px 0 rgba(255,240,190,0.4)",
            }}
          />
          {/* Logo Papela en relieve */}
          <span
            className="absolute"
            style={{
              inset: "16%",
              backgroundColor: "#9a6315",
              WebkitMaskImage: "url(/images/Logo-papela-verde.svg)",
              maskImage: "url(/images/Logo-papela-verde.svg)",
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
              filter: "drop-shadow(0 1px 0 rgba(255,240,190,0.7))",
            }}
          />
          {/* Brillo */}
          <span
            className="absolute rounded-full"
            style={{ inset: 0, background: "linear-gradient(125deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 38%)" }}
          />
        </div>
      </div>
    </div>
  );
}
