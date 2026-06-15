import type { MetadataRoute } from "next";

const SITE_URL = "https://www.papela-atelier.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/satisfaccion-clases", "/satisfaccion-talleres"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
