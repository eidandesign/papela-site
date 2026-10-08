import { AddToCartButton, useCartStore } from "papela-ds";
import { acuarelas, agenda, charm } from "./_fixtures";

const setCart = (items: any[] = []) => useCartStore.setState({ items, tipoEnvio: "recoger", isOpen: false });

// Primary verde pill with the bag icon (fill slides in on hover).
export const Default = () => {
  setCart();
  return (
    <div className="p-6 bg-[var(--color-bg)] flex">
      <AddToCartButton productoId={acuarelas.id} nombre={acuarelas.nombre} precio={acuarelas.precio} imagenUrl={acuarelas.imagen_url} stock={acuarelas.stock} />
    </div>
  );
};

// fullWidth, as in the ProductDrawer footer: grows next to the WhatsApp link.
export const FullWidth = () => {
  setCart();
  const v = agenda.variaciones[1];
  return (
    <div className="p-6 bg-[var(--color-bg)] flex gap-3" style={{ width: 460 }}>
      <AddToCartButton
        fullWidth
        productoId={agenda.id}
        nombre={`${agenda.nombre} · ${v.nombre}`}
        precio={v.precio}
        imagenUrl={v.imagen_url}
        stock={v.stock}
        variacionId={v.id}
        variacionNombre={v.nombre}
      />
    </div>
  );
};

// Everything already in the cart (3 of 3): disabled at 60% opacity.
export const TopeDeStock = () => {
  setCart([{ productoId: charm.id, nombre: charm.nombre, precio: charm.precio, imagenUrl: charm.imagen_url, stock: charm.stock, cantidad: 3 }]);
  return (
    <div className="p-6 bg-[var(--color-bg)] flex">
      <AddToCartButton productoId={charm.id} nombre={charm.nombre} precio={charm.precio} imagenUrl={charm.imagen_url} stock={charm.stock} />
    </div>
  );
};

// stock 0 → grey "Agotado" pill.
export const Agotado = () => {
  setCart();
  return (
    <div className="p-6 bg-[var(--color-bg)] flex">
      <AddToCartButton productoId={charm.id} nombre={charm.nombre} precio={charm.precio} imagenUrl={charm.imagen_url} stock={0} />
    </div>
  );
};
