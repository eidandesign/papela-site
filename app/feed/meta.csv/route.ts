// Imports relativos y con extensión .ts a propósito: tests/feed/route.test.ts
// importa esta route con `node --test` (que no resuelve el alias @/).
import { construirCatalogo, type ProductoFeedApi } from "../../../lib/feed/catalogo.ts";
import { serializarCsv } from "../../../lib/feed/csv.ts";
import { ENCABEZADOS_META, filasMeta } from "../../../lib/feed/meta.ts";
import { logger } from "../../../lib/logger.ts";

// ─────────────────────────────────────────────────────────────────────────────
// Feed del catálogo de Meta (Instagram/Facebook Shopping):
// https://www.papela-atelier.com/feed/meta.csv
//
// Meta lo descarga cada hora (programado en el Business Manager, Fase 3).
// ISR de 15 min: Meta nunca ve datos con más de ~15 min de atraso y el
// trabajo real ocurre como mucho 4 veces por hora, así que no necesita
// rate limit propio. La route solo orquesta: fetch → dominio → text/csv.
// La lógica vive en lib/feed/ (funciones puras, probadas en tests/feed/).
// ─────────────────────────────────────────────────────────────────────────────

export const revalidate = 900;

const ADMIN_API = "https://admin.papela-atelier.com/api/public/productos";

export async function GET(): Promise<Response> {
  // El API público ya incluye los agotados (van "out of stock", nunca se
  // borran filas) y las variantes resueltas; sin filtrar por stock aquí.
  const res = await fetch(ADMIN_API, { next: { revalidate: 900 } });
  if (!res.ok) {
    logger.error("Feed Meta: el API de productos respondió error", { status: res.status });
    // Lanzar (en vez de responder) conserva la última versión buena del feed:
    // con ISR, un revalidate fallido sigue sirviendo el stale. Nunca responder
    // un CSV vacío con 200 — Meta lo tomaría como "catálogo vacío".
    throw new Error(`Feed Meta: el API de productos respondió ${res.status}`);
  }

  const data: unknown = await res.json();
  const productos = Array.isArray((data as { productos?: unknown })?.productos)
    ? ((data as { productos: ProductoFeedApi[] }).productos)
    : [];

  const { articulos, sinFoto } = construirCatalogo(productos);
  const { filas, excluidosSinMeta } = filasMeta(articulos);
  if (sinFoto.length > 0 || excluidosSinMeta > 0) {
    logger.info("Feed Meta: filas excluidas", { sinFoto, excluidosSinMeta });
  }

  // Validar DESPUÉS de la exclusión por `sin-meta`: si todos los productos con
  // foto llegaran etiquetados, un CSV de solo encabezados con 200 sería
  // exactamente el "catálogo vacío" que esta route promete no servir.
  if (filas.length === 0) {
    logger.error("Feed Meta: el catálogo quedó vacío", {
      productos: productos.length,
      sinFoto: sinFoto.length,
      excluidosSinMeta,
    });
    throw new Error("Feed Meta: el catálogo quedó vacío");
  }

  const csv = serializarCsv([[...ENCABEZADOS_META], ...filas]);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
    },
  });
}
