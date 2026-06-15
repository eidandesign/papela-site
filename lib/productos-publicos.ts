import type { Producto } from "./productos";

const ADMIN_API = "https://admin.papela-atelier.com/api/public/productos";

export async function getProductosPorColeccion(coleccion: string): Promise<Producto[]> {
  try {
    const res = await fetch(`${ADMIN_API}?coleccion=${coleccion}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.productos ?? [];
  } catch {
    return [];
  }
}
