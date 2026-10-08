import { AnimatedLogo } from "papela-ds";

// Navbar large state: cremita logo over a colored hero.
export const Default = () => (
  <div className="flex items-center justify-center rounded-[32px] p-10" style={{ background: "var(--color-verde)" }}>
    <div style={{ width: 130, height: 130 }}><AnimatedLogo color="var(--color-cremita)" className="w-full h-full" /></div>
  </div>
);

// Light pages (/clases/<maestra>, checkout): the logo switches to verde.
export const Verde = () => (
  <div className="flex items-center justify-center rounded-[32px] p-10 bg-[var(--color-bg)]">
    <div style={{ width: 130, height: 130 }}><AnimatedLogo color="var(--color-verde)" className="w-full h-full" /></div>
  </div>
);

// Sizes used on the site: floating nav pill (44px), mobile menu (80px),
// large header (130px).
export const Tamanos = () => (
  <div className="flex items-end justify-center gap-8 rounded-[32px] p-10" style={{ background: "#4F8674" }}>
    <AnimatedLogo className="w-11 h-11" />
    <AnimatedLogo className="w-[80px] h-[80px]" />
    <div style={{ width: 130, height: 130 }}><AnimatedLogo className="w-full h-full" /></div>
  </div>
);
