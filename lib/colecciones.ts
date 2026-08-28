import type { ProductoPublico } from "./productos-publicos";

// Orden preferido de colecciones (igual que el home); el resto va después.
export const ORDEN_COLECCIONES = ["libretas", "favoritos"];

// Sección sintética para los productos sin tag.
export const SIN_COLECCION = { slug: "mas-productos", titulo: "Más productos" };

export interface SeccionColeccion {
  slug: string;
  titulo: string;
  descripcion?: string;
  productos: ProductoPublico[];
}

// Leyenda corta bajo el título de cada colección (por slug). Un tag nuevo
// sin entrada aquí simplemente no muestra leyenda.
export const DESCRIPCIONES_COLECCION: Record<string, string> = {
  libretas: "Las libretas más bonitas para todo momento",
  favoritos: "Los consentidos de Papela",
  carpetas: "Para guardar y organizar con estilo",
  ilustraciones: "Arte para tus paredes y tus regalos",
  kits: "Todo listo para empezar a crear",
  journal: "Para escribir, pegar y guardar recuerdos",
  plumas: "Para escribir bonito todos los días",
  plumones: "Color para todos tus proyectos",
  sacapuntas: "Pequeños detalles que hacen la diferencia",
  stickers: "Para decorar tus libretas, tu laptop y tu mundo",
  otros: "Cositas que nos encantan",
  "mas-productos": "Más cositas bonitas por descubrir",
};

export function capitalizar(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// "Back to School" → "back-to-school" (sin acentos ni caracteres raros en la URL).
export function slugColeccion(tag: string) {
  return tag
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Agrupa los productos públicos por colección (tags), en el orden preferido,
 * con los sin tag al final como "Más productos". Compartido por /productos
 * (carruseles) y /productos/coleccion/[tag] (grid completo).
 */
export function seccionesPorColeccion(productos: ProductoPublico[]): SeccionColeccion[] {
  const porColeccion = new Map<string, ProductoPublico[]>();
  const sinColeccion: ProductoPublico[] = [];
  for (const p of productos) {
    const tags = p.tags ?? [];
    if (tags.length === 0) {
      sinColeccion.push(p);
      continue;
    }
    for (const tag of tags) {
      const arr = porColeccion.get(tag) ?? [];
      arr.push(p);
      porColeccion.set(tag, arr);
    }
  }

  const ordenadas = [
    ...ORDEN_COLECCIONES.filter((t) => porColeccion.has(t)),
    ...[...porColeccion.keys()].filter((t) => !ORDEN_COLECCIONES.includes(t)),
  ];
  const secciones: SeccionColeccion[] = ordenadas.map((tag) => {
    const slug = slugColeccion(tag);
    return {
      slug,
      titulo: capitalizar(tag),
      descripcion: DESCRIPCIONES_COLECCION[slug],
      productos: porColeccion.get(tag)!,
    };
  });
  if (sinColeccion.length > 0) {
    secciones.push({
      ...SIN_COLECCION,
      descripcion: DESCRIPCIONES_COLECCION[SIN_COLECCION.slug],
      productos: sinColeccion,
    });
  }
  return secciones;
}
