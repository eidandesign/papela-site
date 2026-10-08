import { TalleresGallery } from "papela-ds";

// Home "Más de 100 personas" band: floating, tilted photo frames scattered
// around a centered ultralight serif heading + verde pill CTA.
export const Default = () => (
  <div className="bg-[var(--color-bg)]">
    <TalleresGallery cta={{ label: "Ver talleres", href: "/talleres" }} />
  </div>
);

// /talleres/[id] usage: no CTA.
export const WithoutCta = () => (
  <div className="bg-[var(--color-bg)]">
    <TalleresGallery />
  </div>
);
