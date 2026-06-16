import type { Metadata, Viewport } from "next";
import "./globals.css";
import ConditionalShell from "@/components/site/ConditionalShell";

const SITE_URL = "https://www.papela-atelier.com";

export const viewport: Viewport = {
  themeColor: "#12535C",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Papela Atelier — Papelería, talleres y clases de arte en Puebla",
    template: "%s · Papela Atelier",
  },
  description:
    "Papelería creativa en Puebla con talleres de acuarela, acrílico, cerámica y más. Libretas, materiales de arte y clases para todos los niveles.",
  keywords: [
    "papelería Puebla",
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
        url: "/images/og-papela.jpg",
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
    images: ["/images/og-papela.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": `${SITE_URL}/#business`,
      name: "Papela Atelier",
      description:
        "Papelería creativa con talleres de arte, clases de pintura, materiales y libretas artesanales en Puebla, México.",
      url: SITE_URL,
      telephone: "+522211865590",
      email: "hola@papela-atelier.com",
      image: `${SITE_URL}/images/Logo-papela-atelier.png`,
      logo: `${SITE_URL}/images/Logo-papela-atelier.png`,
      priceRange: "$$",
      currenciesAccepted: "MXN",
      paymentAccepted: "Cash, Credit Card, MercadoPago",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Puebla",
        addressRegion: "Puebla",
        addressCountry: "MX",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 19.0414,
        longitude: -98.2063,
      },
      sameAs: [
        "https://instagram.com/papela.atelier",
        "https://tiktok.com/@papela.atelier",
        `https://wa.me/522211865590`,
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
            description: "Libretas artesanales, materiales de arte y papelería creativa.",
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
    <html lang="es" className="h-full antialiased">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ConditionalShell>{children}</ConditionalShell>
      </body>
    </html>
  );
}
