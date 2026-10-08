import { CartButton, useCartStore } from "papela-ds";
import { acuarelas, agenda, botones } from "./_fixtures";

const line = (p: typeof acuarelas, cantidad: number) => ({
  productoId: p.id, nombre: p.nombre, precio: p.precio, imagenUrl: p.imagen_url, stock: p.stock, cantidad,
});
const setCart = (items: ReturnType<typeof line>[]) => useCartStore.setState({ items, tipoEnvio: "recoger", isOpen: false });

// Navbar on a light page (iconColor verde) with 3 items → terracota badge.
export const Default = () => {
  setCart([line(acuarelas, 2), line(botones, 1)]);
  return (
    <div className="p-6 bg-[var(--color-bg)] flex items-center gap-4">
      <CartButton color="#12535C" />
    </div>
  );
};

// Over a colored hero the navbar uses the default light icon color.
export const SobreHero = () => {
  setCart([line(agenda, 1)]);
  return (
    <div className="p-6 flex items-center gap-4 rounded-2xl" style={{ background: "#5E7E86" }}>
      <CartButton />
    </div>
  );
};

// Empty cart: no badge.
export const Vacio = () => {
  setCart([]);
  return (
    <div className="p-6 bg-[var(--color-bg)] flex items-center gap-4">
      <CartButton color="#12535C" />
    </div>
  );
};

// 10+ items → badge caps at "9+".
export const MuchosArticulos = () => {
  setCart([line({ ...botones, stock: 12 }, 12)]);
  return (
    <div className="p-6 bg-[var(--color-bg)] flex items-center gap-4">
      <CartButton color="#12535C" />
    </div>
  );
};
