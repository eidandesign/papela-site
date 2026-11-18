import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  MapPinIcon,
  ClockIcon,
  ArrowRightIcon,
  BookOpenIcon,
  PaintBrushIcon,
  PencilIcon,
  SwatchIcon,
  ClipboardDocumentListIcon,
  GiftIcon,
  SparklesIcon,
  PrinterIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/solid";
import HeroSection from "@/components/site/HeroSection";
import ScrollReveal from "@/components/site/ScrollReveal";
import WhatsAppLink from "@/components/site/WhatsAppLink";
import TrackedLink from "@/components/site/TrackedLink";
import { SITE_URL } from "@/lib/site";
import { NEGOCIO, DIRECCION_LINEA } from "@/lib/negocio";

export const revalidate = 3600;

// Página de UBICACIÓN / SEO local (nov-2026). Es la que compite por
// "papelería en Puebla" y "papelería Lomas de Angelópolis": las que hoy
// rankean ahí son páginas de sucursal (Ofix, Clip) y directorios con la
// colonia en el título. El resto del sitio habla de Papela; esta habla del
// LUGAR: dirección completa, mapa, horario, zonas cercanas y qué encuentras.
const URL = `${SITE_URL}/papeleria-puebla`;

export const metadata: Metadata = {
  title: { absolute: "Papelería en Puebla — Papela Atelier, Lomas de Angelópolis" },
  description:
    "Papelería en Lomas de Angelópolis, Puebla: plumas MUJI, agendas, libretas, stationery, materiales de arte y papelería básica, más talleres y clases de arte. Dirección, horario y cómo llegar.",
  keywords: [
    "papelería en Puebla",
    "papelería Lomas de Angelópolis",
    "plumas MUJI Puebla",
    "agendas Puebla",
    "stationery Puebla",
    "papelería básica Puebla",
    "materiales de arte Puebla",
    "talleres de arte Puebla",
    "clases de arte Puebla",
  ],
  alternates: { canonical: URL },
  openGraph: {
    title: "Papelería en Puebla — Papela Atelier, Lomas de Angelópolis",
    description:
      "Papelería en Lomas de Angelópolis, Puebla: plumas MUJI, agendas, libretas, stationery, materiales de arte, papelería básica, talleres y clases. Te esperamos en C. Hidalgo.",
    url: URL,
    images: [{ url: "/images/papela-fachada.jpg", alt: "Fachada de Papela Atelier en Lomas de Angelópolis, Puebla" }],
  },
};

const ENCUENTRAS = [
  {
    icon: PencilIcon,
    titulo: "Plumas MUJI y stationery",
    texto: "Plumas de gel MUJI, marcadores, plumas fuente, washi tape, stickers y stationery japonés y coreano.",
    href: "/productos",
    bg: "#DFE7D8",
  },
  {
    icon: BookOpenIcon,
    titulo: "Agendas y libretas",
    texto: "Agendas, planners, libretas artesanales y cuadernos cosidos para organizarte y escribir bonito.",
    href: "/productos",
    bg: "#F0D9CC",
  },
  {
    icon: ClipboardDocumentListIcon,
    titulo: "Papelería básica",
    texto: "Lo de todos los días: cuadernos, lápices, colores, plumas, pegamento, tijeras, hojas, folders y útiles escolares.",
    href: "/productos",
    bg: "#F7F3EC",
  },
  {
    icon: SwatchIcon,
    titulo: "Materiales de arte",
    texto: "Acuarelas, acrílicos, pinceles, lápices, marcadores y papeles para dibujar y pintar.",
    href: "/productos",
    bg: "#CED8D9",
  },
  {
    icon: GiftIcon,
    titulo: "Regalos y detalles",
    texto: "Charms, tarjetas, envoltura y piezas de ilustradores y marcas independientes.",
    href: "/productos",
    bg: "#EEC3D7",
  },
  {
    icon: SparklesIcon,
    titulo: "Papelería personalizada",
    texto: "Stickers, etiquetas, toppers, invitaciones y detalles a la medida para tu evento o negocio.",
    href: "/personaliza",
    bg: "#E6D7CD",
  },
  {
    icon: PrinterIcon,
    titulo: "Impresión y diseño",
    texto: "Impresiones, tarjetas, etiquetas escolares y diseño gráfico con entrega en tienda.",
    href: "/servicios",
    bg: "#F0E9CC",
  },
  {
    icon: AcademicCapIcon,
    titulo: "Talleres de arte",
    texto: "Talleres presenciales de acuarela, acrílico, cerámica, dibujo y más, con invitados cada mes. Incluyen materiales.",
    href: "/talleres",
    bg: "#DFE9EA",
  },
  {
    icon: PaintBrushIcon,
    titulo: "Clases de arte",
    texto: "Clases regulares de pintura y técnicas artísticas para niños y adultos, entre semana y fines de semana.",
    href: "/clases",
    bg: "#C9D3C0",
  },
];

