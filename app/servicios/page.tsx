import type { Metadata } from "next";
import HeroSection from "@/components/site/HeroSection";
import {
  PrinterIcon,
  DocumentDuplicateIcon,
  ScissorsIcon,
  SwatchIcon,
  SparklesIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  QrCodeIcon,
  IdentificationIcon,
  MegaphoneIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  RocketLaunchIcon,
  BuildingStorefrontIcon,
  LightBulbIcon,
  CheckIcon,
  ArrowRightIcon,
  MapPinIcon,
} from "@heroicons/react/24/solid";

export const revalidate = 60;

const WHATSAPP = "522211865590";
const wa = (msg: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
const MAPS = "https://maps.google.com/?q=Papela+Atelier+Lomas+de+Angel%C3%B3polis+Puebla";

export const metadata: Metadata = {
  title: { absolute: "Servicios de impresión y diseño en Puebla — Papela Atelier" },
  description:
    "Impresión, escaneo, acabados y servicios profesionales de diseño en Puebla: branding, logotipos, páginas web, menús, presentaciones y papelería corporativa. Cotiza tu proyecto en Papela Atelier.",
  alternates: { canonical: "https://www.papela-atelier.com/servicios" },
  openGraph: {
    title: "Servicios de impresión y diseño — Papela Atelier",
    description:
      "De la impresión y el escaneo a branding, logotipos, páginas web y menús. Te acompañamos de la idea al resultado final.",
    images: [{ url: "/images/og-papela.jpg", alt: "Servicios Papela Atelier" }],
  },
};

function WaGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
    </svg>
  );
}

const MODULOS = [
  {
    icon: PrinterIcon,
    titulo: "Impresión",
    texto:
      "Impresiones para escuela, trabajo, negocio y proyectos personales, con diferentes formatos y tipos de papel.",
    items: [
      "Blanco y negro",
      "Color",
      "Tamaño carta",
      "Tamaño oficio",
      "Tamaño tabloide",
      "Papel bond",
      "Opalina",
      "Papel fotográfico",
      "Papel texturizado",
      "Posters",
      "Documentos para negocio",
      "Proyectos escolares",
      "Materiales de oficina",
    ],
  },
  {
    icon: DocumentDuplicateIcon,
    titulo: "Escaneo y copias",
    texto: "Servicios rápidos y prácticos para digitalizar, duplicar y organizar tus documentos.",
    items: [
      "Copias",
      "Escaneo de documentos",
      "Digitalización de archivos",
      "Preparación básica de documentos",
      "Organización de archivos impresos o digitales",
    ],
  },
  {
    icon: ScissorsIcon,
    titulo: "Acabados y presentación",
    texto:
      "Dale una mejor presentación a tus documentos, tareas, reportes, manuales, catálogos o entregas profesionales.",
    items: [
      "Engargolado",
      "Enmicado",
      "Corte",
      "Armado de documentos",
      "Presentaciones escolares",
      "Presentaciones profesionales",
      "Reportes",
      "Catálogos",
      "Manuales",
      "Propuestas impresas",
    ],
  },
];

