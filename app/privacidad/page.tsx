import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 60;

// BORRADOR LEGAL: redactado conforme a la LFPDPPP con los datos reales del
// negocio, pero debe ser revisado/validado por el dueño antes de publicarse.

export const metadata: Metadata = {
  title: "Aviso de privacidad",
  description:
    "Aviso de privacidad de Papela Atelier: qué datos personales recabamos, para qué los usamos y cómo ejercer tus derechos ARCO.",
  alternates: { canonical: "https://www.papela-atelier.com/privacidad" },
};

function Seccion({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-serif font-extralight text-[1.6rem] text-[#403C3C] mb-3">{title}</h2>
      <div className="font-sans text-[var(--color-muted)] text-[16px] leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}

export default function PrivacidadPage() {
  return (
    <div className="w-[90%] max-w-3xl mx-auto pt-40 md:pt-[200px] pb-20">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-terracota)]">
        Legal
      </span>
      <h1 className="font-serif font-extralight text-[clamp(2.2rem,4.5vw,3.5rem)] text-[#403C3C] leading-[1.1] mt-3 mb-3">
        Aviso de privacidad
      </h1>
      <p className="font-sans text-sm text-[var(--color-muted)] mb-12">
        Última actualización: 4 de julio de 2026
      </p>

      <Seccion title="Responsable de tus datos">
        <p>
          Papela Atelier, con domicilio en Puebla, Puebla, México, es responsable del
          tratamiento de los datos personales que nos proporcionas a través de este sitio
          (papela-atelier.com), de conformidad con la Ley Federal de Protección de Datos
          Personales en Posesión de los Particulares (LFPDPPP).
        </p>
        <p>
          Para cualquier tema relacionado con tus datos puedes escribirnos a{" "}
          <a href="mailto:hola@papela-atelier.com" className="text-[var(--color-verde)] underline underline-offset-2">
            hola@papela-atelier.com
          </a>{" "}
          o por WhatsApp al +52 221 186 5590.
        </p>
      </Seccion>

      <Seccion title="Qué datos recabamos">
        <p>Dependiendo de lo que hagas en el sitio, podemos recabar:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-[var(--color-text)]">Compras en la tienda:</strong> nombre,
            correo electrónico, teléfono y, si eliges envío a domicilio, dirección de entrega.
          </li>
          <li>
            <strong className="text-[var(--color-text)]">Reservas de talleres y clases:</strong>{" "}
            nombre, correo electrónico y teléfono.
          </li>
          <li>
            <strong className="text-[var(--color-text)]">Solicitudes de personalización:</strong>{" "}
            nombre, teléfono, correo y la descripción de tu proyecto.
          </li>
          <li>
            <strong className="text-[var(--color-text)]">Navegación:</strong> datos de uso del
            sitio mediante cookies y tecnologías similares (ver sección de cookies).
          </li>
        </ul>
        <p>
          <strong className="text-[var(--color-text)]">No almacenamos datos de tarjetas ni
          cuentas bancarias.</strong> Los pagos se procesan directamente en la plataforma de
          Mercado Pago, sujeta a sus propios términos y aviso de privacidad.
        </p>
      </Seccion>

      <Seccion title="Para qué usamos tus datos">
        <p>Finalidades primarias (necesarias para atenderte):</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Procesar y entregar tus pedidos, incluida la coordinación del envío o la entrega en tienda.</li>
          <li>Gestionar tus reservas de talleres y clases, y confirmarte lugar, fecha y horario.</li>
          <li>Dar seguimiento a solicitudes de personalización y cotizaciones.</li>
          <li>Contactarte sobre tu compra o reserva (confirmaciones, cambios, aclaraciones).</li>
        </ul>
        <p>Finalidades secundarias (puedes oponerte a ellas escribiéndonos):</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Enviarte información sobre productos, talleres y promociones.</li>
          <li>Analizar el uso del sitio para mejorar nuestra oferta y experiencia de compra.</li>
        </ul>
      </Seccion>

      <Seccion title="Con quién compartimos tus datos">
        <p>
          Solo compartimos los datos necesarios con proveedores que nos permiten operar:
          Mercado Pago (procesamiento de pagos), empresas de paquetería (entrega de pedidos
          con envío a domicilio) y proveedores de infraestructura tecnológica que alojan
          nuestro sitio y base de datos. No vendemos ni cedemos tus datos a terceros para
          fines distintos a los descritos en este aviso.
        </p>
      </Seccion>

      <Seccion title="Cookies y herramientas de análisis">
        <p>
          Este sitio utiliza cookies propias y de terceros (Google Tag Manager / Google
          Analytics y Meta Pixel) para medir el uso del sitio y mostrar publicidad relevante.
          Puedes desactivar las cookies desde la configuración de tu navegador; el sitio
          seguirá funcionando, aunque algunas métricas dejarán de registrarse.
        </p>
      </Seccion>

      <Seccion title="Tus derechos (ARCO)">
        <p>
          Tienes derecho a Acceder, Rectificar, Cancelar u Oponerte al tratamiento de tus
          datos personales, así como a revocar el consentimiento que nos hayas otorgado.
          Para ejercerlos, envíanos una solicitud a{" "}
          <a href="mailto:hola@papela-atelier.com" className="text-[var(--color-verde)] underline underline-offset-2">
            hola@papela-atelier.com
          </a>{" "}
          indicando tu nombre completo, el derecho que deseas ejercer y un medio para
          responderte. Te contestaremos en los plazos que marca la LFPDPPP.
        </p>
      </Seccion>

      <Seccion title="Cambios a este aviso">
        <p>
          Podemos actualizar este aviso para reflejar cambios legales o en nuestros
          servicios. La versión vigente estará siempre publicada en esta página con su
          fecha de actualización.
        </p>
      </Seccion>

      <p className="font-sans text-sm text-[var(--color-muted)] border-t border-[var(--color-border)] pt-6">
        ¿Dudas sobre este aviso? Escríbenos a{" "}
        <a href="mailto:hola@papela-atelier.com" className="text-[var(--color-verde)] underline underline-offset-2">
          hola@papela-atelier.com
        </a>
        . También puedes consultar nuestros{" "}
        <Link href="/terminos" className="text-[var(--color-verde)] underline underline-offset-2">
          Términos y condiciones
        </Link>
        .
      </p>
    </div>
  );
}
