import { useEffect } from "react";
import { CartDrawer, useCartStore } from "papela-ds";
import { acuarelas, agenda, botones, charm } from "./_fixtures";

type Item = { productoId: string; nombre: string; precio: number; imagenUrl: string | null; stock: number; cantidad: number; variacionId?: string; variacionNombre?: string };

const line = (p: typeof acuarelas, cantidad: number): Item => ({
  productoId: p.id, nombre: p.nombre, precio: p.precio, imagenUrl: p.imagen_url, stock: p.stock, cantidad,
});
const vLine = (i: number, cantidad: number): Item => {
  const v = agenda.variaciones[i];
  return { productoId: agenda.id, nombre: `${agenda.nombre} · ${v.nombre}`, precio: v.precio, imagenUrl: v.imagen_url, stock: v.stock, cantidad, variacionId: v.id, variacionNombre: v.nombre };
};

// Cart is opened the way CartButton does it: useCartStore.openCart().
const Open = ({ items, tipoEnvio }: { items: Item[]; tipoEnvio: "recoger" | "envio" }) => {
  useCartStore.setState({ items, tipoEnvio });
  useEffect(() => { useCartStore.getState().openCart(); }, []);
  return (
    <div className="p-6 bg-[var(--color-bg)]" style={{ minHeight: "100vh" }}>
      <CartDrawer />
    </div>
  );
};

// Pick-up at Papela (free): agenda variation + two Botones Duo.
export const Default = () => (
  <Open tipoEnvio="recoger" items={[vLine(1, 1), line(botones, 2)]} />
);

// Home delivery selected: +$80 MXN shipping in the totals.
export const ConEnvio = () => (
  <Open tipoEnvio="envio" items={[vLine(0, 1), line(acuarelas, 1)]} />
);

// Quantity at the stock snapshot: "+" capped, "Solo N disponibles" note.
export const TopeDeStock = () => (
  <Open tipoEnvio="recoger" items={[line(charm, 3), vLine(0, 2)]} />
);

// Empty cart state.
export const Vacio = () => <Open tipoEnvio="recoger" items={[]} />;
