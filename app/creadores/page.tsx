import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  BanknotesIcon,
  BookOpenIcon,
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  CubeIcon,
  GiftIcon,
  HandRaisedIcon,
  HeartIcon,
  LightBulbIcon,
  MagnifyingGlassIcon,
  PaintBrushIcon,
  SparklesIcon,
  SwatchIcon,
  UserGroupIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import ScrollReveal from "@/components/site/ScrollReveal";
import PostulacionCreadores from "@/components/site/creadores/PostulacionCreadores";
import { CONDICIONES } from "@/lib/creadores/config";

// Creadores en Papela (/creadores, nov-2026): landing PÚBLICA del programa de
// consignación para ilustradores, artistas, diseñadores y marcas
// independientes. Paleta: par Cacao del Brand Book (artistas invitados,
// colaboraciones). Las cifras viven en CONDICIONES (lib/creadores/config.ts).
// El formulario guarda en `creadores_postulaciones` (estado `recibida`) y
// las fotos en el bucket privado `creadores-fotos`; enviar NO es aceptación.

export const revalidate = 60;

const URL_PAGINA = "https://www.papela-atelier.com/creadores";
const TITULO = "Creadores en Papela | Vende tus productos en Papela Atelier";
const DESCRIPCION =
  "¿Eres ilustrador, artista o tienes una marca creativa? Descubre cómo exhibir y vender tus productos en Papela Atelier, Puebla.";