const DISENO = [
  {
    icon: SwatchIcon,
    titulo: "Branding",
    texto: "Creamos identidades visuales para negocios, proyectos y emprendedores.",
    items: [
      "Identidad visual",
      "Dirección visual",
      "Paleta de color",
      "Selección tipográfica",
      "Guía básica de marca",
      "Aplicaciones de marca",
    ],
  },
  {
    icon: SparklesIcon,
    titulo: "Diseño de logotipo",
    texto:
      "Logotipos personalizados que se sienten claros, profesionales y alineados con la personalidad de cada marca.",
    items: [
      "Concepto de logotipo",
      "Variaciones de logo",
      "Ícono o símbolo",
      "Versiones de color",
      "Guía básica de uso",
    ],
  },
  {
    icon: GlobeAltIcon,
    titulo: "Páginas web",
    texto:
      "Páginas web y landing pages para negocios locales, marcas personales, servicios profesionales y proyectos creativos.",
    items: [
      "Diseño de página web",
      "Landing pages",
      "Sitios para negocios",
      "Portafolios",
      "Páginas para eventos",
      "Estructura de contenido",
      "Experiencia de usuario",
      "Listo para Framer, Webflow y similares",
    ],
  },
  {
    icon: DevicePhoneMobileIcon,
    titulo: "Aplicaciones y productos digitales",
    texto:
      "Experiencias digitales claras, funcionales y fáciles de usar para apps móviles, plataformas y productos web.",
    items: [
      "Diseño UI",
      "Diseño UX",
      "Flujos de usuario",
      "Wireframes",
      "Prototipos interactivos",
      "Pantallas para app móvil",
      "Pantallas para web app",
      "Design systems",
    ],
  },
  {
    icon: QrCodeIcon,
    titulo: "Menús",
    texto: "Menús para restaurantes, cafeterías, reposterías y negocios de comida.",
    items: [
      "Menús impresos",
      "Menús digitales",
      "Menús con QR",
      "Rediseño de menú",
      "Organización de contenido",
      "Dirección visual gastronómica",
    ],
  },
  {
    icon: IdentificationIcon,
    titulo: "Tarjetas y papelería corporativa",
    texto: "Materiales profesionales para marcas, negocios y profesionistas.",
    items: [
      "Tarjetas de presentación",
      "Hojas membretadas",
      "Papelería corporativa",
      "Firmas de correo",
      "Plantillas para presentaciones",
      "Tarjetas de agradecimiento",
    ],
  },
  {
    icon: MegaphoneIcon,
    titulo: "Material promocional",
    texto: "Piezas visuales para comunicar servicios, productos, lanzamientos, promociones y eventos.",
    items: [
      "Flyers",
      "Posters",
      "Brochures",
      "Catálogos",
      "Presentaciones comerciales",
      "Plantillas para redes sociales",
      "Material para punto de venta",
    ],
  },
];

const EJEMPLOS = [
  "Diseñar e imprimir tarjetas de presentación",
  "Crear un logotipo e identidad visual",
  "Diseñar un menú para restaurante o cafetería",
  "Preparar una presentación profesional",
  "Diseñar un flyer o poster",
  "Crear una landing page para un servicio",
  "Diseñar una página web para un negocio local",
  "Imprimir y engargolar un proyecto final",
  "Preparar materiales para escuela, trabajo o negocio",
];

const AUDIENCIAS = [
  {
    icon: AcademicCapIcon,
    titulo: "Estudiantes",
    texto:
      "Impresiones, escaneos, engargolados, proyectos escolares, presentaciones y entregas finales.",
  },
  {
    icon: BriefcaseIcon,
    titulo: "Profesionistas",
    texto:
      "Documentos, presentaciones, propuestas, tarjetas, materiales impresos y entregables bien presentados.",
  },
  {
    icon: RocketLaunchIcon,
    titulo: "Emprendedores",
    texto:
      "Branding, logotipos, tarjetas de presentación, menús, páginas web, redes sociales y material promocional.",
  },
  {
    icon: BuildingStorefrontIcon,
    titulo: "Negocios locales",
    texto:
      "Diseño, impresión, menús, identidad visual, presencia digital y materiales para atención al cliente.",
  },
  {
    icon: LightBulbIcon,
    titulo: "Proyectos creativos",
    texto:
      "Apoyo para ideas que necesitan diseño, estructura, impresión o una presentación más profesional.",
  },
];

const PASOS = [
  {
    n: "1",
    titulo: "Cuéntanos qué necesitas",
    texto: "Puedes enviarnos tu archivo, idea, referencia o detalles del proyecto.",
  },
  {
    n: "2",
    titulo: "Te orientamos",
    texto:
      "Te ayudamos a elegir el formato, material, tamaño, acabado o solución de diseño que mejor funcione.",
  },
  {
    n: "3",
    titulo: "Diseñamos, imprimimos o preparamos",
    texto:
      "Creamos el diseño, preparamos el archivo, imprimimos, escaneamos, cortamos, engargolamos o armamos tus materiales.",
  },
  {
    n: "4",
    titulo: "Recoge en Papela",
    texto:
      "Cuando tu pedido esté listo, puedes pasar por él a nuestra tienda en Lomas de Angelópolis.",
  },
];

