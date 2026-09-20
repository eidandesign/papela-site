// Botones compartidos de Dopamina (letra blanca sobre el cielo).
// (El primario de la pantalla final es el CTA blanco de Instagram, inline.)
export const btnFantasma =
  "inline-flex items-center justify-center rounded-full border border-[rgba(255,255,255,0.5)] text-white font-sans text-[13px] font-medium px-6 py-2.5 hover:bg-[rgba(0,0,0,0.12)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";
// Terciario: link con ícono. Sin caja ni borde — el nivel más bajo de la
// jerarquía, para acciones que no son el camino principal de la pantalla.
// Blanco pleno: el nivel se marca con tamaño/peso, no bajando la opacidad —
// blanco al 70% sobre el cielo caía a ~2.9:1 de contraste.
export const btnTerciario =
  "inline-flex items-center gap-2 font-sans text-[13px] font-medium text-white underline underline-offset-[6px] decoration-[rgba(255,255,255,0.5)] hover:decoration-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white rounded-sm";
