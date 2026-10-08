import { BackToTop } from "papela-ds";

// Lives in the footer's bottom bar, next to the copyright line.
export const Default = () => (
  <div className="w-full border-t border-[var(--color-border)] py-5 flex flex-col md:flex-row items-center justify-between gap-3 px-5 text-xs text-[var(--color-muted)] bg-[var(--color-bg)]">
    <span>© 2026 Papela Atelier. Todos los derechos reservados.</span>
    <BackToTop />
  </div>
);
