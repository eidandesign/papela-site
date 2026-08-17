import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getProductosPublicos } from "@/lib/productos-publicos";
import { getClases } from "@/lib/clases";
import { getTalleres } from "@/lib/talleres";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/talleres`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/clases`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/productos`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/servicios`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/personaliza`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/back-to-school`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/club-creativo`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/club-creativo/dopamina`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/nosotros`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/privacidad`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terminos`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  // Dynamic detail pages — fetched in parallel; if a fetch fails we still return static routes.
  // Productos: misma fuente que el catálogo visible (API pública del admin,
  // categoria "Tienda" + stock ≥ 1) — antes se sitemapeaban productos que el
  // sitio nunca muestra (query directa a Supabase).
  const [productos, clases, talleres] = await Promise.all([
    getProductosPublicos().catch(() => []),
    getClases().catch(() => []),
    getTalleres().catch(() => []),
  ]);

  const productoRoutes: MetadataRoute.Sitemap = productos.map((p) => ({
    url: `${SITE_URL}/productos/${p.slug ?? p.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const claseRoutes: MetadataRoute.Sitemap = clases.map((c) => ({
    url: `${SITE_URL}/clases/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const tallerRoutes: MetadataRoute.Sitemap = talleres.map((t) => ({
    url: `${SITE_URL}/talleres/${t.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...productoRoutes, ...claseRoutes, ...tallerRoutes];
}
