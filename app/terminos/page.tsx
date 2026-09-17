import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 60;

// Condiciones redactadas a partir de cómo opera hoy el sitio: tienda con
// MercadoPago (envío $80 MXN o recoger), talleres/clases con cupo, encargos y
// cotizaciones por enlace privado, Club Creativo (tarjeta, coleccionables,
// regalos con código de 72 h) y Dopamina (juego gratuito + sorpresa por
// etiquetar en Instagram). Plazos de cambios/cancelaciones: decisión del dueño.

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description:
    "Términos y condiciones de Papela Atelier: pedidos, pagos, envíos, talleres, clases, personalización, Club Creativo y Dopamina.",
  alternates: { canonical: "https://www.papela-atelier.com/terminos" },
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

export default function TerminosPage() {
  return (
    <div className="w-[90%] max-w-3xl mx-auto pt-40 md:pt-[200px] pb-20">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-terracota)]">
        Legal
      </span>
      <h1 className="font-serif font-extralight text-[clamp(2.2rem,4.5vw,3.5rem)] text-[#403C3C] leading-[1.1] mt-3 mb-3">
        Términos y condiciones
      </h1>
      <p className="font-sans text-sm text-[var(--color-muted)] mb-12">
        Última actualización: 17 de septiembre de 2026
      </p>

      <Seccion title="Sobre nosotros">
        <p>
          Papela Atelier es una papelería creativa con sede en Puebla, Puebla, México. A
          través de este sitio (papela-atelier.com) vendemos productos de papelería,
          ofrecemos talleres y clases de arte, servicios de personalización, impresión y
          diseño, y operamos el Club Creativo. Al comprar, reservar o participar en el
          sitio aceptas estos términos y nuestro{" "}
          <Link href="/privacidad" className="text-[var(--color-verde)] underline underline-offset-2">
            Aviso de privacidad
          </Link>
          .
        </p>
      </Seccion>

      <Seccion title="Productos y precios">
        <p>
          Todos los precios están expresados en pesos mexicanos (MXN) e incluyen IVA. Los
          productos están sujetos a disponibilidad: el sitio muestra únicamente artículos
          con existencia, pero en casos excepcionales un producto puede agotarse antes de
          confirmarse el pago; si esto ocurre, te contactaremos para ofrecerte un cambio o
          el reembolso.
        </p>
        <p>
          Las fotografías son representativas. En productos artesanales puede haber
          pequeñas variaciones de color o acabado que son parte de su carácter hecho a mano.
        </p>
      </Seccion>

      <Seccion title="Pagos">
        <p>
          Los pagos en línea se procesan a través de Mercado Pago, que acepta tarjetas y
          otros medios según su plataforma. Papela Atelier no recibe ni almacena datos de
          tarjetas. Tu pedido o reserva se confirma cuando Mercado Pago acredita el pago;
          si el pago queda pendiente o es rechazado, el pedido no se genera y el lugar no se
          aparta.
        </p>
      </Seccion>

      <Seccion title="Envíos y entrega en tienda">
        <p>
          Al comprar puedes elegir entre recoger tu pedido en tienda sin costo o envío a
          domicilio con costo fijo de $80 MXN. Los tiempos de entrega dependen de la
          paquetería; te contactaremos si hay algún retraso. Revisa tu paquete al recibirlo
          y avísanos dentro de los 3 días siguientes si llegó dañado, adjuntando fotos, para
          darle seguimiento.
        </p>
      </Seccion>

      <Seccion title="Talleres y clases">
        <p>
          Los talleres y clases tienen cupo limitado; tu lugar se aparta al confirmarse el
          pago. Los materiales incluidos, la duración y la edad recomendada se indican en la
          página de cada taller o clase. El precio de las clases depende del tipo de clase
          elegido (por ejemplo, niños o adultos), no del horario.
        </p>
        <p>
          Si no puedes asistir, escríbenos por WhatsApp al {WHATSAPP} lo antes posible:
          haremos lo posible por reagendarte en otra fecha del mismo taller o clase, sujeto
          a disponibilidad. Las inasistencias sin previo aviso no son reembolsables. Si
          Papela Atelier cancela o reprograma un taller o clase, podrás elegir entre el
          cambio de fecha o el reembolso completo.
        </p>
        <p>
          Las niñas y niños participan siempre bajo la responsabilidad de la persona adulta
          que hizo la reserva.
        </p>
      </Seccion>

      <Seccion title="Personalización, cotizaciones y servicios">
        <p>
          Los proyectos personalizados (stickers, toppers, etiquetas y similares) y los
          servicios de impresión y diseño se cotizan de forma individual a partir de tu
          solicitud. Te compartimos la cotización en un enlace privado; el precio, el
          anticipo y el tiempo de entrega se acuerdan contigo antes de iniciar. Una
          cotización es válida por el tiempo que indique y puede ajustarse si cambian las
          cantidades o especificaciones.
        </p>
        <p>
          Por tratarse de productos hechos a la medida, los encargos personalizados no
          admiten devolución una vez aprobado el diseño, salvo defecto de fabricación. Es
          tu responsabilidad contar con los derechos sobre los textos, logotipos o imágenes
          que nos pidas reproducir.
        </p>
      </Seccion>

      <Seccion title="Cambios y devoluciones">
        <p>
          Si un producto llega defectuoso o recibiste un artículo distinto al que pediste,
          contáctanos dentro de los 5 días naturales siguientes a la entrega y lo reponemos
          o reembolsamos. Por higiene y por la naturaleza artesanal de nuestros productos,
          no aceptamos devoluciones por cambio de opinión en artículos usados o sin su
          empaque original.
        </p>
      </Seccion>

      <Seccion title="Club Creativo">
        <p>
          El Club Creativo es un programa gratuito de lealtad. Tu tarjeta de socio vive en
          un enlace personal: quien tenga el enlace puede ver tu tarjeta, así que
          compártelo solo con quien quieras. La tarjeta es personal e intransferible y
          Papela Atelier puede cancelarla en caso de uso indebido.
        </p>
        <p>
          Los coleccionables se otorgan en compras, talleres, clases y actividades que
          Papela Atelier define; algunos incluyen premios descargables o físicos. Los
          premios físicos se recogen en tienda y no son canjeables por dinero. Los
          coleccionables repetidos pueden regalarse a otro socio mediante un código de un
          solo uso que vence a las 72 horas.
        </p>
        <p>
          Papela Atelier puede modificar, pausar o terminar el programa, así como cambiar
          los coleccionables y premios disponibles, avisándolo en el sitio o en tu
          tarjeta. Los premios ya ganados se respetan.
        </p>
      </Seccion>

      <Seccion title="Dopamina">
        <p>
          Dopamina es un juego gratuito de retos de dibujo. Al terminar un reto puedes,
          si quieres, publicar tu dibujo en Instagram etiquetando a @papela.atelier; al
          hacerlo nos autorizas a compartir esa publicación en nuestras redes dándote
          crédito. La sorpresa para quienes nos etiquetan está sujeta a disponibilidad y
          se entrega en tienda; no es canjeable por dinero.
        </p>
      </Seccion>

      <Seccion title="Propiedad intelectual">
        <p>
          Los diseños, fotografías, textos, logotipos, ilustraciones y coleccionables de
          este sitio son propiedad de Papela Atelier o de sus autores y no pueden
          reproducirse con fines comerciales sin autorización por escrito. Los dibujos que
          creas en Dopamina son tuyos.
        </p>
      </Seccion>

      <Seccion title="Ley aplicable">
        <p>
          Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier
          controversia se resolverá ante las autoridades competentes de la ciudad de
          Puebla, Puebla. La Procuraduría Federal del Consumidor (PROFECO) es competente
          para conocer de quejas en materia de consumo.
        </p>
      </Seccion>

      <p className="font-sans text-sm text-[var(--color-muted)] border-t border-[var(--color-border)] pt-6">
        ¿Dudas? Escríbenos a <Correo />. Consulta también nuestro{" "}
        <Link href="/privacidad" className="text-[var(--color-verde)] underline underline-offset-2">
          Aviso de privacidad
        </Link>
        .
      </p>
    </div>
  );
}
