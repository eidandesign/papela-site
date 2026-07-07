import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hay un package-lock.json suelto en ~/ que confunde la auto-detección
  // del root del workspace; lo fijamos explícitamente a este repo.
  turbopack: {
    root: __dirname,
  },
  images: {
    // Solo WebP: AVIF+WebP duplicaba las transformaciones de Vercel
    // (cada imagen × tamaño se optimizaba en ambos formatos).
    formats: ["image/webp"],
    // Las imágenes de Supabase tienen nombre único e inmutable
    // (Date.now()-random); cachear la versión optimizada 31 días evita
    // re-transformar cada 4h (default). Si se cambia una imagen LOCAL de
    // /public sin renombrarla, puede quedar servida vieja hasta 31 días:
    // renombrar el archivo al reemplazarla.
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qrrqptkcgezposfmkvqy.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
