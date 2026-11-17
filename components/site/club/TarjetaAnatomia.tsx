"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { BellIcon, Bars3Icon, ChevronRightIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";

// Anatomía de la tarjeta del Club (para /club-creativo/tarjeta): réplica
// ESTÁTICA y fiel del layout real de TarjetaClub (nombre + Papela Coins arriba,
// portada de 6 óvalos, contador, planilla, "Club Creativo" al pie, menú con
// campana encima). Si cambia el layout de TarjetaClub, actualizar la réplica.
//
// Nov-2026 (a petición del dueño): ya no hay leyenda al lado. La tarjeta va
// centrada y cada número es un BOTÓN que abre su explicación en un globo
// (uno a la vez; se cierra con la ✕, tocando fuera o con Escape). Mientras
// nadie ha tocado ninguno, los números laten para invitar a tocarlos.

type Parte = {
  n: number;
  titulo: string;
  texto: string;
  /** posición del número sobre la tarjeta */
  pos: string;
  /** hacia dónde se abre el globo: der = crece a la derecha del número */
  lado: "der" | "izq";
};

const PARTES: Parte[] = [
  { n: 1, titulo: "Menú y campana", texto: "La campana te avisa de estampitas por rascar y mensajes del Club; el menú te deja personalizar y compartir tu tarjeta.",
    pos: "top-1 right-[96px]", lado: "izq" },
  { n: 2, titulo: "Aviso para rascar", texto: "Después de cada compra aparece este aviso. Toca “Rascar” y destapa tu estampita con el dedo.",
    pos: "top-[86px] -left-3", lado: "der" },
  { n: 3, titulo: "Tu nombre", texto: "La tarjeta es personal: lleva tu nombre y vive en un enlace que solo tú tienes.",
    pos: "top-[136px] -left-3", lado: "der" },
  { n: 4, titulo: "Papela Coins", texto: "Tu saldo de cashback, actualizado al momento. Es dinero que usas como pago en caja.",
    pos: "top-[136px] -right-3", lado: "izq" },
  { n: 5, titulo: "Tu portada", texto: "Seis espacios para lucir tus estampitas favoritas. Tú eliges cuáles van; toca una para leer su historia.",
    pos: "top-[214px] -left-3", lado: "der" },
  { n: 6, titulo: "Ganaste un premio", texto: "Las estampitas con 🎁 traen premio. Abre la ficha para ver qué es y enséñala en caja para reclamarlo.",
    pos: "top-[214px] right-[30%]", lado: "izq" },
  { n: 7, titulo: "Espacio libre", texto: "Toca el + para poner ahí otra estampita de tu colección.",
    pos: "top-[318px] -right-3", lado: "izq" },
  { n: 8, titulo: "Tu colección", texto: "Cuántas estampitas llevas y el acceso a tu planilla completa, donde las que te faltan se ven como siluetas.",
    pos: "top-[420px] -left-3", lado: "der" },
];

const STICKERS = [
  { s: "flor", premio: false },
  { s: "monstera", premio: true },
  { s: "esfera", premio: false },
  { s: "caballo", premio: false },
];

const ROSA = "#DD5A8B";

