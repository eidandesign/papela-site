"use client";

// Card de Dopamina en la landing del Club Creativo (diseño Figma):
// texto a la izquierda (eyebrow, título dorado, copy, CTA verde y link
// "¿Cómo se juega?") y a la derecha un preview del juego hecho en CSS
// (lienzo morado con pompas de vidrio). El link abre un modal accesible con
// los cinco pasos y su propio CTA para empezar a jugar.

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import AnimatedLogo from "../AnimatedLogo";
import HojaClub from "../club/HojaClub";
import { eventoDopa } from "@/lib/dopamina/analitica";

const JUEGO = "/club-creativo/dopamina?desde=club";

const PASOS = [
  ["Explota tres burbujas", "Están tapadas: no sabes qué esconden. Cada ronda cambia de color y guarda algo distinto — un objeto, una acción y un cierre."],
  ["Mira armarse tu reto", "Con cada burbuja que explota, la frase se completa sola. Ninguna combinación se repite."],
  ["Elige tu tiempo", "De 5 minutos a 1 hora. El límite es parte del juego: apaga al perfeccionista."],
  ["Crea sin miedo", "Dibuja en papel, con lo que tengas a la mano. No hay dibujos malos aquí."],
  ["Vuelve a intentarlo", "Cada partida genera una combinación nueva. Juega las veces que quieras."],
] as const;

// Pompas decorativas del preview (porcentajes del panel morado).
const POMPAS = [
  { top: 16, left: 16, d: 64 },
  { top: 26, left: 78, d: 44 },
  { top: 58, left: 12, d: 38 },
  { top: 66, left: 74, d: 72 },
  { top: 84, left: 38, d: 48 },
];

const VIDRIO: React.CSSProperties = {
  background:
    "radial-gradient(circle at 30% 24%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.12) 34%, rgba(255,255,255,0.03) 58%, rgba(255,255,255,0.1) 88%, rgba(255,255,255,0.22) 100%)",
  boxShadow: "inset 0 -8px 14px rgba(255,255,255,0.16), inset 0 2px 8px rgba(255,255,255,0.38)",
  border: "1px solid rgba(255,255,255,0.32)",
};

// Reutiliza HojaClub (el bottom sheet del Club): en mobile sube desde abajo,
// en desktop aparece centrado; trae velo, ✕, Escape y salida animada.
// Portal a <body>: los ScrollReveal (transform de framer) crean un containing
// block que atraparía al `fixed` de la hoja bajo el navbar.
function ModalComoSeJuega({ onCierra }: { onCierra: () => void }) {
  return createPortal(
    <HojaClub label="Cómo se juega Dopamina" onCerrar={onCierra}>
      {() => (
        <div className="pt-1">
          <p className="label text-[var(--color-terracota)] text-center mb-3">Cómo funciona</p>
          <h3 className="font-serif text-[24px] leading-tight text-[#403C3C] text-center mb-6">
            Cinco pasos, cero presión
          </h3>
          <ol className="flex flex-col gap-4 mb-7">
            {PASOS.map(([titulo, detalle], i) => (
              <li key={titulo} className="flex gap-4 items-start">
                <span className="shrink-0 w-5 text-right font-serif text-[15px] text-[var(--color-muted)]">
                  {i + 1}
                </span>
                <div>
                  <p className="font-sans text-[14px] font-semibold text-[#403C3C]">{titulo}</p>
                  <p className="font-sans text-[13px] leading-[19px] text-[var(--color-muted)]">{detalle}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="flex justify-center pb-1">
            <Link
              href={JUEGO}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-verde)] text-[var(--color-cremita)] font-sans text-[14px] font-semibold px-7 py-3 hover:opacity-90 transition-opacity"
            >
              Empezar a jugar
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </HojaClub>,
    document.body
  );
}

export default function SeccionDopamina() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const abreModal = () => {
    eventoDopa("como_se_juega");
    setModalAbierto(true);
  };
  const cierraModal = () => {
    setModalAbierto(false);
    triggerRef.current?.focus();
  };

  return (
    <section className="w-[90%] mx-auto pt-14 md:pt-20">
      <article className="rounded-[28px] bg-[#E6D7CD] p-7 md:p-14 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
        {/* Texto */}
        <div className="max-w-md">
          <p className="label text-[var(--color-terracota)] mb-4">Juego creativo</p>
          <h2 className="font-serif text-[clamp(2.2rem,4.5vw,3.2rem)] leading-none text-[#664917] mb-5">
            Dopamina
          </h2>
          <p className="font-sans text-[15px] leading-[23px] text-[#403C3C]/85 mb-8">
            ¿Sientes que no tienes inspiración? Juega y diviértete creando cosas inesperadas que
            ayudarán a crear arte y explorar ideas inesperadas.
          </p>
          <div className="flex flex-col items-start gap-4">
            <Link
              href={JUEGO}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-verde)] text-[var(--color-cremita)] font-sans text-[14px] font-semibold px-7 py-3 hover:opacity-90 transition-opacity"
            >
              Jugar Dopamina
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
            <button
              ref={triggerRef}
              type="button"
              onClick={abreModal}
              className="font-sans text-[13px] font-medium text-[#403C3C]/70 hover:text-[#403C3C] underline underline-offset-4 decoration-[#403C3C]/30 transition-colors"
            >
              ¿Cómo se juega?
            </button>
          </div>
        </div>

        {/* Preview del juego: lienzo morado con pompas de vidrio */}
        <Link
          href={JUEGO}
          aria-label="Vista previa del juego Dopamina — jugar"
          className="group relative block rounded-[20px] overflow-hidden bg-[#483699] min-h-[300px] md:min-h-[430px]"
        >
          {POMPAS.map((p, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="dopa-flota absolute rounded-full"
              style={{
                top: `${p.top}%`,
                left: `${p.left}%`,
                width: p.d,
                height: p.d,
                animationDelay: `${-i * 1.3}s`,
                animationDuration: `${4.5 + (i % 3)}s`,
                ...VIDRIO,
              }}
            />
          ))}
          <span aria-hidden="true" className="absolute top-[30%] right-[26%] w-1.5 h-1.5 rounded-full bg-white/70" />
          <span aria-hidden="true" className="absolute bottom-[22%] left-[30%] w-1.5 h-1.5 rounded-full bg-white/70" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[140px] md:w-[180px] aspect-square opacity-90 transition-transform duration-500 ease-out group-hover:scale-105">
              <AnimatedLogo color="var(--color-cremita)" className="w-full h-full" />
            </div>
          </div>
        </Link>
      </article>

      {modalAbierto && <ModalComoSeJuega onCierra={cierraModal} />}
    </section>
  );
}
