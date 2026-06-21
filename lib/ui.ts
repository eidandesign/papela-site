// Estilos base compartidos del design system.
// Una sola fuente de verdad para inputs / selects (dropdowns) en todo el sitio.

export const inputBase =
  "w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 font-sans text-[15px] text-[var(--color-text)] placeholder:text-[var(--color-muted)]/70 outline-none transition-colors focus:border-[var(--color-verde)]";

// Variante para <select>: oculta la flecha nativa (appearance-none) y deja
// espacio a la derecha para el chevron de Heroicons. Usar siempre vía <Select>.
export const selectBase =
  "w-full appearance-none cursor-pointer rounded-xl border border-[var(--color-border)] bg-white pl-4 pr-10 py-3 font-sans text-[15px] text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-verde)]";