function Marca({
  parte,
  abierta,
  invita,
  onToggle,
  onCerrar,
  idBase,
}: {
  parte: Parte;
  abierta: boolean;
  invita: boolean;
  onToggle: () => void;
  onCerrar: () => void;
  idBase: string;
}) {
  const idGlobo = `${idBase}-globo-${parte.n}`;
  return (
    <div className={`absolute ${parte.pos} ${abierta ? "z-40" : "z-20"}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={abierta}
        aria-controls={idGlobo}
        aria-label={`${parte.n}. ${parte.titulo}`}
        className="relative w-7 h-7 rounded-full text-white font-sans text-[13px] font-bold flex items-center justify-center ring-[3px] ring-[var(--color-bg)] shadow-[0_4px_10px_rgba(0,0,0,0.25)] transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-verde)] before:absolute before:-inset-2 before:content-['']"
        style={{ backgroundColor: abierta ? "var(--color-verde)" : ROSA }}
      >
        {invita && (
          <span aria-hidden="true" className="absolute inset-0 rounded-full animate-ping motion-reduce:hidden" style={{ backgroundColor: ROSA, opacity: 0.45 }} />
        )}
        <span className="relative">{parte.n}</span>
      </button>

      {abierta && (
        <div
          id={idGlobo}
          role="region"
          aria-label={parte.titulo}
          className={`absolute top-full mt-2.5 w-[min(250px,78vw)] rounded-2xl bg-white p-4 pr-9 text-left shadow-[0_14px_36px_rgba(64,60,60,0.22)] ${
            parte.lado === "der" ? "left-0" : "right-0"
          }`}
        >
          <p className="font-serif italic text-[20px] leading-tight text-[#403C3C] mb-1">{parte.titulo}</p>
          <p className="font-sans text-[14px] leading-[20px] text-[var(--color-muted)]">{parte.texto}</p>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-[var(--color-muted)] hover:bg-[var(--color-cremita-3)]"
          >
            <XMarkIcon className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function TarjetaAnatomia() {
  const [abierta, setAbierta] = useState<number | null>(null);
  const [tocada, setTocada] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const idBase = useId();

  // Cerrar con Escape o tocando fuera del bloque
  useEffect(() => {
    if (abierta === null) return;
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && setAbierta(null);
    const fuera = (e: PointerEvent) => {
      if (raiz.current && !raiz.current.contains(e.target as Node)) setAbierta(null);
    };
    document.addEventListener("keydown", tecla);
    document.addEventListener("pointerdown", fuera);
    return () => {
      document.removeEventListener("keydown", tecla);
      document.removeEventListener("pointerdown", fuera);
    };
  }, [abierta]);

  return (
    <div ref={raiz} className="relative w-[300px] sm:w-[330px] mx-auto pt-[76px]">
      {/* Réplica de la tarjeta: puro adorno, lo explicativo son los botones */}
      <div aria-hidden="true">
        {/* menú de la tarjeta (pastilla de vidrio claro) */}
        <div className="absolute top-0 right-0 flex items-center gap-1 rounded-full bg-white/70 border border-white px-2 py-1.5 shadow-[0_6px_18px_rgba(18,83,92,0.15)]">
          <span className="w-8 h-8 rounded-full flex items-center justify-center relative">
            <BellIcon className="w-5 h-5 text-[var(--color-verde)]" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--color-terracota)]" />
          </span>
          <span className="w-8 h-8 rounded-full flex items-center justify-center">
            <Bars3Icon className="w-5 h-5 text-[var(--color-verde)]" />
          </span>
        </div>

        <div className="relative rounded-3xl overflow-hidden text-white shadow-[0_24px_40px_rgba(18,83,92,0.28)]">
          <Image src="/images/club/fondos/atardecer.jpg" alt="" fill sizes="330px" className="object-cover" />

          {/* aviso para rascar */}
          <div className="relative z-10 flex justify-center pt-4">
            <span className="flex items-center gap-2 rounded-full bg-white/92 pl-3 pr-1.5 py-1.5 shadow-[0_10px_30px_rgba(18,83,92,0.22)]">
              <span className="text-[11px] font-semibold text-[var(--color-verde)] whitespace-nowrap">🎁 Tienes 1 sticker por revelar</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-verde)] text-[11px] font-bold text-[var(--color-cremita)]">Rascar</span>
            </span>
          </div>

          {/* nombre y Papela Coins */}
          <div className="relative flex items-start justify-between gap-3 px-5 pt-4 pb-2">
            <p className="font-serif text-[28px] leading-[1.05]">Tu nombre</p>
            <div className="text-right">
              <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-white/80">Papela Coins</p>
              <p className="font-serif text-[26px] leading-none mt-1 tabular-nums">$148.50</p>
            </div>
          </div>

          {/* portada */}
          <div className="relative px-5 pt-3">
            <div className="grid grid-cols-3 gap-y-4 justify-items-center">
              {STICKERS.map(({ s, premio }) => (
                <span key={s} className="relative flex items-center justify-center w-[72px] h-[88px]">
                  <Image src={`/images/club/preview/${s}.webp`} alt="" width={64} height={64}
                    className={`w-[62px] h-[62px] object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)] ${premio ? "-translate-y-1.5" : ""}`} />
                  {premio && (
                    <>
                      <span className="absolute top-0 right-0 text-sm">🎁</span>
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/92 px-1.5 py-[3px] text-[7px] font-bold leading-none text-[var(--color-terracota)]">
                        Ganaste un premio
                      </span>
                    </>
                  )}
                </span>
              ))}
              {[0, 1].map((i) => (
                <span key={i} className="flex items-center justify-center w-[72px] h-[88px] rounded-[50%] border border-dashed border-white/70">
                  <PlusIcon className="w-5 h-5" />
                </span>
              ))}
            </div>

            {/* contador + planilla */}
            <p className="text-center text-sm font-semibold mt-5">12 / 51</p>
            <p className="mx-auto mt-2 flex items-center justify-center gap-2 text-[11px] font-medium">
              Ver mi planilla completa
              <span className="w-7 h-7 rounded-full border border-white/70 flex items-center justify-center">
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </span>
            </p>
          </div>

          <div className="relative px-5 pt-8 pb-5">
            <p className="font-serif italic text-[24px] leading-tight">Club Creativo</p>
          </div>
        </div>
      </div>

      {/* Números: cada uno abre su explicación */}
      {PARTES.map((p) => (
        <Marca
          key={p.n}
          parte={p}
          idBase={idBase}
          abierta={abierta === p.n}
          invita={!tocada}
          onToggle={() => {
            setTocada(true);
            setAbierta((a) => (a === p.n ? null : p.n));
          }}
          onCerrar={() => setAbierta(null)}
        />
      ))}
    </div>
  );
}
