import type { SelectHTMLAttributes } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { selectBase } from "@/lib/ui";

// Dropdown del DS: <select> nativo con la flecha nativa oculta (appearance-none
// vía selectBase) y un único chevron de Heroicons. Una sola fuente de verdad
// para que todos los selects del sitio se vean iguales.
export default function Select({
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...props} className={`${selectBase} ${className}`}>
        {children}
      </select>
      <ChevronDownIcon
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted)]"
      />
    </div>
  );
}