const ZONAS = [
  "Lomas de Angelópolis",
  "Cascatta",
  "Angelópolis",
  "San Andrés Cholula",
  "Zavaleta",
  "La Vista",
  "Puebla centro y sur",
];

const FAQS = [
  {
    pregunta: "¿Dónde hay una papelería bonita en Lomas de Angelópolis?",
    respuesta: `Papela Atelier está en ${DIRECCION_LINEA} Somos una papelería creativa: plumas MUJI, agendas, libretas, stationery, materiales de arte, papelería básica, regalos y personalización, además de talleres y clases de arte.`,
  },
  {
    pregunta: "¿Cuál es el horario de Papela Atelier?",
    respuesta: NEGOCIO.horario.map((h) => `${h.dias} de ${h.abre} a ${h.cierra}`).join("; ") + ".",
  },
  {
    pregunta: "¿Venden plumas MUJI en Puebla?",
    respuesta:
      "Sí. En Papela tenemos plumas de gel MUJI y otras plumas, marcadores y stationery japonés y coreano, además de agendas, libretas y washi tape. Pregúntanos por WhatsApp qué colores hay disponibles.",
  },
  {
    pregunta: "¿Tienen papelería básica y útiles escolares?",
    respuesta:
      "Sí. Además de lo creativo tenemos la papelería básica de todos los días: cuadernos, lápices, colores, plumas, pegamento, tijeras, hojas, folders y útiles escolares, y hacemos etiquetas escolares personalizadas.",
  },
  {
    pregunta: "¿Puedo comprar en línea y recoger en la tienda?",
    respuesta:
      "Sí. En el catálogo en línea eliges recoger en Papela, en Lomas de Angelópolis, sin costo, o envío a domicilio en Puebla y el resto de México.",
  },
  {
    pregunta: "¿Hacen papelería personalizada e impresiones en Puebla?",
    respuesta:
      "Sí. Hacemos stickers, etiquetas, toppers, invitaciones y detalles a la medida, además de impresión y diseño gráfico. Cuéntanos tu idea por WhatsApp y te cotizamos.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Papelería en Puebla", item: URL },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.pregunta,
        acceptedAnswer: { "@type": "Answer", text: f.respuesta },
      })),
    },
  ],
};

