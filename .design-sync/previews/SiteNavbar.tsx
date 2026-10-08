import { useEffect } from "react";
import { SiteNavbar, HeroSection } from "papela-ds";

// The card body has 24px padding; this frame cancels it so the 98vw hero and
// the fixed navbar sit exactly like on the site.
const Page = ({ children }: { children: React.ReactNode }) => (
  <div style={{ margin: "-24px -24px 0", paddingBottom: 24, background: "var(--color-bg)" }}>{children}</div>
);

const Hero = () => (
  <HeroSection showInk={false}>
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 md:px-20 pt-[140px] md:pt-[180px] pb-16 md:pb-20">
      <span data-hero-badge className="inline-flex items-center border border-[var(--color-cremita)]/40 rounded-full px-5 py-2 mb-8">
        <span className="label text-[var(--color-cremita)]/70">Papelería · Talleres · Diseño</span>
      </span>
      <h1 className="font-serif italic text-[clamp(2.5rem,5.5vw,5rem)] leading-[1.05] text-[var(--color-cremita)] max-w-2xl mb-6">
        Un lugar para crear con las manos
      </h1>
      <p className="font-sans text-[var(--color-cremita)]/90 text-[18px] leading-[24px] max-w-lg">
        Libretas, stickers, talleres y clases de arte en Puebla.
      </p>
    </div>
  </HeroSection>
);

// Large state (top of page): transparent header over the colored hero —
// cremita links flank the animated logo, cart in the corner.
export const Default = () => (
  <Page>
    <SiteNavbar />
    <Hero />
  </Page>
);

// After scrolling past 60px the large header swaps for the floating
// "liquid glass" pill (dark translucent, blur) with all links + cart.
const ScrollDown = () => {
  useEffect(() => {
    const t = setTimeout(() => window.scrollTo(0, 420), 60);
    return () => clearTimeout(t);
  }, []);
  return null;
};

export const Scrolled = () => (
  <Page>
    <SiteNavbar />
    <Hero />
    <section className="w-[90%] mx-auto py-12 md:py-16">
      <h2 className="font-serif font-extralight text-[#403C3C] text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] mb-6">
        Nuestras libretas
      </h2>
      <p className="font-sans text-[18px] leading-[26px] text-[var(--color-text)] max-w-2xl">
        Cada libreta se arma a mano en Papela: papel de algodón, costura expuesta y portadas
        ilustradas por artistas locales.
      </p>
      <div style={{ height: 900 }} />
    </section>
    <ScrollDown />
  </Page>
);
