import { QuickAddButton, useCartStore } from "papela-ds";
import { acuarelas, botones, charm } from "./_fixtures";

type P = typeof acuarelas;

// QuickAddButton is absolutely positioned (bottom-right) inside the card image,
// as ProductCard places it. This frame is just the relative image box.
const ImageBox = ({ p }: { p: P }) => (
  <div className="relative rounded-2xl overflow-hidden bg-[var(--color-cremita-2)]" style={{ width: 220, height: 220 }}>
    <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-cover" />
    <QuickAddButton productoId={p.id} nombre={p.nombre} precio={p.precio} imagenUrl={p.imagen_url} stock={p.stock} />
  </div>
);

const setCart = (lines: { p: P; cantidad: number }[]) =>
  useCartStore.setState({
    isOpen: false,
    tipoEnvio: "recoger",
    items: lines.map(({ p, cantidad }) => ({
      productoId: p.id, nombre: p.nombre, precio: p.precio, imagenUrl: p.imagen_url, stock: p.stock, cantidad,
    })),
  });

// Collapsed: just the verde "+" circle (product not in the cart yet).
export const Default = () => {
  setCart([]);
  return (
    <div className="p-6 bg-[var(--color-bg)] flex gap-6">
      <ImageBox p={acuarelas} />
    </div>
  );
};

// Expanded pill "− N +" once the product is in the cart.
export const EnCarrito = () => {
  setCart([{ p: botones, cantidad: 2 }]);
  return (
    <div className="p-6 bg-[var(--color-bg)] flex gap-6">
      <ImageBox p={botones} />
    </div>
  );
};

// At the stock cap (3 of 3): the "+" dims and stops adding.
export const TopeDeStock = () => {
  setCart([{ p: charm, cantidad: 3 }]);
  return (
    <div className="p-6 bg-[var(--color-bg)] flex gap-6">
      <ImageBox p={charm} />
    </div>
  );
};