export const metadata: Metadata = {
  title: { absolute: TITULO },
  description: DESCRIPCION,
  alternates: { canonical: URL_PAGINA },
  openGraph: {
    title: TITULO,
    description: DESCRIPCION,
    url: URL_PAGINA,
    type: "website",
    locale: "es_MX",
    images: [
      {
        url: "/images/creadores/hero-creadores.jpg",
        width: 1289,
        height: 1600,
        alt: "Mano sosteniendo un set de plumas ilustradas frente a una mesa de papelería independiente",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITULO,
    description: DESCRIPCION,
    images: ["/images/creadores/hero-creadores.jpg"],
  },
};

const C = CONDICIONES;

// ── Contenido ──────────────────────────────────────────────────────────────

const PASOS = [
  {
    icono: ChatBubbleLeftRightIcon,
    titulo: "Comparte tu proyecto",
    texto: "Cuéntanos sobre tu marca y los productos que te gustaría vender.",
  },
  {
    icono: MagnifyingGlassIcon,
    titulo: "Seleccionamos juntos",
    texto:
      "Revisamos tu propuesta para asegurarnos de que encaje con nuestra comunidad y el espacio disponible.",
  },
  {
    icono: BuildingStorefrontIcon,
    titulo: "Exhibe y vende",
    texto:
      "Recibimos tus productos, los organizamos y los ponemos a la venta en nuestra tienda.",
  },
  {
    icono: BanknotesIcon,
    titulo: "Recibe tus ganancias",
    texto: `Cada venta se registra y recibes el ${C.gananciaCreador}% del precio de venta acordado.`,
  },
];

const TARJETAS_CONDICIONES = [
  {
    icono: BanknotesIcon,
    destacado: `${C.comisionPapela}%`,
    titulo: "para Papela",
    texto: `Por cada producto vendido, Papela recibe una comisión del ${C.comisionPapela}% y el creador conserva el ${C.gananciaCreador}%.`,
  },
  {
    icono: CalendarDaysIcon,
    destacado: `${C.diasExhibicion} días`,
    titulo: "de exhibición inicial",
    texto: `Tus productos podrán permanecer en nuestra tienda durante un periodo inicial de ${C.diasExhibicion} días. Si un producto no registra ventas, coordinaremos su devolución sin penalización.`,
  },
  {
    icono: VideoCameraIcon,
    destacado: "1 historia",
    titulo: "por semana",
    texto: `Mientras tus productos estén en Papela, deberás compartir al menos una historia semanal en Instagram mencionando que están disponibles en nuestra tienda y etiquetando a ${C.instagram}.`,
  },
  {
    icono: HandRaisedIcon,
    destacado: "1 pieza",
    titulo: "de muestra",
    texto:
      "Para los productos que necesiten demostración o manipulación, solicitaremos una pieza adicional de exhibición. Esta también se devolverá al finalizar la colaboración, considerando el desgaste normal derivado de su uso.",
  },
];

const CATEGORIAS = [
  {
    icono: PaintBrushIcon,
    titulo: "Ilustraciones y prints",
    bg: "#F0D9CC",
    tinta: "#6B3A26",
  },
  {
    icono: SparklesIcon,
    titulo: "Stickers y papelería creativa",
    bg: "#EEC3D7",
    tinta: "#422526",
  },
  {
    icono: BookOpenIcon,
    titulo: "Libretas, planners y journals",
    bg: "#C9D3C0",
    tinta: "#2F4A33",
  },
  {
    icono: SwatchIcon,
    titulo: "Accesorios de diseño",
    bg: "#CED8D9",
    tinta: "#014375",
  },
  {
    icono: GiftIcon,
    titulo: "Objetos creativos y regalos",
    bg: "#F0E6D0",
    tinta: "#664917",
  },
  {
    icono: LightBulbIcon,
    titulo: "Productos originales de marcas independientes",
    bg: "#E0D2CA",
    tinta: "#4A3B31",
  },
];

const BENEFICIOS = [
  {
    icono: BuildingStorefrontIcon,
    texto: "Presencia física en Papela Atelier.",
  },
  { icono: UserGroupIcon, texto: "Oportunidad de llegar a nuevos clientes." },
  { icono: CubeIcon, texto: "Sin renta mensual por espacio de exhibición." },
  {
    icono: HeartIcon,
    texto: "Sin necesidad de atender personalmente las ventas.",
  },
  {
    icono: VideoCameraIcon,
    texto: "Participación potencial en contenidos de Papela.",
  },
  {
    icono: SparklesIcon,
    texto: "Una comunidad interesada en diseño, arte y creatividad.",
  },
];

const PREGUNTAS = [
  {
    p: "¿Tiene algún costo participar?",
    r: `No cobramos inscripción ni renta mensual. Papela recibe el ${C.comisionPapela}% únicamente de las ventas realizadas, conforme al acuerdo firmado.`,
  },
  {
    p: "¿Quién define los precios?",
    r: "El creador propone los precios de sus productos y Papela los valida antes de exhibirlos.",
  },
  {
    p: "¿Cuándo recibo mis pagos?",
    r: `Realizamos un corte mensual de ventas y los pagos correspondientes dentro de los primeros ${C.diasHabilesPago === 5 ? "cinco" : C.diasHabilesPago} días hábiles del mes siguiente.`,
  },
  {
    p: "¿Qué pasa si mis productos no se venden?",
    r: `Al finalizar los primeros ${C.diasExhibicion} días, revisaremos los resultados. Los productos que no hayan registrado ventas podrán retirarse sin penalización. También podremos acordar una renovación si ambas partes están interesadas.`,
  },
  {
    p: "¿Debo promocionar mis productos?",
    r: `Sí. Solicitamos al menos una historia semanal en Instagram, etiquetando a ${C.instagram} y comunicando que tus productos están disponibles en Papela.`,
  },
  {
    p: "¿Qué sucede con mi producto de muestra?",
    r: "Las muestras pueden ser manipuladas por clientes y presentar desgaste normal. Serán devueltas al finalizar la colaboración, de acuerdo con las condiciones del contrato. Cualquier responsabilidad por daños o pérdidas se determinará conforme a dicho acuerdo y la legislación aplicable.",
  },
  {
    p: "¿Papela acepta todos los productos?",
    r: "No. Revisamos cada propuesta tomando en cuenta calidad, originalidad, compatibilidad con nuestra tienda y espacio disponible.",
  },
  {
    p: "¿Puedo retirar mis productos antes?",
    r: "Sí, mediante una solicitud y siguiendo el procedimiento de retiro establecido en nuestro acuerdo.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: PREGUNTAS.map((q) => ({
    "@type": "Question",
    name: q.p,
    acceptedAnswer: { "@type": "Answer", text: q.r },
  })),
};

// ── Piezas ─────────────────────────────────────────────────────────────────

