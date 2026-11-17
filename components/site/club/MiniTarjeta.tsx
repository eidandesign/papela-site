import Image from "next/image";
import { PlusIcon } from "@heroicons/react/24/solid";

// Mini réplica ESTÁTICA de la tarjeta del Club (layout real de TarjetaClub:
// nombre + Papela Coins arriba, portada de 6 óvalos, contador, "Club Creativo"
// al pie). Es adorno: va aria-hidden. Los fondos son los mismos de la tarjeta
// (public/images/club/fondos) y los stickers, copias chicas en
// public/images/club/preview.

export type MiniTarjetaDatos = {
  fondo: string;
  /** tinta del texto sobre ese fondo (la misma `ink` que define TarjetaClub) */
  ink: string;
  nombre: string;
  coins: string;
  /** archivos de public/images/club/preview (con extensión) */
  stickers: string[];
  obtenidos: number;
  total: number;
};

export default function MiniTarjeta({ datos, className = "" }: { datos: MiniTarjetaDatos; className?: string }) {
  const { fondo, ink, nombre, coins, stickers, obtenidos, total } = datos;
  const libres = Math.max(0, 6 - stickers.length);
  return (
    <div
      aria-hidden="true"
      className={`relative w-[150px] rounded-[18px] overflow-hidden shadow-[0_18px_36px_rgba(64,60,60,0.22)] ${className}`}
      style={{ color: ink }}
    >
      <Image src={`/images/club/fondos/${fondo}.jpg`} alt="" fill sizes="160px" className="object-cover" />

      <div className="relative flex items-start justify-between gap-2 px-3 pt-3 pb-1.5">
        <p className="font-serif text-[14px] leading-[1.05] min-w-0">{nombre}</p>
        <div className="text-right shrink-0">
          <p className="text-[4.5px] font-bold uppercase tracking-[0.22em] opacity-80">Papela Coins</p>
          <p className="font-serif text-[13px] leading-none mt-0.5 tabular-nums">{coins}</p>
        </div>
      </div>

      <div className="relative grid grid-cols-3 gap-y-1.5 justify-items-center px-3 pt-1.5">
        {stickers.map((s) => (
          <span key={s} className="flex items-center justify-center w-[36px] h-[44px]">
            <Image src={`/images/club/preview/${s}`} alt="" width={32} height={32} className="w-[30px] h-[30px] object-contain drop-shadow-[0_2px_3px_rgba(0,0,0,0.25)]" />
          </span>
        ))}
        {Array.from({ length: libres }, (_, i) => (
          <span key={i} className="flex items-center justify-center w-[36px] h-[44px] rounded-[50%] border border-dashed" style={{ borderColor: ink, opacity: 0.6 }}>
            <PlusIcon className="w-3 h-3" />
          </span>
        ))}
      </div>

      <p className="relative text-center text-[8px] font-semibold mt-2">
        {obtenidos} / {total}
      </p>

      <div className="relative px-3 pt-3 pb-2.5">
        <p className="font-serif italic text-[13px] leading-tight">Club Creativo</p>
      </div>
    </div>
  );
}
