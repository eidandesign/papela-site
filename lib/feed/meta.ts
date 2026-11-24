import type { ArticuloCatalogo } from "./catalogo";

// ─────────────────────────────────────────────────────────────────────────────
// Adaptador del catálogo normalizado (lib/feed/catalogo.ts) a filas del
// catálogo de Meta (Instagram/Facebook Shopping).
// Referencia de campos: https://www.facebook.com/business/help/120325381656392
//
// Reglas del canal que viven AQUÍ (no en el modelo):
//  - Tag `sin-meta` → el artículo queda fuera del feed por completo (así el
//    dueño saca productos con personajes con licencia sin deploy). El tag
//    jamás se usa como product_type ni para google_product_category.
//  - title máx. 150, description máx. 5,000 (límites de Meta).
//  - price con dos decimales + ISO 4217 ("249.00 MXN").
//  - availability por stock; las filas agotadas van "out of stock", nunca
//    se borran (decisión del negocio: retargeting y etiquetas viejas vivas).
// ─────────────────────────────────────────────────────────────────────────────

/** Encabezados EXACTOS que Meta espera (inglés de EE. UU.), en este orden. */
export const ENCABEZADOS_META = [
  "id",
  "item_group_id",
  "title",
  "description",
  "availability",
  "condition",
  "price",
  "link",
  "image_link",
  "additional_image_link",
  "brand",
  "quantity_to_sell_on_facebook",
  "google_product_category",
  "product_type",
  "pattern",
] as const;

/** Tag que saca un producto del feed de Meta (lo captura el dueño en el admin). */
export const TAG_SIN_META = "sin-meta";

const MARCA_FALLBACK = "Papela Atelier";
const TITULO_MAX = 150;
const DESCRIPCION_MAX = 5000;
/** Meta acepta hasta 20 imágenes adicionales por fila. */
const IMAGENES_EXTRA_MAX = 20;

/**
 * Mapa fijo tag → categoría de Google (Meta usa la taxonomía de Google).
 * Cadenas verificadas letra por letra contra la taxonomía oficial
 * (google.com/basepages/producttype/taxonomy.en-US.txt, 2026-11-24).
 * Un tag sin entrada aquí deja la celda vacía (Meta la infiere).
 */
export const CATEGORIA_GOOGLE_POR_TAG: Record<string, string> = {
  libretas: "Office Supplies > General Office Supplies > Paper Products > Notebooks & Notepads",
  journal: "Office Supplies > General Office Supplies > Paper Products > Notebooks & Notepads",
  carpetas: "Office Supplies > Filing & Organization > Folders & Report Covers",
  stickers:
    "Arts & Entertainment > Hobbies & Creative Arts > Arts & Crafts > Art & Crafting Materials > Embellishments & Trims > Decorative Stickers",
  plumas: "Office Supplies > Office Instruments > Writing & Drawing Instruments > Pens & Pencils > Pens",
  plumones:
    "Office Supplies > Office Instruments > Writing & Drawing Instruments > Markers & Highlighters > Markers",
  ilustraciones: "Home & Garden > Decor > Artwork > Posters, Prints, & Visual Artwork",
  kits: "Arts & Entertainment > Hobbies & Creative Arts > Arts & Crafts > Art & Craft Kits",
  sacapuntas: "Office Supplies > Office Instruments > Pencil Sharpeners",
};

/** "249.00 MXN" — dos decimales + espacio + ISO 4217 (una sola moneda). */
export function precioMeta(precio: number): string {
  return `${precio.toFixed(2)} MXN`;
}

/** Fallback cuando el producto no tiene descripción capturada. */
export function descripcionFallback(nombre: string): string {
  return `${nombre} en Papela Atelier, papelería creativa en Lomas de Angelópolis, Puebla. Compra en línea o recoge en tienda.`;
}

function tagsUtiles(a: ArticuloCatalogo): string[] {
  return a.tags.filter((t) => t !== TAG_SIN_META);
}

function categoriaGoogle(a: ArticuloCatalogo): string {
  for (const tag of tagsUtiles(a)) {
    const categoria = CATEGORIA_GOOGLE_POR_TAG[tag];
    if (categoria) return categoria;
  }
  return "";
}

/** Mapea UN artículo a su fila, en el orden de ENCABEZADOS_META. */
export function filaMeta(a: ArticuloCatalogo): string[] {
  const descripcion = a.descripcion ?? descripcionFallback(a.nombre);
  return [
    a.id,
    a.grupoId ?? "",
    a.nombre.slice(0, TITULO_MAX),
    descripcion.slice(0, DESCRIPCION_MAX),
    a.disponible ? "in stock" : "out of stock",
    "new",
    precioMeta(a.precio),
    a.url,
    a.imagen,
    // Dedupe (también contra la principal, por si el modelo no lo hizo) y
    // tope de Meta.
    [...new Set(a.imagenesExtra)]
      .filter((u) => u !== a.imagen)
      .slice(0, IMAGENES_EXTRA_MAX)
      .join(","),
    a.marca ?? MARCA_FALLBACK,
    String(a.stock),
    categoriaGoogle(a),
    tagsUtiles(a)[0] ?? "",
    a.variante ?? "",
  ];
}

export interface FilasMeta {
  filas: string[][];
  /** Artículos que quedaron fuera por el tag `sin-meta` (para reportar). */
  excluidosSinMeta: number;
}

/** Mapea el catálogo completo, aplicando la exclusión por `sin-meta`. */
export function filasMeta(articulos: ArticuloCatalogo[]): FilasMeta {
  const dentro = articulos.filter((a) => !a.tags.includes(TAG_SIN_META));
  return {
    filas: dentro.map(filaMeta),
    excluidosSinMeta: articulos.length - dentro.length,
  };
}
