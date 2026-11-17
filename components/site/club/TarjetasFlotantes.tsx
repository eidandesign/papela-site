import type { CSSProperties } from "react";
import MiniTarjeta, { type MiniTarjetaDatos } from "@/components/site/club/MiniTarjeta";

// Tarjetas del Club flotando alrededor del hero de /club-creativo/tarjeta:
// cada una con otro fondo, otro nombre (inventados) y otra colección, para
// enseñar que cada tarjeta es distinta. Solo transform (CSS en globals.css,
// .club-deriva/.club-flota); con prefers-reduced-motion se quedan quietas.

type Flotante = Omit<MiniTarjetaDatos, "total"> & {
  pos: string;      // posición absoluta (clases de Tailwind)
  escala: string;   // tamaño relativo
  giro: number;     // grados
  dx: number;       // vaivén horizontal (px)
  dy: number;       // sube y baja (px)
  t1: number;       // duración del vaivén (s)
  t2: number;       // duración del sube y baja (s)
  retraso: number;  // desfase (s, negativo = ya va a medio ciclo)
};

const TOTAL = 51;

// Desktop: 6 tarjetas en los costados, lejos del texto central.
const ESCRITORIO: Flotante[] = [
  { fondo: "atardecer", ink: "#ffffff", nombre: "Valeria Ruiz", coins: "$148.50", stickers: ["flor.webp", "monstera.webp", "esfera.webp", "caballo.webp"], obtenidos: 12,
    pos: "left-[13%] top-[23%]", escala: "scale-[0.95]", giro: -7, dx: 10, dy: -16, t1: 13, t2: 6, retraso: 0 },
  { fondo: "sol", ink: "#403c3c", nombre: "Sofía Castillo", coins: "$310.25", stickers: ["arcoiris.png", "caballo.webp", "monstera.webp", "colibri.png", "esfera.webp"], obtenidos: 27,
    pos: "left-[3%] top-[52%]", escala: "scale-[1.05]", giro: 5, dx: -12, dy: -18, t1: 15, t2: 7, retraso: -3 },
  { fondo: "perla", ink: "#403c3c", nombre: "Diego Morales", coins: "$24.80", stickers: ["esfera.webp", "estrellita.png"], obtenidos: 4,
    pos: "left-[21%] bottom-[4%]", escala: "scale-[0.8]", giro: -3, dx: 8, dy: -12, t1: 11, t2: 5.5, retraso: -6 },
  { fondo: "horizonte", ink: "#ffffff", nombre: "Mateo Hernández", coins: "$62.00", stickers: ["colibri.png", "estrellita.png", "flor.webp"], obtenidos: 8,
    pos: "right-[13%] top-[21%]", escala: "scale-[0.95]", giro: 6, dx: -10, dy: -15, t1: 14, t2: 6.5, retraso: -2 },
  { fondo: "cuarzo", ink: "#403c3c", nombre: "Regina Flores", coins: "$95.40", stickers: ["flor.webp", "colibri.png", "arcoiris.png", "estrellita.png"], obtenidos: 19,
    pos: "right-[3%] top-[50%]", escala: "scale-[1.05]", giro: -5, dx: 12, dy: -18, t1: 16, t2: 7.5, retraso: -5 },
  { fondo: "vitral", ink: "#403c3c", nombre: "Emilio Ortega", coins: "$187.60", stickers: ["caballo.webp", "monstera.webp", "esfera.webp"], obtenidos: 15,
    pos: "right-[22%] bottom-[3%]", escala: "scale-[0.8]", giro: 4, dx: -8, dy: -12, t1: 12, t2: 5, retraso: -8 },
];

function Tarjeta({ t }: { t: Flotante }) {
  const vars = {
    "--giro": `${t.giro}deg`,
    "--dx": `${t.dx}px`,
    "--dy": `${t.dy}px`,
    "--t1": `${t.t1}s`,
    "--t2": `${t.t2}s`,
    "--retraso": `${t.retraso}s`,
  } as CSSProperties;
  return (
    <div className="club-deriva" style={vars}>
      <div className="club-flota">
        <MiniTarjeta datos={{ ...t, total: TOTAL }} className={t.escala} />
      </div>
    </div>
  );
}

/** Capa de fondo del hero (desktop): tarjetas absolutas a los costados. */
export function TarjetasFlotantesFondo() {
  return (
    <div aria-hidden="true" className="hidden lg:block absolute inset-0 pointer-events-none">
      {ESCRITORIO.map((t) => (
        <div key={t.nombre} className={`absolute ${t.pos}`}>
          <Tarjeta t={t} />
        </div>
      ))}
    </div>
  );
}

/** Mobile/tablet: abanico de tres tarjetas debajo del texto. */
export function TarjetasFlotantesAbanico() {
  const tres = [ESCRITORIO[1], ESCRITORIO[0], ESCRITORIO[4]];
  return (
    <div aria-hidden="true" className="lg:hidden relative h-[250px] w-full max-w-[420px] mx-auto mt-12">
      <div className="absolute left-[2%] top-[34px]"><Tarjeta t={{ ...tres[0], giro: -9 }} /></div>
      <div className="absolute right-[2%] top-[34px]"><Tarjeta t={{ ...tres[2], giro: 9 }} /></div>
      <div className="absolute left-1/2 -translate-x-1/2 top-0 z-10"><Tarjeta t={{ ...tres[1], giro: 0 }} /></div>
    </div>
  );
}
