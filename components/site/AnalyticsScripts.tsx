"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

// GTM + Meta Pixel. Se saltan en /publicidad: es la pantalla de la tienda, no
// hay visitantes reales que medir y cada carga contaría como una visita.
// Cliente a propósito: el layout raíz es servidor y no sabe la ruta.
const SIN_ANALITICA = ["/publicidad"];

export default function AnalyticsScripts({ gtmId, pixelId }: { gtmId: string; pixelId: string }) {
  const pathname = usePathname();
  if (SIN_ANALITICA.some((r) => pathname === r || pathname?.startsWith(r + "/"))) return null;
  return (
    <>
      {/* afterInteractive: GTM no debe bloquear el primer render (LCP).
          El snippet preserva pushes previos al dataLayer (w[l]=w[l]||[]). */}
      <Script id="gtm" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
      </Script>
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
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `}
      </Script>
    </>
  );
}
