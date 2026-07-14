"use client";

import { ArrowRightIcon } from "@heroicons/react/24/solid";
import type { Horario } from "@/lib/clases";
import type { TipoClasePublico } from "@/lib/clases-tipos";
import { useReservaModalStore } from "@/lib/stores/reservaModalStore";

export default function ReservaButton({
  horarios,
  claseNombre,
  whatsapp,
  tipos,
  label = "Reservar Clase",
  variant = "solid",
  size = "md",
  showArrow = true,
  className = "",
}: {
  horarios: Horario[];
  claseNombre: string;
  whatsapp: string | null;
  tipos: TipoClasePublico[];
  label?: string;
  variant?: "solid" | "outline";
  size?: "md" | "sm";
  showArrow?: boolean;
  className?: string;
}) {
  const open = useReservaModalStore((s) => s.open);

  const sizeStyles =
    size === "sm" ? "gap-2 px-5 py-2.5 text-sm" : "gap-3 px-7 py-3.5 text-sm";
  const base = `group relative inline-flex items-center justify-center overflow-hidden rounded-full font-sans font-semibold transition-colors ${sizeStyles}`;
  const styles =
    variant === "solid"
      ? "bg-[var(--color-verde)] text-[var(--color-cremita)]"
      : "border border-[var(--color-verde)] text-[var(--color-verde)] hover:text-[var(--color-cremita)]";

  return (
    <button
      type="button"
      onClick={() => open({ horarios, claseNombre, whatsapp, tipos })}
      className={`${base} ${styles} ${className}`}
    >
      {variant === "outline" && (
        <span className="absolute inset-0 origin-left scale-x-0 bg-[var(--color-verde)] transition-transform duration-300 group-hover:scale-x-100" />
      )}
      <span className="relative z-10">{label}</span>
      {showArrow && (
        <ArrowRightIcon className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      )}
    </button>
  );
}
