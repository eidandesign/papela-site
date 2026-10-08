import { useEffect } from "react";
import { ProductDrawer, useCartStore, useProductDrawerStore } from "papela-ds";
import { acuarelas, agenda, businessNotebook } from "./_fixtures";

// Opened the way ProductCard does it: useProductDrawerStore.open(producto).
const Open = ({ producto }: { producto: any }) => {
  useCartStore.setState({ items: [], tipoEnvio: "recoger", isOpen: false });
  useEffect(() => { useProductDrawerStore.getState().open(producto); }, [producto]);
  return (
    <div className="p-6 bg-[var(--color-bg)]" style={{ minHeight: "100vh" }}>
      <ProductDrawer />
    </div>
  );
};

// Product with variations: thumbnail selector, medida, low-stock note.
export const Default = () => <Open producto={agenda} />;

// Variations that carry a color attribute (Business notebook).
export const ConColor = () => <Open producto={businessNotebook} />;

// Simple product without variations.
export const SinVariaciones = () => <Open producto={acuarelas} />;
