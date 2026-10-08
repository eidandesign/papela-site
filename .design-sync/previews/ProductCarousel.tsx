import { ProductCarousel, useCartStore } from "papela-ds";
import { acuarelas, agenda, album, botones, businessNotebook, charm, productos } from "./_fixtures";

const resetCart = () => useCartStore.setState({ items: [], tipoEnvio: "recoger", isOpen: false });

// Section frame copied from the home page: serif heading + "Ver todo →" link
// in the 90% container, then the full-bleed carousel (5vw lead-in).
const Section = ({ title, bg, children }: { title: string; bg?: string; children: React.ReactNode }) => {
  resetCart();
  return (
    <section className={`py-12 ${bg ?? "bg-[var(--color-bg)]"}`}>
      <div className="w-[90%] mx-auto mb-6 flex items-end justify-between">
        <h2 className="font-serif font-extralight text-[clamp(1.8rem,3.5vw,2.8rem)] text-[#403C3C]">{title}</h2>
        <span className="text-sm font-medium text-[var(--color-muted)]">Ver todo →</span>
      </div>
      {children}
    </section>
  );
};

// Home "Libretas" row: more cards than fit, so the right arrow shows.
export const Default = () => (
  <Section title="Libretas">
    <ProductCarousel productos={[agenda, businessNotebook, album, agenda, businessNotebook, album, agenda]} />
  </Section>
);

// "Los favoritos" on the cremita/40 band of the home page.
export const Favoritos = () => (
  <Section title="Los favoritos" bg="bg-[var(--color-cremita)]/40">
    <ProductCarousel productos={[...productos, acuarelas, botones]} />
  </Section>
);

// Short collection (fits without overflow): no arrows, row stays aligned at 5vw.
export const PocosProductos = () => (
  <Section title="Charms y botones">
    <ProductCarousel productos={[charm, botones]} />
  </Section>
);
