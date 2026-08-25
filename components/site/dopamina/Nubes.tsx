"use client";

// Cielo de Dopamina: nubes caricatura (SVG inline — ilustración, no íconos)
// con DOS capas fijas que se alternan por fase como un paneo de cámara:
//   · capa CAMPO  — nubes repartidas por el lienzo (fase de burbujas)
//   · capa BORDE  — nubes medio asomadas en los bordes sup/inf (reto,
//     cronómetro y final: su contenido vive al centro y nada debe taparlo)
// Al cambiar de fase la capa saliente se desliza HACIA ABAJO y se desvanece
// mientras la entrante baja desde arriba — se lee como si la cámara subiera
// a la siguiente pantalla. El slide/fade vive en un WRAPPER por nube
// (transition CSS de transform/opacity — compositor, nada de layout).
//
// El vaivén perpetuo es CSS puro (.dopa-nube-x/.dopa-nube-y en globals.css,
// mismo patrón de wrappers anidados que las pompas): antes era GSAP, pero era
// el único uso en la página del juego (~25KB de bundle para un vaivén) y sus
// tweens seguían corriendo sobre la capa invisible. Ahora la capa inactiva se
// PAUSA (animation-play-state) y no se anima lo que no se ve.
// prefers-reduced-motion: el vaivén se apaga en globals.css y el cambio de
// capa es instantáneo (motion-reduce:transition-none).

import { CURVA_SUAVE_CSS } from "@/lib/dopamina/animacion";

// Nube estilo sticker: sombra azul clarita abajo + cuerpo blanco encima.
// Exportada: el preview de la landing (SeccionDopamina) pinta las mismas nubes.
// `flip` espeja ADENTRO del svg (un <g> con transform): el transform CSS del
// elemento queda libre por si algún wrapper lo anima.
export function Nube({ className, style, flip }: { className?: string; style?: React.CSSProperties; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 220 120"
      fill="none"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <g transform={flip ? "translate(220 0) scale(-1 1)" : undefined}>
        {/* Sombra inferior (mismo cuerpo, corrido hacia abajo) */}
        <g fill="#CBE9F9">
          <ellipse cx="62" cy="88" rx="42" ry="26" />
          <ellipse cx="112" cy="74" rx="50" ry="34" />
          <ellipse cx="160" cy="90" rx="40" ry="24" />
          <rect x="24" y="76" width="172" height="38" rx="19" />
        </g>
        {/* Cuerpo blanco */}
        <g fill="#FFFFFF">
          <ellipse cx="62" cy="80" rx="42" ry="26" />
          <ellipse cx="112" cy="62" rx="50" ry="34" />
          <ellipse cx="160" cy="82" rx="40" ry="24" />
          <rect x="24" y="66" width="172" height="38" rx="19" />
        </g>
      </g>
    </svg>
  );
}

type ConfigNube = {
  left?: string;
  right?: string;
  top: string;
  w: string;
  flip?: boolean;
  op: number;
  soloMd?: boolean;
};

// CAMPO: posiciones % (mismo criterio que CampoBurbujas), todas debajo de la
// franja del título (~0-28%) para no ensuciar el texto. `soloMd`: las que en
// el lienzo angosto de mobile sobrarían.
const NUBES_CAMPO: ConfigNube[] = [
  { right: "-5%", top: "30%", w: "clamp(150px, 22vw, 340px)", op: 1 },
  { left: "8%", top: "34%", w: "clamp(70px, 9vw, 140px)", op: 0.95, soloMd: true },
  { left: "16%", top: "48%", w: "clamp(110px, 15vw, 230px)", flip: true, op: 1, soloMd: true },
  { left: "30%", top: "64%", w: "clamp(90px, 12vw, 190px)", op: 0.9 },
  { right: "6%", top: "74%", w: "clamp(80px, 10vw, 160px)", flip: true, op: 0.85 },
  { left: "-3%", top: "82%", w: "clamp(100px, 13vw, 200px)", op: 0.9 },
];

// BORDE: medio asomadas arriba y abajo, sin tocar texto en ninguna fase.
// Anclas en px/calc (no %): el alto del lienzo cambia entre breakpoints (y la
// pantalla final crece con el formulario); los `calc(100% - Npx)` cuelgan del
// borde inferior y lo visible cabe en el padding del contenido (pb-14/16).
const NUBES_BORDE: ConfigNube[] = [
  { right: "-5%", top: "-16px", w: "clamp(110px, 13vw, 190px)", op: 1 },
  { left: "18%", top: "-20px", w: "clamp(70px, 9vw, 140px)", op: 0.95, soloMd: true },
  { left: "62%", top: "-18px", w: "clamp(90px, 12vw, 190px)", op: 0.9 },
  { left: "10%", top: "calc(100% - 44px)", w: "clamp(110px, 15vw, 230px)", flip: true, op: 1, soloMd: true },
  { right: "6%", top: "calc(100% - 36px)", w: "clamp(80px, 10vw, 160px)", flip: true, op: 0.85 },
  { left: "-3%", top: "calc(100% - 30px)", w: "clamp(100px, 13vw, 200px)", op: 0.9 },
];

// Una capa de nubes. Inactiva = corrida hacia `salidaPx`, transparente y con
// el vaivén PAUSADO; la entrante espera un pelín para que el paneo se sienta
// continuo: primero se va el mundo de abajo, luego llega el de arriba.
function Capa({ nubes, activa, salidaPx }: { nubes: ConfigNube[]; activa: boolean; salidaPx: number }) {
  const pausa = { animationPlayState: activa ? "running" : "paused" } as React.CSSProperties;
  return (
    <>
      {nubes.map((n, i) => (
        <span
          key={i}
          className={`${n.soloMd ? "hidden md:block" : "block"} absolute motion-reduce:transition-none`}
          style={{
            left: n.left,
            right: n.right,
            top: n.top,
            width: n.w,
            transform: activa ? "translateY(0)" : `translateY(${salidaPx}px)`,
            opacity: activa ? 1 : 0,
            transition: `transform 1.15s ${CURVA_SUAVE_CSS} ${i * 0.06 + (activa ? 0.22 : 0)}s, opacity 0.9s ${CURVA_SUAVE_CSS} ${i * 0.06 + (activa ? 0.22 : 0)}s`,
          }}
        >
          {/* Vaivén x/y en wrappers anidados (ciclos desacoplados) */}
          <span
            className="dopa-nube-x block"
            style={{
              "--amp": `${13 + (i % 3) * 8}px`,
              "--dur": `${11 + i * 2.6}s`,
              animationDelay: `${-((i * 3.1) % 11)}s`,
              ...pausa,
            } as React.CSSProperties}
          >
            <span
              className="dopa-nube-y block"
              style={{
                "--amp": `${4 + (i % 2) * 3}px`,
                "--dur": `${6 + i * 1.9}s`,
                animationDelay: `${-((i * 1.7) % 6)}s`,
                ...pausa,
              } as React.CSSProperties}
            >
              <Nube flip={n.flip} style={{ width: "100%", opacity: n.op }} />
            </span>
          </span>
        </span>
      ))}
    </>
  );
}

export default function Nubes({ despejado = false }: { despejado?: boolean }) {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Cámara sube: el campo sale por abajo, los bordes llegan desde arriba */}
      <Capa nubes={NUBES_CAMPO} activa={!despejado} salidaPx={90} />
      <Capa nubes={NUBES_BORDE} activa={despejado} salidaPx={-64} />
    </div>
  );
}
