import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import ConditionalShell from "@/components/site/ConditionalShell";
import ReservaModal from "@/components/site/ReservaModal";

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
        <Script id="gtm" strategy="beforeInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-W238H5M2');`}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-W238H5M2"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Script id="fb-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1422756482948067');
            fbq('track', 'PageView');
          `}
        </Script>
        <ConditionalShell>{children}</ConditionalShell>
        {/* Modal de reserva global — una sola instancia para todas las páginas
            (cualquier ReservaButton lo abre vía store). Garantiza animación
            y comportamiento consistentes en todo el sitio. */}
        <ReservaModal />
      </body>
    </html>
  );
}
