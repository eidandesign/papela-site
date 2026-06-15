import Link from "next/link";
import { ClockIcon } from "@heroicons/react/24/solid";

export default function TallerPagoPendiente() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-5">
      <div className="text-center max-w-md">
        <ClockIcon className="w-16 h-16 text-[var(--color-verde)] mx-auto mb-6 opacity-70" />
        <h1 className="font-serif italic text-[clamp(2rem,4vw,3rem)] text-[var(--color-text)] mb-4">
          Pago en proceso
        </h1>
        <p className="font-sans text-[var(--color-muted)] text-base leading-relaxed mb-8">
          Tu pago está siendo procesado. Te notificaremos por correo en cuanto se confirme tu reserva.
        </p>
        <Link
          href="/talleres"
          className="inline-flex items-center gap-2 bg-[var(--color-verde)] text-[var(--color-cremita)] font-sans font-semibold px-8 py-4 rounded-full hover:opacity-90 transition-opacity"
        >
          Ver más talleres
        </Link>
      </div>
    </div>
  );
}
