import type { Metadata, Viewport } from "next";
import "./globals.css";
import ConditionalShell from "@/components/site/ConditionalShell";
import AnalyticsScripts from "@/components/site/AnalyticsScripts";
import ReservaModal from "@/components/site/ReservaModal";
import { waHref } from "@/lib/whatsapp";
import { NEGOCIO } from "@/lib/negocio";

const SITE_URL = "https://www.papela-atelier.com";
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "GTM-W238H5M2";
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID ?? "1422756482948067";

export const viewport: Viewport = {
  themeColor: "#12535C",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Papela Atelier — Papelería creativa en Lomas de Angelópolis, Puebla",
    template: "%s · Papela Atelier",
  },
  description:
    "Papelería creativa en Lomas de Angelópolis, Puebla: plumas MUJI, agendas, libretas, stationery, materiales de arte y papelería básica, más talleres y clases de arte para todos los niveles.",
  keywords: [
    "papelería Puebla",
    "papelería en Puebla",
    "papelería Lomas de Angelópolis",
    "papelería Angelópolis",
    "papelería San Andrés Cholula",
    "papelería bonita Puebla",
    "plumas MUJI Puebla",
    "agendas Puebla",
    "stationery Puebla",
    "papelería básica Puebla",
    "útiles escolares Puebla",
    "talleres de arte Puebla",
    "clases de pintura Puebla",
    "acuarela Puebla",
    "materiales de arte Puebla",
    "papelería creativa",
    "libretas artesanales",
    "taller de cerámica Puebla",
    "Papela Atelier",
  ],
  authors: [{ name: "Papela Atelier", url: SITE_URL }],
  creator: "Papela Atelier",
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: SITE_URL,
    siteName: "Papela Atelier",
    title: "Papela Atelier — Papelería y talleres de arte en Puebla",
    description:
      "Talleres de arte, materiales y papelería creativa en Puebla. Aprende, crea y llévate algo hecho por ti.",
    images: [
      {
        url: "/images/og-papela.jpg?v=2",
        width: 1200,
        height: 630,
        alt: "Papela Atelier — Papelería y talleres de arte en Puebla",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Papela Atelier — Papelería y talleres de arte en Puebla",
    description:
      "Talleres de arte, materiales y papelería creativa en Puebla. Aprende y crea.",
    images: ["/images/og-papela.jpg?v=2"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  // Sin `alternates.canonical` aquí: en App Router se hereda a todos los
  // segmentos, y las páginas sin canonical propio (checkouts, /pago/*) se
  // auto-canonicalizaban al home. Cada página indexable declara el suyo.
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["LocalBusiness", "Store"],
      "@id": `${SITE_URL}/#business`,
      name: "Papela Atelier",
      alternateName: "Papela",
      description:
        "Papelería creativa en Lomas de Angelópolis, Puebla: plumas MUJI, agendas, libretas, stationery, materiales de arte, papelería básica y personalización, con talleres y clases de arte.",
      url: SITE_URL,
      telephone: NEGOCIO.telefonoE164,
      email: NEGOCIO.email,
      hasMap: NEGOCIO.mapsUrl,
      image: `${SITE_URL}/images/Logo-papela-atelier.png`,
      logo: `${SITE_URL}/images/Logo-papela-atelier.png`,
      priceRange: "$$",
      currenciesAccepted: "MXN",
      paymentAccepted: "Cash, Credit Card, MercadoPago",
      // Dirección, coordenadas y horarios idénticos a la ficha de Google Business
      // Profile (lib/negocio.ts) — la consistencia NAP es la señal que conecta
      // sitio ↔ ficha en Maps.
      address: {
        "@type": "PostalAddress",
        streetAddress: `${NEGOCIO.direccion.calle}, ${NEGOCIO.direccion.colonia}`,
        addressLocality: NEGOCIO.direccion.ciudad,
        addressRegion: NEGOCIO.direccion.estado,
        postalCode: NEGOCIO.direccion.cp,
        addressCountry: NEGOCIO.direccion.pais,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: NEGOCIO.geo.lat,
        longitude: NEGOCIO.geo.lng,
      },
      areaServed: [
        { "@type": "Place", name: "Lomas de Angelópolis" },
        { "@type": "City", name: "Puebla" },
        { "@type": "City", name: "San Andrés Cholula" },
      ],
      openingHoursSpecification: NEGOCIO.horario.map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: h.schema,
        opens: h.abre,
        closes: h.cierra,
      })),
      sameAs: [
        "https://instagram.com/papela.atelier",
        "https://tiktok.com/@papela.atelier",
        "https://www.facebook.com/papelaatelier/",
        waHref(),
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Talleres y productos",
        itemListElement: [
          {
            "@type": "OfferCatalog",
            name: "Talleres de arte",
            description: "Talleres presenciales de acuarela, acrílico, cerámica, dibujo y más en Puebla.",
          },
          {
            "@type": "OfferCatalog",
            name: "Clases de arte",
            description: "Clases regulares de pintura y técnicas artísticas para todos los niveles.",
          },
          {
            "@type": "OfferCatalog",
            name: "Papelería y materiales",
            description: "Plumas MUJI, agendas, libretas artesanales, stationery, materiales de arte y papelería básica.",
          },
        ],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Papela Atelier",
      publisher: { "@id": `${SITE_URL}/#business` },
      inLanguage: "es-MX",
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" className="h-full antialiased">
      <head>
        {/* Satoshi viene por @import de Fontshare en globals.css; el preconnect
            adelanta el handshake TLS. Los preload cubren los dos cortes de
            PP Editorial que pintan el hero y los headings (evita FOUT). */}
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link rel="preload" as="font" type="font/otf" href="/fonts/PPEditorialNew-Italic.otf" crossOrigin="anonymous" />
        <link rel="preload" as="font" type="font/otf" href="/fonts/PPEditorialNew-Ultralight.otf" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* GTM + Pixel; se omiten en /publicidad (pantalla de la tienda). */}
        <AnalyticsScripts gtmId={GTM_ID} pixelId={FB_PIXEL_ID} />
        <ConditionalShell>{children}</ConditionalShell>
        {/* Modal de reserva global — una sola instancia para todas las páginas
            (cualquier ReservaButton lo abre vía store). Garantiza animación
            y comportamiento consistentes en todo el sitio. */}
        <ReservaModal />
      </body>
    </html>
  );
}
