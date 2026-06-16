import type { Producto } from "./productos";

const ADMIN_API = "https://admin.papela-atelier.com/api/public/productos";

// La API pública del admin devuelve los productos del catálogo público
// (categoria = "Tienda") con su array de `tags` (la colección).
export type ProductoPublico = Producto & { tags?: string[] };

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

// Todos los productos del catálogo público (sin filtrar por colección).
export async function getProductosPublicos(): Promise<ProductoPublico[]> {
  try {
    const res = await fetch(ADMIN_API, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.productos ?? [];
  } catch {
    return [];
  }
}
