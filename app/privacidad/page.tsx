import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 60;

// Aviso redactado conforme a la LFPDPPP con lo que el sitio recaba HOY:
// tienda (MercadoPago), talleres/clases, personalización y cotizaciones,
// encuestas de satisfacción (Formspree), Club Creativo (tarjeta por token),
// Dopamina (solo localStorage) y analítica (GTM + Meta Pixel). Al agregar un
// flujo nuevo que pida datos, sumar aquí la sección correspondiente.

export const metadata: Metadata = {
  title: "Aviso de privacidad",
  description:
    "Aviso de privacidad de Papela Atelier: qué datos personales recabamos, para qué los usamos, con quién los compartimos y cómo ejercer tus derechos ARCO.",
  alternates: { canonical: "https://www.papela-atelier.com/privacidad" },
};

const EMAIL = "hola@papela-atelier.com";
const WHATSAPP = "+52 221 186 5590";

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

function Correo() {
  return (
    <a href={`mailto:${EMAIL}`} className="text-[var(--color-verde)] underline underline-offset-2">
      {EMAIL}
    </a>
  );
}

function Dato({ children }: { children: React.ReactNode }) {
  return <strong className="text-[var(--color-text)]">{children}</strong>;
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
        Última actualización: 17 de septiembre de 2026
      </p>

      <Seccion title="Quién es responsable de tus datos">
        <p>
          Papela Atelier, con domicilio en Puebla, Puebla, México, es responsable del
          tratamiento de los datos personales que nos compartes a través de este sitio
          (papela-atelier.com) y de nuestros canales de contacto, conforme a la Ley Federal
          de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).
        </p>
        <p>
          Para cualquier tema relacionado con tus datos escríbenos a <Correo /> o por
          WhatsApp al {WHATSAPP}.
        </p>
      </Seccion>

      <Seccion title="Qué datos recabamos">
        <p>Solo pedimos lo necesario para cada cosa que haces con nosotros:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <Dato>Compras en la tienda:</Dato> nombre, correo electrónico, teléfono y, si
            eliges envío a domicilio, la dirección de entrega.
          </li>
          <li>
            <Dato>Talleres y clases:</Dato> nombre, correo electrónico y teléfono de quien
            reserva. Si inscribes a una niña o niño, solo pedimos los datos de la persona
            adulta que hace la reserva.
          </li>
          <li>
            <Dato>Personalización y cotizaciones:</Dato> nombre, teléfono, correo y la
            descripción de tu proyecto. Las cotizaciones se comparten en un enlace privado
            que solo conoce quien lo recibe.
          </li>
          <li>
            <Dato>Encuestas de satisfacción:</Dato> tu nombre (opcional, puedes responder
            como anónimo), el taller o clase que tomaste y tus opiniones.
          </li>
          <li>
            <Dato>Club Creativo:</Dato> nombre, número de socio, fecha de alta, los
            coleccionables que has obtenido, los premios canjeados y las preferencias con
            las que personalizas tu tarjeta. Tu tarjeta vive en un enlace personal que no se
            indexa en buscadores: compártelo solo con quien quieras.
          </li>
          <li>
            <Dato>WhatsApp:</Dato> cuando nos escribes, tu número y los mensajes que
            intercambiamos para atender tu pedido, reserva o proyecto.
          </li>
          <li>
            <Dato>Navegación:</Dato> datos de uso del sitio mediante cookies y tecnologías
            similares (ver la sección de cookies).
          </li>
        </ul>
        <p>
          <Dato>No almacenamos datos de tarjetas ni cuentas bancarias.</Dato> Los pagos se
          procesan directamente en Mercado Pago, sujeto a sus propios términos y aviso de
          privacidad.
        </p>
        <p>
          El juego Dopamina no pide datos personales: lo que dibujas no se sube a ningún
          servidor y el juego solo guarda en tu navegador los retos recientes para no
          repetirlos.
        </p>
      </Seccion>

      <Seccion title="Para qué usamos tus datos">
        <p>Finalidades primarias (necesarias para atenderte):</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Procesar y entregar tus pedidos, incluida la coordinación del envío o la entrega en tienda.</li>
          <li>Gestionar tus reservas de talleres y clases y confirmarte lugar, fecha y horario.</li>
          <li>Dar seguimiento a solicitudes de personalización, cotizaciones y servicios de impresión o diseño.</li>
          <li>Operar tu membresía del Club Creativo: registrar coleccionables, premios y regalos entre socios.</li>
          <li>Contactarte sobre tu compra, reserva o proyecto (confirmaciones, cambios, aclaraciones).</li>
          <li>Mejorar nuestros talleres y clases a partir de las encuestas de satisfacción.</li>
        </ul>
        <p>Finalidades secundarias (puedes oponerte a ellas escribiéndonos):</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Enviarte información sobre productos, talleres, clases y promociones.</li>
          <li>Medir el uso del sitio y mostrar anuncios relevantes en redes sociales.</li>
        </ul>
      </Seccion>

      <Seccion title="Con quién compartimos tus datos">
        <p>
          No vendemos ni cedemos tus datos. Solo los compartimos con los proveedores que nos
          permiten operar, y únicamente en la medida necesaria:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><Dato>Mercado Pago:</Dato> procesamiento de pagos.</li>
          <li><Dato>Empresas de paquetería:</Dato> entrega de pedidos con envío a domicilio.</li>
          <li><Dato>Formspree:</Dato> recepción de las respuestas de las encuestas de satisfacción.</li>
          <li><Dato>Google (Tag Manager y Analytics) y Meta (Pixel):</Dato> medición del uso del sitio y publicidad.</li>
          <li><Dato>WhatsApp (Meta):</Dato> mensajería cuando nos contactas por ese medio.</li>
          <li>
            <Dato>Infraestructura tecnológica:</Dato> los proveedores que alojan el sitio, la
            base de datos y las imágenes (Vercel, Supabase y Cloudinary).
          </li>
        </ul>
        <p>
          Algunos de estos proveedores están fuera de México, por lo que tus datos pueden
          transferirse al extranjero para las finalidades descritas en este aviso.
        </p>
      </Seccion>

      <Seccion title="Cookies y almacenamiento en tu navegador">
        <p>
          Usamos cookies propias y de terceros (Google Tag Manager, Google Analytics y Meta
          Pixel) para medir el uso del sitio y mostrar publicidad relevante. Puedes
          desactivarlas desde la configuración de tu navegador; el sitio seguirá
          funcionando, aunque algunas métricas dejarán de registrarse.
        </p>
        <p>
          También guardamos información en el almacenamiento local de tu navegador para que
          el sitio funcione: el contenido de tu carrito, los avisos que ya leíste en tu
          tarjeta del Club Creativo y los retos recientes del juego Dopamina. Esa
          información no sale de tu dispositivo y puedes borrarla limpiando los datos del
          sitio en tu navegador.
        </p>
      </Seccion>

      <Seccion title="Menores de edad">
        <p>
          Nuestros talleres y clases reciben a niñas y niños, pero las reservas, compras y
          membresías del Club Creativo las realiza siempre una persona adulta. No
          recabamos a sabiendas datos de menores a través del sitio; si crees que ocurrió,
          escríbenos y los eliminaremos.
        </p>
      </Seccion>

      <Seccion title="Cuánto tiempo conservamos tus datos">
        <p>
          Conservamos los datos de compras, reservas y cotizaciones el tiempo necesario
          para atenderte y cumplir nuestras obligaciones fiscales y de consumo. Los datos
          del Club Creativo se conservan mientras tu membresía esté activa. Puedes pedirnos
          en cualquier momento que los cancelemos, salvo que una ley nos obligue a
          guardarlos.
        </p>
      </Seccion>

      <Seccion title="Tus derechos (ARCO)">
        <p>
          Tienes derecho a Acceder, Rectificar, Cancelar u Oponerte al tratamiento de tus
          datos personales, así como a revocar el consentimiento que nos hayas otorgado y a
          limitar su uso. Para ejercerlos envía una solicitud a <Correo /> indicando tu
          nombre completo, el derecho que deseas ejercer y un medio para responderte. Te
          contestaremos en los plazos que marca la LFPDPPP.
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
        ¿Dudas sobre este aviso? Escríbenos a <Correo />. También puedes consultar nuestros{" "}
        <Link href="/terminos" className="text-[var(--color-verde)] underline underline-offset-2">
          Términos y condiciones
        </Link>
        .
      </p>
    </div>
  );
}
