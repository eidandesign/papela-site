import { SITE_URL } from "@/lib/site";

export const WHATSAPP_NUMERO = "522211865590";

type ProductoLink = { id: string; nombre: string; slug?: string | null };

/** URL pública de la ficha del producto (canónica: slug, con fallback al id). */
export function urlProducto(p: ProductoLink) {
  return `${SITE_URL}/productos/${p.slug ?? p.id}`;
}

/**
 * Link de "Consultar por WhatsApp" de un producto.
 * El mensaje SIEMPRE lleva la URL de la ficha: al chat de Papela solo llega
 * texto, y con puro nombre el mostrador no sabe qué producto (ni qué variante)
 * está pidiendo el cliente. `nombreMostrado` permite mandar el nombre con la
 * variación elegida ("Libreta — Rosa") sin cambiar el link, que es del producto.
 */
export function waProductoHref(p: ProductoLink, nombreMostrado?: string) {
  const texto = `Hola Papela 🌿 me interesa: ${nombreMostrado ?? p.nombre}\n${urlProducto(p)}`;
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`;
}
