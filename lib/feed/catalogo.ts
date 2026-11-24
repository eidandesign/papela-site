// Con extensión .ts a propósito: los tests corren con `node --test` (type
// stripping nativo de Node), que no resuelve imports sin extensión.
import { SITE_URL } from "../site.ts";

// ─────────────────────────────────────────────────────────────────────────────
// Modelo de catálogo normalizado para feeds de producto.
//
// Separación modelo / adaptador:
//  - Este archivo convierte la respuesta cruda del API público del admin
//    (GET https://admin.papela-atelier.com/api/public/productos) en
//    `ArticuloCatalogo[]`: una fila por producto simple o por variante,
//    agnóstica del canal (sin encabezados, formatos de precio ni reglas de
//    Meta). El API ya resuelve la herencia de las variantes (precio, stock y
//    foto heredados de la principal), así que aquí NO se re-implementa.
//  - Cada canal tiene su adaptador: `lib/feed/meta.ts` mapea
//    ArticuloCatalogo → filas del catálogo de Meta. Un futuro adaptador de
//    Google Merchant reusa este mismo modelo sin tocar este archivo.
//
// A diferencia de `lib/productos-publicos.ts` (que filtra agotados a
// propósito, para el sitio), el catálogo de feeds CONSERVA los agotados:
// los canales los marcan "out of stock" pero las filas nunca desaparecen,
// para que el retargeting y las etiquetas viejas sigan vivas.
// ─────────────────────────────────────────────────────────────────────────────

/** Variación tal como la expone el API público del admin (ya resuelta). */
export interface VariacionFeedApi {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
  imagen_url: string | null;
}

/** Subconjunto del producto crudo del API público que el feed necesita. */
export interface ProductoFeedApi {
  id: string;
  nombre: string;
  slug?: string | null;
  descripcion: string | null;
  precio: number;
  stock: number;
  imagen_url: string | null;
  imagenes?: string[];
  tags?: string[];
  /** Aún no desplegado en el admin: puede llegar undefined (= sin marca). */
  marca?: string | null;
  variaciones?: VariacionFeedApi[] | null;
}

/** Una fila del catálogo: un producto simple o UNA variante de un producto. */
export interface ArticuloCatalogo {
  /** uuid del producto, o de la variante cuando la fila es una variante. */
  id: string;
  /** uuid del producto padre cuando la fila es una variante; si no, null. */
  grupoId: string | null;
  /** "Producto" o "Producto – Variante" (sin truncar; eso es del canal). */
  nombre: string;
  /** Nombre de la variante sola (p. ej. "Rosas"); null en producto simple. */
  variante: string | null;
  descripcion: string | null;
  /** Precio en MXN (de la variante cuando aplica). */
  precio: number;
  /** Stock de la fila, nunca negativo. */
  stock: number;
  disponible: boolean;
  /** Ficha pública; las variantes usan la URL de su producto. */
  url: string;
  /** Foto de la fila. Siempre presente: sin foto la fila queda fuera. */
  imagen: string;
  /** Fotos adicionales del producto (sin repetir la principal de la fila). */
  imagenesExtra: string[];
  marca: string | null;
  tags: string[];
}

export interface Catalogo {
  articulos: ArticuloCatalogo[];
  /** Filas excluidas por no tener ninguna foto (ni propia ni heredada). */
  sinFoto: string[];
}

function limpia(s: string | null | undefined): string | null {
  const t = (s ?? "").trim();
  return t.length > 0 ? t : null;
}

function urlProducto(p: ProductoFeedApi): string {
  // Todos los productos públicos traen slug; si faltara, la ficha también
  // resuelve por uuid (redirige 308 al slug).
  return `${SITE_URL}/productos/${limpia(p.slug) ?? p.id}`;
}

function articuloBase(p: ProductoFeedApi) {
  return {
    descripcion: limpia(p.descripcion),
    url: urlProducto(p),
    marca: limpia(p.marca),
    tags: p.tags ?? [],
  };
}

function imagenesExtra(p: ProductoFeedApi, imagen: string): string[] {
  return (p.imagenes ?? []).filter((u) => limpia(u) !== null && u !== imagen);
}

/**
 * Construye el catálogo normalizado a partir de la respuesta cruda del API.
 * - Producto simple → 1 artículo (id = uuid del producto).
 * - Producto con variantes → 1 artículo por variante (id = uuid de la
 *   variante, grupoId = uuid del producto).
 * - Una fila sin foto queda fuera y se reporta en `sinFoto`.
 * - Los agotados se conservan (disponible = false).
 */
export function construirCatalogo(productos: ProductoFeedApi[]): Catalogo {
  const articulos: ArticuloCatalogo[] = [];
  const sinFoto: string[] = [];

  for (const p of productos) {
    const base = articuloBase(p);
    const variaciones = p.variaciones ?? [];

    if (variaciones.length === 0) {
      const imagen = limpia(p.imagen_url);
      if (!imagen) {
        sinFoto.push(p.nombre);
        continue;
      }
      articulos.push({
        ...base,
        id: p.id,
        grupoId: null,
        nombre: p.nombre,
        variante: null,
        precio: p.precio,
        stock: Math.max(0, p.stock),
        disponible: p.stock > 0,
        imagen,
        imagenesExtra: imagenesExtra(p, imagen),
      });
      continue;
    }

    for (const v of variaciones) {
      const nombre = `${p.nombre} – ${v.nombre}`;
      // El API ya hereda la foto de la principal cuando la variante no trae
      // una propia; si aun así no hay foto, la fila queda fuera.
      const imagen = limpia(v.imagen_url);
      if (!imagen) {
        sinFoto.push(nombre);
        continue;
      }
      articulos.push({
        ...base,
        id: v.id,
        grupoId: p.id,
        nombre,
        variante: v.nombre,
        precio: v.precio,
        stock: Math.max(0, v.stock),
        disponible: v.stock > 0,
        imagen,
        imagenesExtra: imagenesExtra(p, imagen),
      });
    }
  }

  return { articulos, sinFoto };
}
