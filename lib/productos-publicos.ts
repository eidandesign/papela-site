import type { Producto, Variacion } from "./productos";

const ADMIN_API = "https://admin.papela-atelier.com/api/public/productos";

// La API pública del admin devuelve los productos del catálogo público
// (categoria = "Tienda") con su array de `tags` (la colección).
export type ProductoPublico = Producto & { tags?: string[] };

// Shape crudo que devuelve la API pública del admin.
interface ProductoApi {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  precio_min?: number;
  precio_max?: number;
  stock: number;
  imagen_url: string | null;
  imagenes?: string[];
  tags?: string[];
  tamano?: string | null;
  variaciones?: (Variacion & { stock: number })[] | null;
}

/**
 * Normaliza un producto de la API y aplica la regla de stock:
 * - Solo se conservan las variaciones con stock >= 1.
 * - El producto se descarta luego (en el filtro) si no queda nada disponible.
 */
function normalizar(p: ProductoApi): ProductoPublico {
  const variaciones = (p.variaciones ?? []).filter((v) => (v.stock ?? 0) > 0);
  return {
    id: p.id,
    nombre: p.nombre,
    precio: p.precio,
    imagen_url: p.imagen_url,
    categoria: "Tienda",
    descripcion: p.descripcion,
    stock: p.stock,
    color: null,
    medida: p.tamano ?? null,
    variaciones: variaciones.length > 0 ? variaciones : null,
    imagenes: p.imagenes,
    precio_min: p.precio_min,
    precio_max: p.precio_max,
    tags: p.tags,
  };
}

/**
 * Un producto es comprable si tiene stock >= 1. Si tiene variaciones, debe
 * quedar al menos una variación disponible tras filtrar por stock.
 */
function disponible(p: ProductoPublico): boolean {
  // Con variaciones: ya vienen filtradas a stock >= 1, basta que quede alguna.
  if (p.variaciones && p.variaciones.length > 0) return true;
  // Sin variaciones: depende del stock agregado del producto.
  return p.stock > 0;
}

function mapProductos(raw: unknown): ProductoPublico[] {
  const arr = Array.isArray(raw) ? (raw as ProductoApi[]) : [];
  return arr.map(normalizar).filter(disponible);
}

export async function getProductosPorColeccion(coleccion: string): Promise<Producto[]> {
  try {
    const res = await fetch(`${ADMIN_API}?coleccion=${coleccion}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return mapProductos(data.productos);
  } catch {
    return [];
  }
}

// Todos los productos del catálogo público (sin filtrar por colección).
export async function getProductosPublicos(): Promise<ProductoPublico[]> {
  try {
    const res = await fetch(ADMIN_API, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return mapProductos(data.productos);
  } catch {
    return [];
  }
}
