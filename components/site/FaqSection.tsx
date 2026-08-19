import Link from "next/link";
import ScrollReveal from "./ScrollReveal";

// FAQ del home con schema FAQPage: preguntas en el lenguaje natural con el que
// la gente busca en Google y pregunta a los asistentes de IA ("papelería bonita
// en Puebla", "talleres creativos"). Server component: <details>/<summary>
// nativos — indexable, accesible y sin JavaScript. Google exige que el texto
// del schema exista visible en la página: las respuestas del JSON-LD son la
// versión en texto plano de lo que se renderiza.
type Faq = { pregunta: string; respuesta: string; contenido: React.ReactNode };

const FAQS: Faq[] = [
  {
    pregunta: "¿Dónde comprar papelería bonita en Puebla?",
    respuesta:
      "En Papela Atelier, una papelería creativa en la zona de Lomas de Angelópolis, Puebla. Tenemos libretas artesanales, plumas, stickers, materiales de arte y detalles para regalar. También puedes comprar en línea en nuestro catálogo.",
    contenido: (
      <>
        En Papela Atelier, una papelería creativa en la zona de Lomas de Angelópolis, Puebla.
        Tenemos libretas artesanales, plumas, stickers, materiales de arte y detalles para
        regalar. También puedes comprar en línea en nuestro{" "}
        <Link href="/productos" className="text-[var(--color-verde)] underline underline-offset-2">
          catálogo
        </Link>
        .
      </>
    ),
  },
  {
    pregunta: "¿Qué talleres creativos hay en Puebla?",
    respuesta:
      "En Papela Atelier organizamos talleres presenciales de acuarela, acrílico, cerámica, dibujo y más, con instructores invitados cada mes. Son de cupo limitado e incluyen materiales; te llevas a casa lo que creaste.",
    contenido: (
      <>
        Organizamos{" "}
        <Link href="/talleres" className="text-[var(--color-verde)] underline underline-offset-2">
          talleres presenciales
        </Link>{" "}
        de acuarela, acrílico, cerámica, dibujo y más, con instructores invitados cada mes. Son
        de cupo limitado e incluyen materiales; te llevas a casa lo que creaste.
      </>
    ),
  },
  {
    pregunta: "¿Dan clases de arte para niños y adultos?",
    respuesta:
      "Sí. Tenemos clases regulares de pintura y técnicas artísticas para todos los niveles, con horarios entre semana y fines de semana. Puedes reservar tu lugar en línea.",
    contenido: (
      <>
        Sí. Tenemos{" "}
        <Link href="/clases" className="text-[var(--color-verde)] underline underline-offset-2">
          clases regulares
        </Link>{" "}
        de pintura y técnicas artísticas para todos los niveles, con horarios entre semana y
        fines de semana. Puedes reservar tu lugar en línea.
      </>
    ),
  },
  {
    pregunta: "¿Hacen papelería personalizada?",
    respuesta:
      "Sí, hacemos piezas por encargo: stickers, cake toppers, tazas, etiquetas, invitaciones y detalles para cumpleaños, bodas, baby showers y emprendimientos. Cuéntanos tu idea y te cotizamos.",
    contenido: (
      <>
        Sí, hacemos{" "}
        <Link href="/personaliza" className="text-[var(--color-verde)] underline underline-offset-2">
          piezas por encargo
        </Link>
        : stickers, cake toppers, tazas, etiquetas, invitaciones y detalles para cumpleaños,
        bodas, baby showers y emprendimientos. Cuéntanos tu idea y te cotizamos.
      </>
    ),
  },
  {
    pregunta: "¿Dónde está Papela Atelier y qué horario tienen?",
    respuesta:
      "Estamos en C. Hidalgo, zona Lomas de Angelópolis, Heroica Puebla de Zaragoza (CP 72830). Abrimos de lunes a viernes de 10:00 a 19:00, sábado de 10:00 a 15:30 y domingo de 12:00 a 19:00.",
    contenido: (
      <>
        Estamos en C. Hidalgo, zona Lomas de Angelópolis, Heroica Puebla de Zaragoza (CP 72830).
        Abrimos de lunes a viernes de 10:00 a 19:00, sábado de 10:00 a 15:30 y domingo de 12:00
        a 19:00.
      </>
    ),
  },
  {
    pregunta: "¿Hacen envíos o puedo recoger en tienda?",
    respuesta:
      "Las dos. Puedes comprar en línea con envío a domicilio o elegir recoger tu pedido en la tienda sin costo. El pago es seguro con Mercado Pago.",
    contenido: (
      <>
        Las dos. Puedes comprar en línea con envío a domicilio o elegir recoger tu pedido en la
        tienda sin costo. El pago es seguro con Mercado Pago.
      </>
    ),
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.pregunta,
    acceptedAnswer: { "@type": "Answer", text: f.respuesta },
  })),
};

export default function FaqSection() {
  return (
    <section className="w-[90%] mx-auto py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="max-w-3xl mx-auto">
        <ScrollReveal className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-terracota)] mb-3">
            Preguntas frecuentes
          </p>
          <h2 className="font-serif font-extralight text-[clamp(1.8rem,3.5vw,2.8rem)] text-[#403C3C]">
            ¿Tienes dudas? Aquí van las más comunes
          </h2>
        </ScrollReveal>
        {FAQS.map((f) => (
          <details
            key={f.pregunta}
            className="group border-b border-[var(--color-border)] py-5 marker:content-none"
          >
            <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-sans text-[17px] md:text-[18px] text-[var(--color-text)] [&::-webkit-details-marker]:hidden">
              {f.pregunta}
              <span
                aria-hidden="true"
                className="flex-shrink-0 w-8 h-8 rounded-full border border-[var(--color-verde)] text-[var(--color-verde)] flex items-center justify-center text-lg leading-none transition-transform duration-300 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="font-sans text-base leading-relaxed text-[var(--color-muted)] pt-3 pr-12">
              {f.contenido}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
