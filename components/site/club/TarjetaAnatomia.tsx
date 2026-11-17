import Image from "next/image";
import { BellIcon, Bars3Icon, ChevronRightIcon, PlusIcon } from "@heroicons/react/24/solid";

// Anatomía de la tarjeta del Club (para /club-creativo/tarjeta): réplica
// ESTÁTICA y fiel del layout real de TarjetaClub (nombre + Papela Coins arriba,
// portada de 6 óvalos, contador, planilla, "Club Creativo" al pie, menú con
// campana encima) con marcadores numerados que corresponden a la leyenda.
// Si cambia el layout de TarjetaClub, actualizar esta réplica.

type Parte = { n: number; titulo: string; texto: string };

export const PARTES: Parte[] = [
  { n: 1, titulo: "Menú y campana", texto: "Arriba de tu tarjeta: la campana te avisa de estampitas por rascar y mensajes del Club; el menú te deja personalizarla y compartirla." },
  { n: 2, titulo: "Aviso para rascar", texto: "Después de cada compra aparece este aviso. Toca “Rascar” y destapa tu estampita con el dedo." },
  { n: 3, titulo: "Tu nombre", texto: "La tarjeta es personal: lleva tu nombre y vive en un enlace que solo tú tienes." },
  { n: 4, titulo: "Papela Coins", texto: "Tu saldo de cashback, actualizado al momento. Es dinero que usas como pago en caja." },
  { n: 5, titulo: "Tu portada", texto: "Seis espacios para lucir tus estampitas favoritas. Tú eliges cuáles van; toca una para ver su historia." },
  { n: 6, titulo: "Ganaste un premio", texto: "Las estampitas con 🎁 traen premio. Abre la ficha para ver qué es y enséñala en caja para reclamarlo." },
  { n: 7, titulo: "Espacio libre", texto: "Toca el + para poner ahí otra estampita de tu colección." },
  { n: 8, titulo: "Tu colección", texto: "Cuántas estampitas llevas y el acceso a tu planilla completa, donde las que te faltan se ven como siluetas." },
];

const STICKERS = [
  { s: "flor", premio: false },
  { s: "monstera", premio: true },
  { s: "esfera", premio: false },
  { s: "caballo", premio: false },
];

function Marca({ n, className }: { n: number; className: string }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute z-20 w-7 h-7 rounded-full bg-[#DD5A8B] text-white font-sans text-[13px] font-bold flex items-center justify-center ring-[3px] ring-[var(--color-bg)] shadow-[0_4px_10px_rgba(0,0,0,0.25)] ${className}`}
    >
      {n}
    </span>
  );
}

export function TarjetaAnatomiaVisual() {
  return (
    <div aria-hidden="true" className="relative w-[300px] sm:w-[330px] mx-auto pt-[76px]">
      {/* 1 — menú de la tarjeta (pastilla de vidrio claro) */}
      <div className="absolute top-0 right-0 flex items-center gap-1 rounded-full bg-white/70 border border-white px-2 py-1.5 shadow-[0_6px_18px_rgba(18,83,92,0.15)]">
        <span className="w-8 h-8 rounded-full flex items-center justify-center relative">
          <BellIcon className="w-5 h-5 text-[var(--color-verde)]" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#DD5A8B]" />
        </span>
        <span className="w-8 h-8 rounded-full flex items-center justify-center">
          <Bars3Icon className="w-5 h-5 text-[var(--color-verde)]" />
        </span>
      </div>
      <Marca n={1} className="top-1 right-[96px]" />

      <div className="relative rounded-3xl overflow-hidden text-white shadow-[0_24px_40px_rgba(18,83,92,0.28)]">
        <Image src="/images/club/fondos/atardecer.jpg" alt="" fill sizes="330px" className="object-cover" />

        {/* 2 — aviso para rascar */}
        <div className="relative z-10 flex justify-center pt-4">
          <span className="flex items-center gap-2 rounded-full bg-white/92 pl-3 pr-1.5 py-1.5 shadow-[0_10px_30px_rgba(18,83,92,0.22)]">
            <span className="text-[11px] font-semibold text-[var(--color-verde)] whitespace-nowrap">🎁 Tienes 1 sticker por revelar</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-verde)] text-[11px] font-bold text-[var(--color-cremita)]">Rascar</span>
          </span>
        </div>

        {/* 3 + 4 — nombre y Papela Coins */}
        <div className="relative flex items-start justify-between gap-3 px-5 pt-4 pb-2">
          <p className="font-serif text-[28px] leading-[1.05]">Tu nombre</p>
          <div className="text-right">
            <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-white/80">Papela Coins</p>
            <p className="font-serif text-[26px] leading-none mt-1 tabular-nums">$148.50</p>
          </div>
        </div>

        {/* 5–7 — portada */}
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

          {/* 8 — contador + planilla */}
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

      {/* Marcas sobre la tarjeta (posiciones según el layout de arriba) */}
      <Marca n={2} className="top-[86px] -left-3" />
      <Marca n={3} className="top-[136px] -left-3" />
      <Marca n={4} className="top-[136px] -right-3" />
      <Marca n={5} className="top-[214px] -left-3" />
      <Marca n={6} className="top-[214px] right-[30%]" />
      <Marca n={7} className="top-[318px] -right-3" />
      <Marca n={8} className="top-[420px] -left-3" />
    </div>
  );
}

export function TarjetaAnatomiaLeyenda() {
  return (
    <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
      {PARTES.map((p) => (
        <li key={p.n} className="flex gap-4">
          <span className="shrink-0 w-7 h-7 rounded-full bg-[#DD5A8B] text-white font-sans text-[13px] font-bold flex items-center justify-center">
            {p.n}
          </span>
          <div>
            <h3 className="font-serif italic text-[22px] leading-tight text-[#403C3C] mb-1">{p.titulo}</h3>
            <p className="font-sans text-[15px] leading-[22px] text-[var(--color-muted)]">{p.texto}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
