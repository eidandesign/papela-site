"use client";

// Card de Dopamina en la landing del Club Creativo, estilo App Store "Today"
// (rediseño ago-2026): el preview del juego (cielo azul con nubes y pompas)
// llena TODA la card, con eyebrow arriba y título+copy sobrepuestos abajo;
// remata una barra tipo tienda (ícono + nombre + "¿Cómo se juega?" + pill
// "Jugar"). La card es el grid-item — el grid vive en la página del club.
// "¿Cómo se juega?" abre el modal accesible con los cinco pasos.

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import AnimatedLogo from "../AnimatedLogo";
import { Nube } from "./Nubes";
import { FONDO_CIELO } from "@/lib/dopamina/retos";
import HojaClub from "../club/HojaClub";
import { eventoDopa } from "@/lib/dopamina/analitica";

const JUEGO = "/club-creativo/dopamina?desde=club";

const PASOS = [
  ["Explota tres burbujas", "Están tapadas: no sabes qué esconden. Cada una guarda algo distinto — un objeto, una acción y un cierre."],
  ["Mira armarse tu reto", "Con cada burbuja que explota, la frase se completa sola. Ninguna combinación se repite."],
  ["Elige tu tiempo", "De 5 minutos a 1 hora. El límite es parte del juego: apaga al perfeccionista."],
  ["Crea sin miedo", "Dibuja en papel, con lo que tengas a la mano. No hay dibujos malos aquí."],
  ["Vuelve a intentarlo", "Cada partida genera una combinación nueva. Juega las veces que quieras."],
] as const;

// Pompas decorativas del preview (porcentajes del panel de cielo).
const POMPAS = [
  { top: 14, left: 14, d: 60 },
  { top: 22, left: 78, d: 44 },
  { top: 48, left: 10, d: 38 },
  { top: 52, left: 76, d: 64 },
  { top: 60, left: 42, d: 44 },
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
    <article className="relative h-full rounded-[28px] overflow-hidden flex flex-col shadow-[0_18px_44px_rgba(18,83,92,0.12)]">
      {/* Visual a sangre completa (link al juego) */}
      <Link
        href={JUEGO}
        aria-label="Dopamina, el juego creativo — jugar"
        className="group relative block flex-1 min-h-[340px] md:min-h-[420px]"
        style={{ backgroundColor: FONDO_CIELO }}
      >
        <Nube style={{ position: "absolute", right: "-6%", top: "4%", width: "34%", opacity: 0.95 }} />
        <Nube flip style={{ position: "absolute", left: "-4%", top: "34%", width: "26%", opacity: 0.9 }} />
        <Nube style={{ position: "absolute", right: "10%", bottom: "24%", width: "22%", opacity: 0.85 }} />
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
        <span aria-hidden="true" className="absolute bottom-[32%] left-[30%] w-1.5 h-1.5 rounded-full bg-white/70" />

        {/* Logo flotando en el centro del cielo (sube un poco: el texto vive abajo) */}
        <div className="absolute inset-x-0 top-0 bottom-[28%] flex items-center justify-center">
          <div className="w-[120px] md:w-[150px] aspect-square opacity-90 transition-transform duration-500 ease-out group-hover:scale-105">
            <AnimatedLogo color="#FFFFFF" className="w-full h-full" />
          </div>
        </div>

        {/* Eyebrow arriba, como el "HAPPENING NOW" de la App Store */}
        <p className="label text-white/80 absolute left-6 top-5 md:left-7 md:top-6">Juego creativo</p>

        {/* Título + copy sobre el visual, con scrim para legibilidad */}
        <div className="absolute inset-x-0 bottom-0 px-6 md:px-7 pt-16 pb-5 md:pb-6 bg-gradient-to-t from-black/30 via-black/10 to-transparent">
          <h2 className="font-serif text-[clamp(2rem,3vw,2.6rem)] leading-none text-white mb-2">
            Dopamina
          </h2>
          <p className="font-sans text-[14px] leading-[20px] text-white/90 max-w-sm">
            ¿Sin inspiración? Explota burbujas, descubre un reto y ponte a crear.
          </p>
        </div>
      </Link>

      {/* Barra inferior tipo App Store: ícono + nombre + link + pill */}
      <div className="flex items-center gap-3.5 px-5 py-4" style={{ backgroundColor: "#1F63C4" }}>
        {/* Ícono de la app: sticker "Creative time" (glazed-creativity, Freepik) */}
        <span aria-hidden="true" className="shrink-0 w-11 h-11 rounded-[12px] overflow-hidden bg-white">
          <Image src="/images/club/dopamina-icon.png" alt="" width={44} height={44} className="w-full h-full object-cover" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-sans text-[14px] font-semibold text-white leading-tight">Dopamina</p>
          <button
            ref={triggerRef}
            type="button"
            onClick={abreModal}
            className="font-sans text-[12px] font-medium text-white/70 hover:text-white underline underline-offset-4 decoration-white/35 transition-colors"
          >
            ¿Cómo se juega?
          </button>
        </div>
        <Link
          href={JUEGO}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-white text-[var(--color-verde)] font-sans text-[13px] font-semibold px-5 py-2 hover:opacity-90 transition-opacity"
        >
          Jugar
          <ArrowRightIcon className="w-3 h-3" aria-hidden="true" />
        </Link>
      </div>

      {modalAbierto && <ModalComoSeJuega onCierra={cierraModal} />}
    </article>
  );
}
