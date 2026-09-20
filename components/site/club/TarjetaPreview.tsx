import Image from "next/image";
import { PlusIcon } from "@heroicons/react/24/solid";

// Mini réplica ESTÁTICA de la tarjeta del Club (TarjetaClub) para la landing
// del Club Creativo: mismo layout de pase (título + N.º de socio, portada de
// óvalos, contador, nombre) con el fondo "atardecer" y cuatro coleccionables
// reales. Es puro adorno: va aria-hidden y no carga nada del admin — los
// assets viven en public/images/club/preview (copias chicas en webp).
const STICKERS = ["flor", "monstera", "esfera", "caballo"];

export default function TarjetaPreview({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`relative w-[190px] md:w-[210px] rounded-[20px] overflow-hidden text-white shadow-[0_22px_40px_rgba(74,59,49,0.32)] ${className}`}
    >
      <Image
        src="/images/club/preview/fondo-atardecer.webp"
        alt=""
        fill
        sizes="210px"
        className="object-cover"
      />

      {/* Header — título + N.º de socio */}
      <div className="relative flex items-start justify-between gap-2 px-4 pt-4 pb-3">
        <p className="font-serif italic text-[17px] leading-tight whitespace-nowrap">Club Creativo</p>
        <div className="text-right flex-shrink-0">
          <p className="text-[5px] font-bold uppercase tracking-[0.22em] text-white/75">N.º de socio</p>
          <p className="font-mono text-[10px] tracking-[0.14em]">0427</p>
        </div>
      </div>

      {/* Portada: 4 coleccionables + 2 espacios libres */}
      <div className="relative grid grid-cols-3 gap-x-2 gap-y-2.5 px-4 justify-items-center">
        {STICKERS.map((s) => (
          <span key={s} className="flex items-center justify-center w-[46px] h-[56px]">
            <Image
              src={`/images/club/preview/${s}.webp`}
              alt=""
              width={42}
              height={42}
              className="w-[42px] h-[42px] object-contain drop-shadow-[0_3px_5px_rgba(0,0,0,0.25)]"
            />
          </span>
        ))}
        {[0, 1].map((i) => (
          <span
            key={i}
            className="flex items-center justify-center w-[46px] h-[56px] rounded-[50%] border border-dashed border-white/80"
          >
            <PlusIcon className="w-3.5 h-3.5" />
          </span>
        ))}
      </div>

      <p className="relative text-center text-[9px] font-semibold mt-3">4 / 100</p>

      {/* Miembro */}
      <div className="relative flex items-end justify-between gap-2 px-4 pt-4 pb-4">
        <p className="font-serif text-[15px] leading-snug">Tu nombre</p>
        <div className="text-right flex-shrink-0">
          <p className="text-[5px] font-bold uppercase tracking-[0.22em] text-white/75">Miembro desde</p>
          <p className="text-[7px] text-white/85">hoy</p>
        </div>
      </div>
    </div>
  );
}