type VarianteCta = "rosa" | "contorno" | "verde" | "cremita";
const CTA: Record<VarianteCta, { base: string; relleno: string }> = {
  // Sobre cacao: rosa-papel con letra cacao (8.8:1), se rellena de cremita
  rosa: {
    base: "bg-[var(--color-rosa-papel)] text-[var(--color-cacao)]",
    relleno: "bg-[var(--color-cremita)]",
  },
  // Secundario sobre cacao: contorno cremita, se rellena de cremita
  contorno: {
    base: "border border-[var(--color-cremita)]/70 text-[var(--color-cremita)] hover:text-[var(--color-cacao)] transition-colors duration-500",
    relleno: "bg-[var(--color-cremita)]",
  },
  // Primario sobre claro
  verde: {
    base: "bg-[var(--color-verde)] text-[var(--color-cremita)]",
    relleno: "bg-black/15",
  },
  // Contorno verde sobre claro
  cremita: {
    base: "border border-[var(--color-verde)] text-[var(--color-verde)] hover:text-[var(--color-cremita)] transition-colors duration-500",
    relleno: "bg-[var(--color-verde)]",
  },
};

function Cta({
  href,
  variante,
  children,
  icono = "derecha",
}: {
  href: string;
  variante: VarianteCta;
  children: React.ReactNode;
  icono?: "derecha" | "abajo" | "ninguno";
}) {
  const v = CTA[variante];
  const Icono =
    icono === "ninguno"
      ? null
      : icono === "abajo"
        ? ArrowDownIcon
        : ArrowRightIcon;
  return (
    <a
      href={href}
      className={`group relative inline-flex min-h-12 items-center justify-center gap-2 text-center sm:whitespace-nowrap overflow-hidden rounded-full px-7 py-3.5 font-sans text-[15px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${v.base}`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-0 origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100 ${v.relleno}`}
      />
      <span className="relative">{children}</span>
      {Icono && (
        <Icono
          className={`relative h-4 w-4 transition-transform duration-300 ${icono === "abajo" ? "group-hover:translate-y-0.5" : "group-hover:translate-x-0.5"}`}
          aria-hidden="true"
        />
      )}
    </a>
  );
}

function Encabezado({
  eyebrow,
  titulo,
  texto,
  centrado = false,
  id,
}: {
  eyebrow: string;
  titulo: string;
  texto?: string;
  centrado?: boolean;
  id?: string;
}) {
  return (
    <ScrollReveal className={centrado ? "text-center" : ""}>
      <p className="label text-[var(--color-terracota)] mb-3">{eyebrow}</p>
      <h2
        id={id}
        className={`font-serif italic text-[#403C3C] text-[clamp(2.25rem,4vw,3.25rem)] leading-[1.05] max-w-3xl ${centrado ? "mx-auto" : ""} ${texto ? "mb-4" : ""}`}
      >
        {titulo}
      </h2>
      {texto && (
        <p
          className={`font-sans text-[17px] leading-[26px] text-[var(--color-muted)] max-w-2xl ${centrado ? "mx-auto" : ""}`}
        >
          {texto}
        </p>
      )}
    </ScrollReveal>
  );
}

// ── Página ─────────────────────────────────────────────────────────────────

export default function CreadoresPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* 1 · Hero — par Cacao */}
      <section
        aria-labelledby="creadores-titulo"
        className="relative mt-6 rounded-[32px] md:rounded-[48px] overflow-hidden min-h-[80vh] flex flex-col"
        style={{
          width: "98vw",
          marginLeft: "1vw",
          marginRight: "1vw",
          backgroundColor: "var(--color-cacao)",
        }}
      >
        <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-20 pt-[140px] md:pt-[180px] pb-16 md:pb-20">
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <p className="label text-[var(--color-rosa-papel)] mb-5 md:mb-6">
                Creadores en Papela
              </p>
              <h1
                id="creadores-titulo"
                className="font-serif italic text-[clamp(2.5rem,5.5vw,5rem)] leading-[1.05] text-[var(--color-cremita)] max-w-xl mb-5 md:mb-6"
              >
                Tu creatividad merece un lugar donde brillar.
              </h1>
              <p className="font-sans text-[18px] leading-[26px] text-[var(--color-cremita)]/90 max-w-lg mb-10">
                ¿Ilustras, diseñas o creas productos increíbles? En Papela
                queremos descubrir tu trabajo, compartirlo con nuestra comunidad
                y darle un espacio especial dentro de nuestra tienda.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Cta href="#postula" variante="rosa" icono="ninguno">
                  Quiero formar parte
                </Cta>
                <Cta href="#como-funciona" variante="contorno" icono="ninguno">
                  Conoce cómo funciona
                </Cta>
              </div>
            </div>

            {/* Fotografía editorial: papelería e ilustración independiente */}
            <div className="relative mx-auto w-full max-w-[520px]">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] md:rounded-[36px] rotate-[1.5deg] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)]">
                <Image
                  src="/images/creadores/hero-creadores.jpg"
                  alt="Mano sosteniendo un set de tres plumas ilustradas, con libretas y stickers de diseño independiente al fondo"
                  fill
                  priority
                  sizes="(min-width: 1024px) 520px, 90vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2 · Cómo funciona */}
      <section
        id="como-funciona"
        aria-labelledby="como-funciona-titulo"
        className="scroll-mt-28 w-[90%] mx-auto py-12 md:py-16 mt-6 md:mt-10"
      >
        <Encabezado
          eyebrow="Cómo funciona"
          titulo="Tú creas. Nosotros te ayudamos a llegar más lejos."
          id="como-funciona-titulo"
          centrado
        />
        <div className="relative mt-10 md:mt-14">
          {/* Hilo que une los pasos (solo desktop) */}
          <span
            aria-hidden="true"
            className="hidden lg:block absolute left-[12%] right-[12%] top-[52px] border-t border-dashed border-[var(--color-terracota)]/40"
          />
          <ol className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {PASOS.map((paso, i) => (
              <li key={paso.titulo} className="h-full">
                <ScrollReveal delay={i * 0.08} className="h-full">
                  <div className="relative h-full rounded-[28px] bg-[#FAF8F5] border border-[var(--color-border)] p-7 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgba(66,37,38,0.45)]">
                    <div className="flex items-center justify-between mb-6">
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-cacao)] text-[var(--color-rosa-papel)]">
                        <paso.icono className="h-6 w-6" aria-hidden="true" />
                      </span>
                      <span
                        className="font-serif italic text-[44px] leading-none text-[var(--color-cacao)]/25"
                        aria-hidden="true"
                      >
                        0{i + 1}
                      </span>
                    </div>
                    <h3 className="font-serif italic text-[24px] leading-tight text-[#403C3C] mb-2">
                      <span className="sr-only">Paso {i + 1}: </span>
                      {paso.titulo}
                    </h3>
                    <p className="font-sans text-[16px] leading-[24px] text-[var(--color-muted)]">
                      {paso.texto}
                    </p>
                  </div>
                </ScrollReveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 3 · Qué productos buscamos */}
      <section
        aria-labelledby="productos-titulo"
        className="w-[90%] mx-auto py-12 md:py-16"
      >
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-4 md:gap-10 md:items-end mb-8 md:mb-10">
          <Encabezado
            eyebrow="Qué productos buscamos"
            titulo="Nos encantan las ideas diferentes."
            id="productos-titulo"
          />
          <ScrollReveal>
            <p className="font-sans text-[17px] leading-[26px] text-[var(--color-muted)] max-w-xl md:pb-2">
              Buscamos proyectos con voz propia que aporten algo a la identidad
              de Papela. Cada propuesta se revisa con calma: no se trata de
              llenar repisas, sino de encontrar piezas que nuestra comunidad
              quiera llevarse a casa.
            </p>
          </ScrollReveal>
        </div>
        <ul className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
          {CATEGORIAS.map((cat, i) => (
            <li key={cat.titulo} className="h-full">
              <ScrollReveal delay={i * 0.05} className="h-full">
                <div
                  className="group h-full min-h-[150px] md:min-h-[190px] rounded-[24px] md:rounded-[28px] p-5 md:p-7 flex flex-col justify-between gap-6 transition-transform duration-300 hover:-translate-y-1"
                  style={{ backgroundColor: cat.bg, color: cat.tinta }}
                >
                  <cat.icono
                    className="h-8 w-8 md:h-9 md:w-9 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110"
                    aria-hidden="true"
                  />
                  <h3 className="font-serif italic text-[20px] md:text-[26px] leading-[1.1]">
                    {cat.titulo}
                  </h3>
                </div>
              </ScrollReveal>
            </li>
          ))}
        </ul>
        <ScrollReveal>
          <p className="mt-8 text-center font-serif italic text-[22px] md:text-[26px] text-[#403C3C]">
            ¿Creas algo que no aparece en esta lista? También queremos
            conocerlo.
          </p>
        </ScrollReveal>
      </section>

      {/* 4 · Condiciones comerciales */}
      <section
        id="condiciones"
        aria-labelledby="condiciones-titulo"
        className="scroll-mt-28 w-[90%] mx-auto py-12 md:py-16"
      >
        <ScrollReveal>
          <div className="rounded-[32px] md:rounded-[48px] bg-[var(--color-cacao)] px-6 py-12 md:px-14 md:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 lg:gap-16 lg:items-end mb-10 md:mb-12">
              <div>
                <p className="label text-[var(--color-rosa-papel)] mb-3">
                  Condiciones comerciales
                </p>
                <h2
                  id="condiciones-titulo"
                  className="font-serif italic text-[clamp(2.25rem,4vw,3.25rem)] leading-[1.05] text-[var(--color-cremita)]"
                >
                  Una colaboración donde todos crecemos.
                </h2>
              </div>
              {/* Reparto de cada venta, visual */}
              <figure>
                <div
                  className="flex h-14 overflow-hidden rounded-full"
                  role="img"
                  aria-label={`De cada venta: ${C.gananciaCreador}% para ti y ${C.comisionPapela}% para Papela`}
                >
                  <div
                    className="flex items-center px-5 bg-[var(--color-rosa-papel)] text-[var(--color-cacao)]"
                    style={{ width: `${C.gananciaCreador}%` }}
                  >
                    <span className="font-serif italic text-[22px]">
                      {C.gananciaCreador}%
                    </span>
                    <span className="ml-2 font-sans text-[13px] font-semibold">
                      para ti
                    </span>
                  </div>
                  <div
                    className="flex items-center justify-end px-5 bg-[var(--color-cremita)] text-[var(--color-cacao)]"
                    style={{ width: `${C.comisionPapela}%` }}
                  >
                    <span className="font-serif italic text-[22px]">
                      {C.comisionPapela}%
                    </span>
                  </div>
                </div>
                <figcaption className="mt-3 font-sans text-[14px] text-[var(--color-cremita)]/85">
                  Así se reparte cada producto vendido. Sin inscripción ni renta
                  mensual.
                </figcaption>
              </figure>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {TARJETAS_CONDICIONES.map((t, i) => (
                <ScrollReveal
                  key={t.titulo}
                  delay={i * 0.06}
                  className="h-full"
                >
                  <article className="h-full rounded-[24px] bg-[var(--color-cremita-3)] p-6 md:p-8 transition-transform duration-300 hover:-translate-y-0.5">
                    <div className="flex items-start gap-4 mb-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-rosa-papel)] text-[var(--color-cacao)]">
                        <t.icono className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <h3 className="font-serif italic text-[var(--color-cacao)] leading-tight">
                        <span className="block text-[34px] leading-none">
                          {t.destacado}
                        </span>
                        <span className="block text-[20px] mt-1">
                          {t.titulo}
                        </span>
                      </h3>
                    </div>
                    <p className="font-sans text-[16px] leading-[24px] text-[var(--color-text)]">
                      {t.texto}
                    </p>
                  </article>
                </ScrollReveal>
              ))}
            </div>

            <p className="mt-8 font-sans text-[14px] leading-[21px] text-[var(--color-cremita)]/85 max-w-3xl">
              La aceptación al programa está sujeta a la evaluación de cada
              propuesta, a la disponibilidad de espacio en la tienda y a la
              firma del acuerdo de consignación correspondiente.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* 5 · Lo que ganas al unirte */}
      <section
        aria-labelledby="beneficios-titulo"
        className="w-[90%] mx-auto py-12 md:py-16"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-center">
          <ScrollReveal direction="left">
            <div className="relative aspect-[4/5] max-h-[620px] w-full overflow-hidden rounded-[28px] md:rounded-[40px]">
              <Image
                src="/images/nosotros/comunidad.jpg"
                alt="Personas creando juntas en la terraza de Papela"
                fill
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="object-cover"
              />
            </div>
          </ScrollReveal>
          <div>
            <Encabezado
              eyebrow="Lo que ganas al unirte"
              titulo="Más que una repisa, un espacio para conectar."
              id="beneficios-titulo"
            />
            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BENEFICIOS.map((b, i) => (
                <li key={b.texto} className="h-full">
                  <ScrollReveal delay={i * 0.05} className="h-full">
                    <div className="h-full flex items-start gap-3 rounded-[20px] bg-white/70 border border-[var(--color-border)] p-5">
                      <b.icono
                        className="h-6 w-6 shrink-0 text-[var(--color-terracota)]"
                        aria-hidden="true"
                      />
                      <span className="font-sans text-[16px] leading-[23px] text-[var(--color-text)]">
                        {b.texto}
                      </span>
                    </div>
                  </ScrollReveal>
                </li>
              ))}
            </ul>
            <p className="mt-6 font-sans text-[13px] leading-[19px] text-[var(--color-muted)]">
              Las ventas dependen de cada producto y de la temporada: no
              garantizamos un volumen mínimo de ventas ni publicaciones en
              nuestras redes.
            </p>
          </div>
        </div>
      </section>

      {/* 6 · Formulario de postulación */}
      <section
        id="postula"
        aria-labelledby="postula-titulo"
        className="scroll-mt-28 w-[90%] mx-auto py-12 md:py-16"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Encabezado
              eyebrow="Postulación"
              titulo="¿Listo para formar parte de Papela?"
              texto="Nos encantará conocer lo que haces. Completa el siguiente formulario y revisaremos tu propuesta."
              id="postula-titulo"
            />
            <ScrollReveal>
              <ul className="mt-8 flex flex-col gap-3 font-sans text-[15px] leading-[22px] text-[var(--color-muted)]">
                <li className="flex gap-3">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-terracota)]"
                    aria-hidden="true"
                  />
                  Revisamos cada propuesta con calma; enviarla no implica
                  aceptación.
                </li>
                <li className="flex gap-3">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-terracota)]"
                    aria-hidden="true"
                  />
                  Si tu proyecto avanza, te escribimos para conocer tus
                  productos.
                </li>
                <li className="flex gap-3">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-terracota)]"
                    aria-hidden="true"
                  />
                  El acuerdo de consignación se firma solo después de aprobar tu
                  propuesta.
                </li>
              </ul>
            </ScrollReveal>
          </div>
          <div className="relative rounded-[28px] md:rounded-[36px] bg-white/60 border border-[var(--color-border)] p-6 md:p-10">
            <PostulacionCreadores />
          </div>
        </div>
      </section>

      {/* 7 · CTA final */}
      <section
        aria-labelledby="final-titulo"
        className="w-[90%] mx-auto pt-6 pb-6 md:pb-8"
      >
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-[32px] md:rounded-[48px] bg-[var(--color-rosa-papel)] px-7 py-14 md:px-16 md:py-20 flex flex-col items-center text-center">
            <h2
              id="final-titulo"
              className="font-serif italic text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[1.05] text-[var(--color-cacao)] mb-4 max-w-2xl"
            >
              Grandes ideas merecen ser compartidas.
            </h2>
            <p className="font-sans text-[18px] leading-[27px] text-[var(--color-cacao)]/90 max-w-xl mb-9">
              Queremos que más personas descubran lo que haces. Tal vez tu
              próxima gran oportunidad empiece en una pequeña repisa de Papela.
            </p>
            <Cta href="#postula" variante="verde">
              Postula tu proyecto
            </Cta>
            <p className="mt-12 font-serif italic text-[22px] md:text-[26px] text-[var(--color-cacao)]">
              Lo que imaginas comienza aquí.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* 8 · Preguntas frecuentes (mismo acordeón <details> que la Tarjeta de Lealtad) */}
      <section
        aria-labelledby="faq-titulo"
        className="w-[90%] mx-auto pt-12 pb-16 md:pt-16 md:pb-24 grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-8 lg:gap-16"
      >
        <ScrollReveal>
          <p className="label text-[var(--color-terracota)] mb-3">Dudas</p>
          <h2
            id="faq-titulo"
            className="font-serif font-extralight text-[#403C3C] text-[clamp(2rem,4vw,3.25rem)] leading-[1.1]"
          >
            Preguntas frecuentes
          </h2>
        </ScrollReveal>
        <div className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
          {PREGUNTAS.map((q) => (
            <details key={q.p} className="group py-5">
              <summary className="flex min-h-11 items-center justify-between gap-4 cursor-pointer list-none rounded-lg [&::-webkit-details-marker]:hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-verde)]">
                <span className="font-serif italic text-[22px] leading-tight text-[#403C3C]">
                  {q.p}
                </span>
                <ChevronDownIcon
                  className="w-5 h-5 shrink-0 text-[var(--color-verde)] transition-transform duration-300 group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="font-sans text-[16px] leading-[24px] text-[var(--color-muted)] mt-3 max-w-2xl">
                {q.r}
              </p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
