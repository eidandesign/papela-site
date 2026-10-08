import { HeroSection } from "papela-ds";

// HeroSection is 98vw wide by design (1vw side margins); this frame cancels
// the preview card's 24px body padding so the section sits like on the site.
const Page = ({ children }: { children: React.ReactNode }) => (
  <div style={{ margin: "-24px -24px 0", paddingBottom: 24, background: "var(--color-bg)" }}>{children}</div>
);

// Canonical page hero (/personaliza): badge pill + serif italic title +
// paragraph, cremita on a solid page color. The inner div is the required
// layout pattern (navbar clearance via pt-[140px] md:pt-[180px]).
export const Default = () => (
  <Page>
  <HeroSection bgColor="#5E7E86" showInk={false}>
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 md:px-20 pt-[140px] md:pt-[180px] pb-16 md:pb-20">
      <span data-hero-badge className="inline-flex items-center border border-[var(--color-cremita)]/40 rounded-full px-5 py-2 mb-8">
        <span className="label text-[var(--color-cremita)]/70">Hecho a la medida</span>
      </span>
      <h1 className="font-serif italic text-[clamp(2.5rem,5.5vw,5rem)] leading-[1.05] text-[var(--color-cremita)] max-w-2xl mb-6">
        Creamos piezas únicas para cada ocasión
      </h1>
      <p className="font-sans text-[var(--color-cremita)]/90 text-[18px] leading-[24px] max-w-lg">
        Stickers, toppers, tazas, etiquetas y detalles hechos especialmente para ti. Si tienes una idea, nosotros la diseñamos y la convertimos en algo físico, bonito y funcional.
      </p>
    </div>
  </HeroSection>
  </Page>
);

// Talleres color (#C4846A).
export const Talleres = () => (
  <Page>
  <HeroSection bgColor="#C4846A" showInk={false}>
    <div className="flex-1 flex flex-col items-center justify-center text-center px-10 md:px-20 pt-[140px] md:pt-[180px] pb-16 md:pb-20">
      <span data-hero-badge className="inline-flex items-center border border-[var(--color-cremita)]/40 rounded-full px-5 py-2 mb-8">
        <span className="label text-[var(--color-cremita)]/70">Próximos Talleres</span>
      </span>
      <h1 className="font-serif italic text-[clamp(2.5rem,5.5vw,5rem)] leading-[1.05] text-[var(--color-cremita)] max-w-2xl mb-6">
        Aprende, crea y llévate un momento inolvidable
      </h1>
      <p className="font-sans text-[var(--color-cremita)]/90 text-[18px] leading-[24px] max-w-lg">
        Talleres recreativos con maestros preparados para enseñar con la experiencia de su rama.
      </p>
    </div>
  </HeroSection>
  </Page>
);

// Compact title-only hero (/productos): default verde, no ribbon, no ink cursor.
export const Compact = () => (
  <Page>
  <HeroSection className="!min-h-0" showRibbon={false} showInk={false}>
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 md:px-20 pt-[140px] md:pt-[170px] pb-14 md:pb-16">
      <h1 className="font-serif italic text-[clamp(2.5rem,5.5vw,5rem)] leading-[1.05] text-[var(--color-cremita)] max-w-3xl">
        Todo lo que necesitas para crear, regalar e inspirarte
      </h1>
    </div>
  </HeroSection>
  </Page>
);
