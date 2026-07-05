import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 60;

// BORRADOR LEGAL: condiciones redactadas a partir de cómo opera hoy la tienda
// (MercadoPago, envío $80 MXN o recoger en tienda, talleres con cupo). El dueño
// debe revisar especialmente la política de cambios/cancelaciones antes de publicar.

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description:
    "Términos y condiciones de compra en Papela Atelier: pedidos, pagos, envíos, talleres, clases y personalización.",
  alternates: { canonical: "https://www.papela-atelier.com/terminos" },
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
        Última actualización: 4 de julio de 2026
      </p>

      <Seccion title="Sobre nosotros">
        <p>
          Papela Atelier es una papelería creativa con sede en Puebla, Puebla, México, que
          ofrece productos de papelería, talleres, clases de arte y servicios de
          personalización a través de este sitio (papela-atelier.com). Al comprar o reservar
          en el sitio aceptas estos términos.
        </p>
      </Seccion>

      <Seccion title="Productos y precios">
        <p>
          Todos los precios están expresados en pesos mexicanos (MXN). Los productos están
          sujetos a disponibilidad: el sitio muestra únicamente artículos con existencia,
          pero en casos excepcionales un producto puede agotarse antes de confirmarse el
          pago; si esto ocurre, te contactaremos para ofrecerte un cambio o el reembolso.
        </p>
        <p>
          Las fotografías son representativas; en productos artesanales puede haber
          pequeñas variaciones de color o acabado que son parte de su carácter hecho a mano.
        </p>
      </Seccion>

      <Seccion title="Pagos">
        <p>
          Los pagos en línea se procesan a través de Mercado Pago, que acepta tarjetas y
          otros medios según su plataforma. Papela Atelier no recibe ni almacena datos de
          tarjetas. Tu pedido o reserva se confirma cuando Mercado Pago acredita el pago.
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
          pago. Los materiales incluidos, la duración y el nivel se indican en la página de
          cada taller o clase.
        </p>
        <p>
          Si no puedes asistir, escríbenos por WhatsApp al +52 221 186 5590 lo antes
          posible: haremos lo posible por reagendarte en otra fecha del mismo taller o
          clase, sujeto a disponibilidad. Las inasistencias sin previo aviso no son
          reembolsables. Si Papela Atelier cancela o reprograma un taller, podrás elegir
          entre el cambio de fecha o el reembolso completo.
        </p>
      </Seccion>

      <Seccion title="Personalización por encargo">
        <p>
          Los proyectos personalizados (stickers, toppers, etiquetas y similares) se cotizan
          de forma individual a partir de tu solicitud. El precio, el anticipo y el tiempo
          de entrega se acuerdan contigo antes de iniciar. Por tratarse de productos hechos
          a la medida, los encargos personalizados no admiten devolución una vez aprobado el
          diseño, salvo defecto de fabricación.
        </p>
      </Seccion>

      <Seccion title="Cambios y devoluciones">
        <p>
          Si un producto llega defectuoso o recibiste un artículo distinto al que pediste,
          contáctanos dentro de los 5 días naturales siguientes a la entrega y lo
          reponemos o reembolsamos. Por higiene y por la naturaleza artesanal de nuestros
          productos, no aceptamos devoluciones por cambio de opinión en artículos usados o
          sin su empaque original.
        </p>
      </Seccion>

      <Seccion title="Propiedad intelectual">
        <p>
          Los diseños, fotografías, textos, logotipos e ilustraciones de este sitio son
          propiedad de Papela Atelier o de sus autores y no pueden reproducirse con fines
          comerciales sin autorización por escrito.
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
        ¿Dudas? Escríbenos a{" "}
        <a href="mailto:hola@papela-atelier.com" className="text-[var(--color-verde)] underline underline-offset-2">
          hola@papela-atelier.com
        </a>
        . Consulta también nuestro{" "}
        <Link href="/privacidad" className="text-[var(--color-verde)] underline underline-offset-2">
          Aviso de privacidad
        </Link>
        .
      </p>
    </div>
  );
}
