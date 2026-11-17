"use client";

import { useActionState, useState } from "react";
import { EyeIcon, EyeSlashIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { entrar, type EstadoAcceso } from "@/app/colabora/maestros/actions";

// Pantalla de contraseña de /colabora/maestros. No trae ningún dato de la
// página privada: todo lo confidencial se pinta en el servidor después de
// validar la contraseña.
export default function AccesoMaestros() {
  const [estado, accion, enviando] = useActionState<EstadoAcceso, FormData>(entrar, { error: null });
  const [ver, setVer] = useState(false);

  return (
    <form action={accion} className="w-full max-w-sm flex flex-col gap-3 text-left" noValidate>
      <label htmlFor="maestros-password" className="label text-[var(--color-cremita)]/85">
        Contraseña
      </label>
      <div className="relative">
        <LockClosedIcon
          aria-hidden="true"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)] pointer-events-none"
        />
        <input
          id="maestros-password"
          name="password"
          type={ver ? "text" : "password"}
          autoComplete="current-password"
          required
          aria-invalid={estado.error ? true : undefined}
          aria-describedby={estado.error ? "maestros-error" : undefined}
          className="w-full h-14 pl-12 pr-14 rounded-2xl border border-white/25 bg-white text-[var(--color-text)] font-sans text-base outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-rosa-papel)]/60"
        />
        <button
          type="button"
          onClick={() => setVer((v) => !v)}
          aria-label={ver ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center text-[var(--color-muted)] hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-[var(--color-cacao)]"
        >
          {ver ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
        </button>
      </div>

      <p id="maestros-error" role="alert" aria-live="assertive" className="min-h-[20px] font-sans text-sm text-[var(--color-rosa-papel)]">
        {estado.error}
      </p>

      <button
        type="submit"
        disabled={enviando}
        className="cursor-pointer group relative overflow-hidden h-14 rounded-full bg-[var(--color-rosa-papel)] text-[var(--color-cacao)] font-sans font-semibold text-base disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-rosa-papel)]"
      >
        <span className="absolute inset-0 bg-black/10 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
        <span className="relative">{enviando ? "Validando…" : "Entrar"}</span>
      </button>
    </form>
  );
}