function Chips({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((it) => (
        <li
          key={it}
          className="rounded-full bg-[var(--color-cremita-3)] px-2.5 py-1 font-sans text-[12px] leading-tight text-[var(--color-text)]"
        >
          {it}
        </li>
      ))}
    </ul>
  );
}

export default function ServiciosPage() {
  return (
    <>
      {/* ───────────────── 1 · Hero ───────────────── */}
      <HeroSection>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 md:px-20 pt-[140px] md:pt-[180px] pb-16 md:pb-20">
          <span data-hero-badge className="inline-flex items-center border border-[var(--color-cremita)]/40 rounded-full px-5 py-2 mb-8">
            <span className="label text-[var(--color-cremita)]/70">Servicios Papela</span>
          </span>
          <h1 className="font-serif italic text-[clamp(2.5rem,5.5vw,5rem)] leading-[1.05] text-[var(--color-cremita)] max-w-3xl mb-6">
            Servicios para imprimir, diseñar y darle forma a tus ideas
          </h1>
          <p className="font-sans text-[var(--color-cremita)]/90 text-[18px] leading-[24px] max-w-xl">
            En Papela te ayudamos con servicios prácticos de papelería y soluciones profesionales de
            diseño. Desde impresión, escaneo y acabados para documentos, hasta branding, logotipos,
            páginas web, menús, presentaciones y experiencias digitales.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <a
              href={wa("Hola Papela 🌿 quiero cotizar un servicio.")}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-[var(--color-cremita)] px-7 py-3.5 font-sans text-sm font-semibold text-[var(--color-verde)] transition-opacity hover:opacity-90"
            >
              Cotizar un servicio
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#servicios"
              className="inline-flex items-center rounded-full border border-[var(--color-cremita)]/60 px-7 py-3.5 font-sans text-sm font-semibold text-[var(--color-cremita)] transition-colors hover:bg-[var(--color-cremita)]/10"
            >
              Ver servicios
            </a>
          </div>
        </div>
      </HeroSection>

      {/* ───────────────── 2 · Introducción ───────────────── */}
      <section className="w-[90%] mx-auto py-16 md:py-24 text-center">
        <h2 className="font-serif font-extralight text-[clamp(1.9rem,3.8vw,3.25rem)] text-[#403C3C] leading-tight max-w-3xl mx-auto">
          Todo lo que necesitas para presentar mejor tus ideas
        </h2>
        <div className="mt-6 max-w-2xl mx-auto flex flex-col gap-4">
          <p className="font-sans text-[var(--color-text)] text-[18px] leading-8">
            Ya sea que necesites imprimir un documento, escanear archivos importantes, preparar una
            presentación, diseñar un logotipo, crear un menú o construir una página web, en Papela te
            ayudamos a llevar tu proyecto desde la idea hasta el resultado final.
          </p>
          <p className="font-sans text-[var(--color-muted)] text-[17px] leading-7">
            Combinamos papelería, impresión, diseño y atención personalizada para que cada proyecto
            se vea limpio, profesional y bien cuidado.
          </p>
        </div>
      </section>

      {/* ───────────────── 3 · Módulos de servicios ───────────────── */}
      <section id="servicios" className="w-[90%] mx-auto pb-16 md:pb-24 scroll-mt-28">
        <div className="text-center mb-10 md:mb-12">
          <span className="label text-[var(--color-terracota)]">Papelería e impresión</span>
          <h2 className="font-serif font-extralight text-[clamp(1.8rem,3.5vw,2.75rem)] text-[#403C3C] leading-tight mt-2">
            Servicios prácticos del día a día
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {MODULOS.map(({ icon: Icon, titulo, texto, items }) => (
            <article
              key={titulo}
              className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-6 md:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-cremita-3)]">
                <Icon className="h-6 w-6 text-[var(--color-verde)]" />
              </div>
              <h3 className="font-serif italic text-2xl text-[#403C3C] leading-tight">{titulo}</h3>
              <p className="font-sans text-[15px] leading-7 text-[var(--color-muted)]">{texto}</p>
              <div className="mt-1 pt-4 border-t border-[var(--color-border)]">
                <Chips items={items} />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ───────────────── 4 · Estudio de diseño ───────────────── */}
      <section className="w-[90%] mx-auto pb-16 md:pb-24">
        {/* Banner premium */}
        <div className="rounded-[28px] md:rounded-[40px] bg-[var(--color-verde)] px-8 md:px-16 py-12 md:py-16 text-center">
          <span className="label text-[var(--color-cremita)]/70">Estudio de diseño</span>
          <h2 className="font-serif italic text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.08] text-[var(--color-cremita)] mt-3 max-w-3xl mx-auto">
            Diseño para marcas, negocios e ideas que quieren verse mejor
          </h2>
          <p className="font-sans text-[var(--color-cremita)]/85 text-[17px] leading-8 mt-5 max-w-2xl mx-auto">
            Ofrecemos servicios profesionales de diseño para negocios, emprendedores, eventos y
            proyectos personales. Te ayudamos a crear una identidad visual, ordenar tu contenido y
            diseñar piezas que comuniquen de forma clara, bonita y profesional.
          </p>
        </div>

        {/* Cards de diseño */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mt-6 md:mt-8">
          {DISENO.map(({ icon: Icon, titulo, texto, items }) => (
            <article
              key={titulo}
              className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-6 md:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-verde)]">
                <Icon className="h-6 w-6 text-[var(--color-cremita)]" />
              </div>
              <h3 className="font-serif italic text-2xl text-[#664917] leading-tight">{titulo}</h3>
              <p className="font-sans text-[15px] leading-7 text-[var(--color-muted)]">{texto}</p>
              <div className="mt-1 pt-4 border-t border-[var(--color-border)]">
                <Chips items={items} />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ───────────────── 5 · Del diseño a la entrega ───────────────── */}
      <section className="w-[90%] mx-auto pb-16 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <h2 className="font-serif font-extralight text-[clamp(1.9rem,3.8vw,3rem)] text-[#403C3C] leading-tight">
              Del diseño a la entrega final
            </h2>
            <div className="mt-5 flex flex-col gap-4 max-w-xl">
              <p className="font-sans text-[var(--color-text)] text-[17px] leading-8">
                Una de las ventajas de trabajar con Papela es que podemos acompañarte en distintas
                etapas del proyecto: desde crear el diseño, ordenar la información y definir el estilo
                visual, hasta imprimir, cortar, engargolar o preparar la pieza final.
              </p>
              <p className="font-sans text-[var(--color-muted)] text-[16px] leading-7">
                No necesitas llegar con todo resuelto. Puedes traer una idea, una referencia, un
                archivo o una necesidad específica, y nosotros te ayudamos a darle forma.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-[var(--color-cremita-3)] border border-[var(--color-border)] p-7 md:p-8">
            <p className="label text-[var(--color-terracota)] mb-5">Proyectos que podemos hacer</p>
            <ul className="flex flex-col gap-3">
              {EJEMPLOS.map((e) => (
                <li key={e} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-verde)]">
                    <CheckIcon className="h-3 w-3 text-[var(--color-cremita)]" />
                  </span>
                  <span className="font-sans text-[15.5px] leading-6 text-[var(--color-text)]">{e}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ───────────────── 6 · Para quién son ───────────────── */}
      <section className="w-[90%] mx-auto pb-16 md:pb-24">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="font-serif font-extralight text-[clamp(1.8rem,3.5vw,2.75rem)] text-[#403C3C] leading-tight">
            Servicios para estudiantes, profesionistas y negocios
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {AUDIENCIAS.map(({ icon: Icon, titulo, texto }) => (
            <article
              key={titulo}
              className="flex flex-col gap-3 rounded-2xl bg-[#e7d8cf]/50 border border-[#e3d3c8] p-6"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-cremita)]">
                <Icon className="h-5 w-5 text-[var(--color-terracota)]" />
              </div>
              <h3 className="font-serif italic text-xl text-[#403C3C]">{titulo}</h3>
              <p className="font-sans text-[15px] leading-7 text-[var(--color-muted)]">{texto}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ───────────────── 7 · Cómo funciona ───────────────── */}
      <section className="w-[90%] mx-auto pb-16 md:pb-24">
        <div className="text-center mb-10 md:mb-12">
          <span className="label text-[var(--color-terracota)]">Cómo funciona</span>
          <h2 className="font-serif font-extralight text-[clamp(1.8rem,3.5vw,2.75rem)] text-[#403C3C] leading-tight mt-2">
            Así trabajamos tu proyecto
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {PASOS.map(({ n, titulo, texto }) => (
            <div key={n} className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-white p-6">
              <span className="font-serif text-4xl text-[var(--color-verde)]/30 leading-none">{n}</span>
              <h3 className="font-serif italic text-xl text-[#403C3C] leading-tight">{titulo}</h3>
              <p className="font-sans text-[15px] leading-7 text-[var(--color-muted)]">{texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────── 8 · Cuidamos los detalles ───────────────── */}
      <section className="w-[90%] mx-auto pb-16 md:pb-24">
        <div className="rounded-[28px] md:rounded-[40px] bg-[#e7d8cf] px-8 md:px-16 py-14 md:py-20 text-center">
          <span className="label text-[var(--color-terracota)]">Calidad</span>
          <h2 className="font-serif font-extralight text-[clamp(1.9rem,3.8vw,3rem)] text-[#403C3C] leading-tight mt-2 max-w-2xl mx-auto">
            Cuidamos los detalles
          </h2>
          <div className="mt-5 max-w-2xl mx-auto flex flex-col gap-4">
            <p className="font-sans text-[var(--color-text)] text-[17px] leading-8">
              En Papela, un servicio no se trata solo de imprimir o diseñar. Se trata de que tu
              proyecto se vea claro, limpio, bien presentado y listo para usarse.
            </p>
            <p className="font-sans text-[var(--color-muted)] text-[16px] leading-7">
              Cuidamos la composición, el color, los materiales, las proporciones, los acabados y la
              presentación, porque los pequeños detalles hacen una gran diferencia.
            </p>
          </div>
        </div>
      </section>

      {/* ───────────────── 9 · CTA final ───────────────── */}
      <section className="w-[90%] mx-auto pb-20 md:pb-28">
        <div className="rounded-[28px] md:rounded-[40px] bg-[var(--color-verde)] px-8 md:px-16 py-14 md:py-20 text-center">
          <h2 className="font-serif italic text-[clamp(2.2rem,5vw,3.75rem)] leading-[1.06] text-[var(--color-cremita)] max-w-2xl mx-auto">
            ¿Tienes algo en mente?
          </h2>
          <p className="font-sans text-[var(--color-cremita)]/85 text-[17px] leading-8 mt-5 max-w-2xl mx-auto">
            Cuéntanos qué necesitas y te ayudamos a resolverlo. Puede ser algo rápido como imprimir un
            documento o algo más completo como crear un logotipo, diseñar un menú, preparar tarjetas
            de presentación o construir una página web.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <a
              href={wa("Hola Papela 🌿 tengo un proyecto en mente y quiero cotizarlo.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full bg-[#25D366] px-7 py-3.5 font-sans text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <WaGlyph className="h-5 w-5" />
              Cotizar por WhatsApp
            </a>
            <a
              href={MAPS}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-cremita)]/60 px-7 py-3.5 font-sans text-sm font-semibold text-[var(--color-cremita)] transition-colors hover:bg-[var(--color-cremita)]/10"
            >
              <MapPinIcon className="h-4 w-4" />
              Visítanos en Papela
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
