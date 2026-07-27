"use client";

// Bottom sheet del Club (la "hoja"): velo + panel blanco que sube desde abajo
// en mobile y aparece centrado en desktop. Lo usan la ficha de un
// coleccionable y el selector de portada.
//
// El padre decide cuándo montarlo, así que la SALIDA se anima aquí: al cerrar
// se pinta `club-hoja--sale` y recién al terminar se avisa con onCerrar.
// Los children reciben ese `cerrar` para poder cerrar desde adentro.

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { SALIDA_MS } from "./clubTipos";

export default function HojaClub({
  label, onCerrar, escape = true, children,
}: {
  label: string;
  onCerrar: () => void;
  escape?: boolean;   // false cuando algo encima (p. ej. el modal de regalo) maneja Escape
  children: (cerrar: () => void) => ReactNode;
}) {
  const [cerrando, setCerrando] = useState(false);

  // Con movimiento reducido no hay animación que esperar: cierra de inmediato.
  const cerrar = useCallback(() => {
    if (cerrando) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return onCerrar();
    setCerrando(true);
    setTimeout(onCerrar, SALIDA_MS);
  }, [cerrando, onCerrar]);

  useEffect(() => {
    if (!escape) return;
    const alTeclear = (e: KeyboardEvent) => { if (e.key === "Escape") cerrar(); };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [escape, cerrar]);

  return (
    <div role="dialog" aria-modal="true" aria-label={label}
      className="fixed inset-0 z-[100003] flex items-end sm:items-center justify-center">
      <div className={`absolute inset-0 bg-black/45 backdrop-blur-sm ${cerrando ? "club-velo--sale" : "club-velo"}`}
        onClick={cerrar} aria-hidden="true" />
      <div className={`relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] overflow-y-auto p-6 ${
        cerrando ? "club-hoja--sale" : "club-hoja"
      }`}>
        <button onClick={cerrar} aria-label="Cerrar"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-cremita-3)] transition">
          ✕
        </button>
        {children(cerrar)}
      </div>
    </div>
  );
}
