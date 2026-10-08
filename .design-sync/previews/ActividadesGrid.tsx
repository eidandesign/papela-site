import { ActividadesGrid } from "papela-ds";
import { actividadesCelia } from "./_fixtures";

// /clases/celia "Más información": activity cards (4:3 photo, terracota age
// pill, serif title, 3-line clamp, "Ver más") — tapping one opens HojaInferior
// with the full description and materials list.
export const Default = () => (
  <section className="p-6 bg-[var(--color-bg)]">
    <h2 className="text-center font-serif font-extralight text-[clamp(2rem,4.5vw,3.25rem)] text-[#403c3c] leading-tight mb-8">
      Más información
    </h2>
    <ActividadesGrid actividades={actividadesCelia} />
  </section>
);

// An activity without `imagen` keeps the blush placeholder block.
export const WithoutImage = () => (
  <section className="p-6 bg-[var(--color-bg)]">
    <ActividadesGrid
      actividades={[
        actividadesCelia[0],
        { ...actividadesCelia[4], imagen: undefined },
      ]}
    />
  </section>
);