export default function PapeleriaPueblaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {/* ── Hero ── */}
      <HeroSection>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8 md:px-20 pt-[140px] md:pt-[180px] pb-16 md:pb-20">
          <span data-hero-badge className="inline-flex items-center border border-[var(--color-cremita)]/40 rounded-full px-5 py-2 mb-8">
            <span className="label text-[var(--color-cremita)]/85">Visítanos</span>
          </span>
          <h1 className="font-serif italic text-[clamp(2.5rem,5.5vw,5rem)] leading-[1.05] text-[var(--color-cremita)] max-w-4xl mb-6">
            Papelería en Lomas de Angelópolis, Puebla
          </h1>
          <p className="font-sans text-[var(--color-cremita)]/90 text-[18px] leading-[24px] max-w-2xl">
            Papela es una papelería creativa en {NEGOCIO.direccion.calle}, {NEGOCIO.direccion.colonia}: plumas MUJI,
            agendas, libretas, stationery, materiales de arte y toda la papelería básica, además de regalos,
            personalización, impresión y un espacio con talleres y clases de arte.
          </p>
        </div>
      </HeroSection>

      {/* ── Dirección + horario + mapa ── */}
      <section className="w-[90%] mx-auto py-12 md:py-16">
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            <div className="bg-[#E8E7E4] rounded-2xl px-8 md:px-12 py-10 md:py-12 flex flex-col gap-8">
              <h2 className="font-serif font-extralight text-[clamp(2rem,3.2vw,3rem)] text-[#403C3C] leading-[1.15]">
                Aquí nos encuentras
              </h2>

              <div className="flex gap-4">
                <MapPinIcon className="w-6 h-6 shrink-0 text-[var(--color-verde)] mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-terracota)] mb-1">Dirección</p>
                  <address className="not-italic font-sans text-[17px] leading-relaxed text-[var(--color-text)]">
                    {NEGOCIO.direccion.calle}, {NEGOCIO.direccion.colonia}
                    <br />
                    {NEGOCIO.direccion.cp} {NEGOCIO.direccion.ciudad}, {NEGOCIO.direccion.estado}
                  </address>
                </div>
              </div>

              <div className="flex gap-4">
                <ClockIcon className="w-6 h-6 shrink-0 text-[var(--color-verde)] mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-terracota)] mb-1">Horario</p>
                  <dl className="font-sans text-[17px] leading-relaxed text-[var(--color-text)]">
                    {NEGOCIO.horario.map((h) => (
                      <div key={h.dias} className="flex gap-3">
                        <dt className="min-w-[8.5rem]">{h.dias}</dt>
                        <dd>
                          {h.abre} – {h.cierra}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-auto">
                <TrackedLink
                  evento="pa_click_como_llegar"
                  ubicacion="papeleria-puebla"
                  href={NEGOCIO.comoLlegarUrl}
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[var(--color-verde)] px-6 py-3 font-sans text-sm font-medium text-[var(--color-cremita)]"
                >
                  Cómo llegar
                  <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </TrackedLink>
                <WhatsAppLink
                  ubicacion="papeleria-puebla"
                  texto="Hola Papela 🌿 quiero saber si tienen algo en la tienda"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--color-verde)] px-6 py-3 font-sans text-sm font-medium text-[var(--color-verde)] hover:bg-[var(--color-verde)] hover:text-[var(--color-cremita)] transition-colors"
                >
                  Pregúntanos por WhatsApp
                </WhatsAppLink>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="relative aspect-[4/3] lg:aspect-auto lg:flex-1 min-h-[280px] rounded-2xl overflow-hidden">
                <Image
                  src="/images/papela-fachada.jpg"
                  alt="Fachada de Papela Atelier, papelería en Lomas de Angelópolis, Puebla"
                  fill
                  sizes="(min-width: 1024px) 45vw, 90vw"
                  className="object-cover"
                />
              </div>
              <div className="rounded-2xl overflow-hidden border border-[var(--color-border)] bg-white">
                <iframe
                  title="Mapa de Papela Atelier en Lomas de Angelópolis, Puebla"
                  src={NEGOCIO.mapaEmbedUrl}
                  width="100%"
                  height="280"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                  className="block w-full"
                />
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ── Qué encuentras ── */}
      <section className="w-[90%] mx-auto py-12 md:py-16">
        <ScrollReveal>
          <div className="max-w-3xl mb-10">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-terracota)] mb-3">
              Qué encuentras en Papela
            </p>
            <h2 className="font-serif font-extralight text-[clamp(2rem,3.2vw,3rem)] text-[#403C3C] leading-[1.15]">
              Más que una papelería en Puebla
            </h2>
            <p className="font-sans text-[var(--color-muted)] text-[17px] leading-relaxed mt-4">
              Tenemos lo básico de cualquier papelería y lo que no encuentras en otra: plumas MUJI, agendas,
              stationery, materiales de arte y piezas de ilustradores y marcas independientes. Y si no lo encuentras
              hecho, lo personalizamos.
            </p>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {ENCUENTRAS.map((item, i) => (
            <ScrollReveal key={item.titulo} delay={i * 0.05}>
              <Link
                href={item.href}
                className="group flex flex-col h-full rounded-2xl p-7 transition-transform hover:-translate-y-1"
                style={{ backgroundColor: item.bg }}
              >
                <item.icon className="w-8 h-8 text-[var(--color-verde)] mb-5" aria-hidden="true" />
                <h3 className="font-serif italic text-[1.6rem] leading-tight text-[#403C3C] mb-2">{item.titulo}</h3>
                <p className="font-sans text-[15px] leading-relaxed text-[var(--color-text)]/80 flex-1">{item.texto}</p>
                <span className="mt-5 inline-flex items-center gap-2 font-sans text-sm font-medium text-[var(--color-verde)]">
                  Ver más
                  <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── Zonas cercanas ── */}
      <section className="w-[90%] mx-auto py-12 md:py-16">
        <ScrollReveal>
          <div className="bg-[var(--color-verde)] rounded-2xl px-8 md:px-16 py-12 md:py-16 flex flex-col lg:flex-row gap-10 items-start">
            <div className="flex-1">
              <h2 className="font-serif italic text-[clamp(2rem,3.2vw,3rem)] text-[var(--color-cremita)] leading-[1.1] mb-5">
                Tu papelería cerca de Angelópolis
              </h2>
              <p className="font-sans text-[var(--color-cremita)]/90 text-[17px] leading-relaxed">
                Estamos en la calle Hidalgo, dentro de Lomas de Angelópolis, a unos minutos de Cascatta, la zona de
                Angelópolis y San Andrés Cholula. Si vienes de otra parte de Puebla, también puedes comprar en línea y
                recoger tu pedido en la tienda o recibirlo en casa.
              </p>
            </div>
            <ul className="flex flex-wrap gap-2.5 lg:max-w-sm" aria-label="Zonas cercanas">
              {ZONAS.map((z) => (
                <li
                  key={z}
                  className="rounded-full border border-[var(--color-cremita)]/40 px-4 py-2 font-sans text-sm text-[var(--color-cremita)]"
                >
                  {z}
                </li>
              ))}
            </ul>
          </div>
        </ScrollReveal>
      </section>

      {/* ── FAQ ── */}
      <section className="w-[90%] mx-auto py-12 md:py-16 max-w-4xl">
        <ScrollReveal>
          <h2 className="font-serif font-extralight text-[clamp(2rem,3.2vw,3rem)] text-[#403C3C] leading-[1.15] mb-8">
            Preguntas frecuentes
          </h2>
          <div className="flex flex-col divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
            {FAQS.map((f) => (
              <details key={f.pregunta} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif italic text-[1.35rem] text-[#403C3C]">
                  {f.pregunta}
                  <span className="shrink-0 w-8 h-8 rounded-full border border-[var(--color-verde)] flex items-center justify-center text-[var(--color-verde)] transition-transform group-open:rotate-90">
                    <ArrowRightIcon className="w-4 h-4" />
                  </span>
                </summary>
                <p className="font-sans text-[16px] leading-relaxed text-[var(--color-muted)] mt-3 max-w-3xl">
                  {f.respuesta}
                </p>
              </details>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* ── CTA ── */}
      <section className="w-[90%] mx-auto pb-16 md:pb-24">
        <ScrollReveal>
          <div className="bg-[var(--color-terracota)] rounded-2xl px-8 md:px-16 py-12 text-center">
            <h2 className="font-serif italic text-[clamp(1.8rem,3vw,2.6rem)] text-[var(--color-cremita)] leading-[1.1] mb-6">
              Te esperamos en Lomas de Angelópolis
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              <TrackedLink
                evento="pa_click_como_llegar"
                ubicacion="papeleria-puebla-cta"
                href={NEGOCIO.comoLlegarUrl}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-cremita)] px-6 py-3 font-sans text-sm font-medium text-[var(--color-terracota)]"
              >
                Abrir en Google Maps
                <ArrowRightIcon className="w-4 h-4" />
              </TrackedLink>
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--color-cremita)]/60 px-6 py-3 font-sans text-sm font-medium text-[var(--color-cremita)]"
              >
                Ver catálogo en línea
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
