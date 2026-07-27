"use client";

// Menú de la tarjeta del Club — pastilla "liquid glass" al estilo del navbar
// del sitio (blur saturado + hamburguesa animada). Agrupa la campana de avisos
// y un desplegable con las acciones de la tarjeta: personalizar, compartir y
// ver la planilla (esta última sigue también dentro de la tarjeta).

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BellIcon, ShareIcon, Squares2X2Icon, SwatchIcon } from "@heroicons/react/24/outline";
import AnimatedBurger from "../AnimatedBurger";

// Mismo cristal que el navbar flotante del sitio (blur + saturación), pero en
// claro: aquí flota sobre el fondo crema y sobre la tarjeta del miembro, donde
// un vidrio negro se ve gris apagado y deja la tinta con poco contraste.
// Blanco 62% + tinta verde da ~7:1 sobre los dos fondos.
const VIDRIO = {
  background: "rgba(255, 255, 255, 0.62)",
  backdropFilter: "blur(20px) saturate(180%)",
  WebkitBackdropFilter: "blur(20px) saturate(180%)",
  border: "1px solid rgba(255, 255, 255, 0.75)",
  boxShadow: "0 8px 32px rgba(18, 83, 92, 0.14)",
} as const;

const TINTA = "var(--color-verde)";

export default function MenuClub({
  abierto, noLeidos, onAbrir, onCampana, onPersonalizar, onCompartir, onPlanilla,
}: {
  abierto: boolean;
  noLeidos: number;
  onAbrir: (v: boolean) => void;
  onCampana: () => void;
  onPersonalizar: () => void;
  onCompartir: () => void;
  onPlanilla: () => void;
}) {
  const caja = useRef<HTMLDivElement>(null);

  // Tocar fuera o Escape cierra el desplegable.
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: PointerEvent) => {
      if (!caja.current?.contains(e.target as Node)) onAbrir(false);
    };
    const tecla = (e: KeyboardEvent) => { if (e.key === "Escape") onAbrir(false); };
    window.addEventListener("pointerdown", fuera);
    window.addEventListener("keydown", tecla);
    return () => {
      window.removeEventListener("pointerdown", fuera);
      window.removeEventListener("keydown", tecla);
    };
  }, [abierto, onAbrir]);

  // Cada opción cierra el menú antes de hacer lo suyo.
  const opciones = [
    { icono: SwatchIcon, label: "Personalizar tarjeta", accion: onPersonalizar },
    { icono: ShareIcon, label: "Compartir mi tarjeta", accion: onCompartir },
    { icono: Squares2X2Icon, label: "Ver mi planilla completa", accion: onPlanilla },
  ];

  return (
    <div ref={caja} className="relative">
      <div className="flex items-center gap-1 rounded-full p-1.5" style={VIDRIO}>
        <button onClick={onCampana}
          aria-label={`Notificaciones${noLeidos > 0 ? ` (${noLeidos} nuevas)` : ""}`}
          className="relative w-10 h-10 rounded-full flex items-center justify-center transition hover:bg-[var(--color-verde)]/10">
          <BellIcon className="w-[22px] h-[22px]" style={{ color: TINTA }} aria-hidden="true" />
          {noLeidos > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--color-terracota)] text-white text-[10px] font-bold flex items-center justify-center">
              {noLeidos}
            </span>
          )}
        </button>

        <span className="w-px h-6 bg-[var(--color-verde)]/20" aria-hidden="true" />

        <button onClick={() => onAbrir(!abierto)}
          aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={abierto}
          aria-controls="club-menu"
          className="w-10 h-10 rounded-full flex items-center justify-center transition hover:bg-[var(--color-verde)]/10"
          style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}>
          <AnimatedBurger isOpen={abierto} color="#12535C" />
        </button>
      </div>

      <AnimatePresence>
        {abierto && (
          <motion.div
            id="club-menu"
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-[248px] origin-top-right rounded-3xl p-2"
            style={VIDRIO}
          >
            {opciones.map(({ icono: Icono, label, accion }) => (
              <button key={label} role="menuitem"
                onClick={() => { onAbrir(false); accion(); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left text-sm font-medium transition hover:bg-[var(--color-verde)]/10"
                style={{ color: TINTA }}>
                <Icono className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
