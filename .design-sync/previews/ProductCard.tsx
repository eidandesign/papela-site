import { ProductCard } from "papela-ds";
import { acuarelas, agenda, botones, businessNotebook } from "./_fixtures";

// Default card (home carousels): 3:4 image, sans title, QuickAdd "+" when the
// product has no variations.
export const Default = () => (
  <div className="p-6 bg-[var(--color-bg)] flex gap-6">
    <ProductCard producto={acuarelas} />
    <ProductCard producto={botones} />
  </div>
);

// With variations the "+" opens the ProductDrawer so the customer picks one.
export const WithVariations = () => (
  <div className="p-6 bg-[var(--color-bg)] flex gap-6">
    <ProductCard producto={agenda} />
  </div>
);

// variant="catalog": compact Figma card used on /productos — square image, serif title.
export const Catalog = () => (
  <div className="p-6 bg-[var(--color-bg)] flex gap-6">
    <ProductCard producto={businessNotebook} variant="catalog" />
    <ProductCard producto={acuarelas} variant="catalog" />
  </div>
);

// fullWidth: fills its grid cell (collection pages).
export const InGrid = () => (
  <div className="p-6 bg-[var(--color-bg)] grid grid-cols-2 gap-6 w-[560px]">
    <ProductCard producto={agenda} variant="catalog" fullWidth />
    <ProductCard producto={botones} variant="catalog" fullWidth />
  </div>
);
