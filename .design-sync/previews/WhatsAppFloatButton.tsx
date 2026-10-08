import { WhatsAppFloatButton } from "papela-ds";

// Fixed verde circle at the bottom-right corner, floating over page content.
// The viewport is < md, so it sits at bottom-28 (clears the mobile navbar pill).
export const Default = () => (
  <div style={{ margin: -24, minHeight: 320, padding: 24, background: "var(--color-bg)" }}>
    <p className="label text-[var(--color-terracota)] mb-3">Hecho a la medida</p>
    <h2 className="font-serif font-extralight text-[#403C3C] text-[32px] leading-tight mb-3">
      Creamos piezas únicas para cada ocasión
    </h2>
    <p className="font-sans text-[16px] leading-6 text-[var(--color-muted)]" style={{ maxWidth: 320 }}>
      Stickers, toppers, tazas y etiquetas hechos especialmente para ti.
    </p>
    <WhatsAppFloatButton />
  </div>
);
