"use client";

// Lluvia de confeti para la pantalla "Reto completado" de Dopamina.
// CSS puro (keyframes dopa-confeti-* en globals.css): sin dependencias y solo
// transform/opacity, igual que el resto de las animaciones del juego. Las
// piezas se generan con Math.random en un estado montado en el cliente (mismo
// patrón que el reparto de burbujas: evita mismatch de hidratación).

import { useEffect, useState } from "react";

// Paleta para el cielo azul: blancos, cremas, terracotas y acentos cálidos
// (sin azules de marca — se perdían contra el fondo).
const COLORES = ["#FFFFFF", "#F3E6CF", "#8C482A", "#C4846A", "#FFD166", "#FF8FA3", "#483699"];
const PIEZAS = 56;

type Pieza = {
  left: number;
  color: string;
  ancho: number;
  alto: number;
  dur: number;
  delay: number;
  giro: number;
  vaiven: number;
  durVaiven: number;
  redonda: boolean;
};

// Caída más larga posible (dur 2.6+2.4 + delay 0.9) + colchón: después de
// esto ya no hay nada visible y el componente se desmonta solo — sin el
// desmontaje, el vaivén `infinite` seguiría animando 56 piezas invisibles
// mientras dure la pantalla final.
const VIDA_MS = 6500;

export default function Confeti() {
  const [piezas, setPiezas] = useState<Pieza[]>([]);
  const [vivo, setVivo] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVivo(false), VIDA_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- random solo en cliente
    setPiezas(
      Array.from({ length: PIEZAS }, () => ({
        left: Math.random() * 100,
        color: COLORES[Math.floor(Math.random() * COLORES.length)],
        ancho: 6 + Math.random() * 6,
        alto: 8 + Math.random() * 8,
        dur: 2.6 + Math.random() * 2.4,
        delay: Math.random() * 0.9,
        giro: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 540),
        vaiven: (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 26),
        durVaiven: 1.2 + Math.random() * 1.4,
        redonda: Math.random() > 0.72,
      }))
    );
  }, []);

  if (!vivo) return null;

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none z-30">
      {piezas.map((p, i) => (
        <span
          key={i}
          className="dopa-confeti"
          style={{
            left: `${p.left}%`,
            "--vaiven": `${p.vaiven}px`,
            "--dur-vaiven": `${p.durVaiven}s`,
          } as React.CSSProperties}
        >
          <span
            style={{
              width: p.ancho,
              height: p.redonda ? p.ancho : p.alto,
              backgroundColor: p.color,
              borderRadius: p.redonda ? "9999px" : "2px",
              "--dur": `${p.dur}s`,
              "--delay": `${p.delay}s`,
              "--giro": `${p.giro}deg`,
            } as React.CSSProperties}
          />
        </span>
      ))}
    </div>
  );
}
