import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import {
  BookOpenIcon,
  PencilIcon,
  SwatchIcon,
  PaintBrushIcon,
  BeakerIcon,
  ArchiveBoxIcon,
  ShoppingBagIcon,
  FolderIcon,
  RectangleStackIcon,
  ScissorsIcon,
  BriefcaseIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import HeroSection from "@/components/site/HeroSection";
import ScrollReveal from "@/components/site/ScrollReveal";

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: "Back to School — Etiquetas escolares personalizadas | Papela Atelier" },
  description:
    "Etiquetas escolares personalizadas para el regreso a clases: libretas, lápices, colores, termos, loncheras y mochilas. Diseño a la medida, materiales resistentes y paquetes desde $220. Recoge en Papela Atelier, Puebla.",
  alternates: { canonical: "https://www.papela-atelier.com/back-to-school" },
  openGraph: {
    title: "Back to School — Etiquetas escolares personalizadas | Papela Atelier",
    description:
      "Organiza los útiles de tus peques con etiquetas bonitas, resistentes y hechas a la medida. Paquetes desde $220.",
    images: [{ url: "/images/back-to-school/hero.jpg", alt: "Etiquetas escolares personalizadas Papela Atelier" }],
  },
};

// WhatsApp de Papela con mensaje precargado por CTA.
const WA = "522211865590";
const wa = (msg: string) => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;

const MSG_HERO =
  "Hola Papela, me interesan las etiquetas escolares Back to School. ¿Me pueden ayudar con más información?";
const MSG_ARMA =
  "Hola Papela, quiero armar mi propio paquete de etiquetas escolares Back to School. ¿Me ayudan a cotizar?";
const MSG_FINAL =
  "Hola Papela, me interesan las etiquetas escolares Back to School. ¿Me pueden ayudar a elegir un paquete?";

// ── Datos ──────────────────────────────────────────────────────────────────

// Todo lo que incluye cualquier paquete.
const INCLUYE_TODOS = [
  "5 etiquetas de 5 cm contra agua en DTF (termo, lonchera, botellas, plásticos y acrílico)",
  "Diseño 100% personalizado con nombre, colores y temática",
  "Tarjeta de lealtad con coleccionables — ¡todos tienen premio!",
];

const PAQUETES = [
  {
    nombre: "Paquete Básico",
    precio: 220,
    ideal: "Para marcar lo esencial con muy buena calidad.",
    material: "Papel fotográfico autoadherible de alta calidad (no contra agua)",
    destacado: false,
    contenido: [
      "54 etiquetas para lápices · 2.7 × 5 cm",
      "10 etiquetas para libros y cuadernos · 8 × 4.5 cm",
      "12 etiquetas multiusos · 6 × 4 cm",
      "15 etiquetas redondas · 5 cm",
    ],
    msg: "Hola Papela, me interesa el Paquete Básico ($220) de etiquetas escolares Back to School. ¿Me pueden compartir más información?",
  },
  {
    nombre: "Paquete Back to School",
    precio: 320,
    ideal: "Para dejar todo listo desde el inicio del ciclo escolar.",
    material: "Papel adhesivo waterproof, resistente al agua (no DTF)",
    destacado: true,
    contenido: [
      "81 etiquetas para lápices · 2.7 × 5 cm",
      "20 etiquetas para libros y cuadernos · 8 × 4.5 cm",
      "6 etiquetas grandes de siluetas · 10 × 5 cm",
      "12 etiquetas multiusos · 6 × 4 cm",
      "15 etiquetas redondas · 5 cm",
    ],
    msg: "Hola Papela, me interesa el Paquete Back to School ($320) de etiquetas escolares. ¿Me pueden compartir más información?",
  },
];

// "Arma tu paquete" — planillas sueltas.
const PLANILLAS = [
  { nombre: "Etiquetas para lápices", medida: "2.7 × 5 cm", cantidad: "Planilla de 27", precio: 40 },
  { nombre: "Libros y cuadernos", medida: "8 × 4.5 cm", cantidad: "Planilla de 10", precio: 40 },
  { nombre: "Etiquetas minis", medida: "2.4 × 2.1 cm", cantidad: "Planilla de 66", precio: 40 },
  { nombre: "Grandes de siluetas", medida: "10 × 5 cm", cantidad: "Planilla de 6", precio: 40 },
  { nombre: "Circulares", medida: "5 cm", cantidad: "Planilla de 15", precio: 40 },
  { nombre: "Multiusos", medida: "6 × 4 cm", cantidad: "Planilla de 12", precio: 40 },
  { nombre: "DTF contra agua", medida: "Termos, toppers, estucheras", cantidad: "Planilla 20 × 30", precio: 140 },
  { nombre: "DTF textil", medida: "Para ropa", cantidad: "Planilla 20 × 30", precio: 150 },
];

const BORDADOS = [
  { nombre: "Nombre bordado", precio: 50 },
  { nombre: "Escudo escolar", precio: 60 },
  { nombre: "Bordado de la mochila", precio: 50 },
];

const ACABADOS = [
  { nombre: "Papel holográfico", precio: "+$60" },
  { nombre: "Tornasol", precio: "+$140" },
];

// "¿Dónde las puedes usar?" — se rota la paleta pastel de la marca.
const USOS = [
  { label: "Libretas", Icon: BookOpenIcon },
  { label: "Lápices", Icon: PencilIcon },
  { label: "Colores", Icon: SwatchIcon },
  { label: "Plumones", Icon: PaintBrushIcon },
  { label: "Termos", Icon: BeakerIcon },
  { label: "Loncheras", Icon: ArchiveBoxIcon },
  { label: "Mochilas", Icon: ShoppingBagIcon },
  { label: "Carpetas", Icon: FolderIcon },
  { label: "Reglas", Icon: RectangleStackIcon },
  { label: "Tijeras", Icon: ScissorsIcon },
  { label: "Estuches", Icon: BriefcaseIcon },
  { label: "Material extra", Icon: Squares2X2Icon },
];

const USO_COLORS = [
  { bg: "#F0D9CC", text: "#8C482A" },
  { bg: "#C9D3C0", text: "#2f5d4a" },
  { bg: "#CED8D9", text: "#1e4a52" },
  { bg: "#F0E6D0", text: "#946233" },
];

const MATERIALES = [
  {
    titulo: "Papel fotográfico",
    texto:
      "De alta calidad y muy buena adherencia. Ideal para libretas, cuadernos y útiles que no se mojan. Es el material del Paquete Básico.",
  },
  {
    titulo: "Papel waterproof",
    texto:
      "Adhesivo resistente al agua para objetos de uso diario que se limpian seguido. Es el material del Paquete Back to School.",
  },
  {
    titulo: "DTF contra agua",
    texto:
      "Máxima resistencia para superficies rígidas: termos, loncheras, botellas, estucheras, plástico y acrílico. Incluido en todos los paquetes.",
  },
  {
    titulo: "DTF textil y bordados",
    texto:
      "Para marcar ropa y mochilas: etiquetas textiles y bordados de nombre, escudo escolar o la mochilita.",
  },
];

const PASOS = [
  { n: "1", titulo: "Elige tu paquete", texto: "Selecciona la opción que mejor se acomode a tus útiles, o arma el tuyo con planillas sueltas." },
  { n: "2", titulo: "Mándanos los datos", texto: "Compártenos nombre, grado, grupo, colores, temática o referencias." },
  { n: "3", titulo: "Preparamos tu diseño", texto: "Creamos tus etiquetas y revisamos juntos que todo quede perfecto." },
  { n: "4", titulo: "Recoge en Papela", texto: "Te avisamos cuando estén listas para pasar por ellas." },
];

const ESTILOS = [
  "Colorido y divertido", "Tierno y pastel", "Minimalista", "Dinosaurios",
  "Espacio", "Flores", "Animalitos", "Deportes", "Fantasía", "Escolar clásico",
];

const GALERIA = [
  { src: "/images/back-to-school/libretas.jpg", alt: "Etiquetas personalizadas en libretas" },
  { src: "/images/back-to-school/lapices.jpg", alt: "Etiquetas pequeñas en lápices y colores" },
  { src: "/images/back-to-school/termo.jpg", alt: "Etiquetas en termo y lonchera" },
  { src: "/images/back-to-school/planillas.jpg", alt: "Planillas de etiquetas organizadas por tamaño" },
];

const FAQ = [
  {
    q: "¿Las etiquetas son resistentes al agua?",
    a: "Depende del material. Para termos, loncheras y botellas usamos DTF contra agua o papel waterproof, con mayor resistencia al uso y a la limpieza. El papel fotográfico del Paquete Básico no es contra agua.",
  },
  {
    q: "¿Puedo elegir colores o temática?",
    a: "Sí. Compártenos colores, personajes, referencias o el estilo que te gustaría y te ayudamos a crear una propuesta bonita.",
  },
  {
    q: "¿Puedo pedir etiquetas con nombre y grado?",
    a: "Claro. Podemos agregar nombre, apellido, grado, grupo o cualquier dato corto que necesites.",
  },
  {
    q: "¿Sirven para lápices y colores?",
    a: "Sí. Tenemos etiquetas pequeñas y alargadas (2.7 × 5 cm) pensadas justo para lápices, colores, plumones y materiales delgados.",
  },
  {
    q: "¿Puedo armar un paquete diferente?",
    a: "Sí. Puedes comprar planillas sueltas por tamaño, agregar bordados o acabados especiales como papel holográfico o tornasol, y armar el paquete a tu medida.",
  },
  {
    q: "¿Cuánto tardan en estar listas?",
    a: "El tiempo varía según la cantidad y el nivel de personalización. Confirmamos el tiempo estimado por WhatsApp al momento de hacer tu pedido.",
  },
  {
    q: "¿Dónde puedo recoger mi pedido?",
    a: "En Papela Atelier, en Lomas de Angelópolis, Puebla.",
  },
];

// ── UI helpers ───────────────────────────────────────────────────────────────

function CtaMeInteresa({
  msg,
  variant = "solid",
  label = "Me interesa",
}: {
  msg: string;
  variant?: "solid" | "outline";
  label?: string;
}) {
  if (variant === "outline") {
    return (
      <a
        href={wa(msg)}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-[var(--color-verde)] px-6 py-3 font-sans text-[15px] font-semibold text-[var(--color-verde)] transition-colors duration-500 hover:text-[var(--color-cremita)]"
        style={{ isolation: "isolate" }}
      >
        <span className="absolute inset-0 -z-10 origin-left scale-x-0 bg-[var(--color-verde)] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-x-100" />
        {label}
        <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
      </a>
    );
  }
  return (
    <a
      href={wa(msg)}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[var(--color-verde)] px-7 py-3.5 font-sans text-[15px] font-semibold text-[var(--color-cremita)]"
      style={{ isolation: "isolate" }}
    >
      <span className="absolute inset-0 -z-10 origin-left scale-x-0 bg-[#0d3f46] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-x-100" />
      {label}
      <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
    </a>
  );
}

// Contenedor de imagen con tinte de fondo: si el placeholder aún no existe,
// se ve un bloque pastel agradable en lugar de un ícono de imagen rota.
function FotoPlaceholder({
  src,
  alt,
  tint,
  className = "",
  sizes,
}: {
  src: string;
  alt: string;
  tint: string;
  className?: string;
  sizes?: string;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ backgroundColor: tint }}>
      <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
    </div>
  );
}

// ── Página ─────────────────────────────────────────────────────────────────

export default function BackToSchoolPage() {
  return (
    <>
      {/* 1 · Hero */}
      <HeroSection bgColor="#D0717B">
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 md:px-20 pt-[140px] md:pt-[180px] pb-16 md:pb-20">
          <span data-hero-badge className="inline-flex items-center border border-[var(--color-cremita)]/40 rounded-full px-5 py-2 mb-8">
            <span className="label text-[var(--color-cremita)]/70">Back to School</span>
          </span>
          <h1 className="font-serif italic text-[clamp(2.5rem,5.5vw,5rem)] leading-[1.05] text-[var(--color-cremita)] max-w-3xl mb-6">
            Etiquetas escolares personalizadas para este regreso a clases
          </h1>
          <p className="font-sans text-[var(--color-cremita)]/90 text-[18px] leading-[26px] max-w-xl mb-9">
            Organiza los útiles de tus peques con etiquetas bonitas, resistentes y hechas a la medida. Ideales para libretas, lápices, colores, termos, loncheras, mochilas y todo lo que necesitan para volver a clases con estilo.
          </p>
          <CtaMeInteresa msg={MSG_HERO} />
        </div>
      </HeroSection>

      {/* 2 · Intro — Todo marcado, todo más fácil */}
      <section className="w-[90%] mx-auto py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <ScrollReveal direction="left">
            <div className="max-w-md">
              <p className="label text-[var(--color-terracota)] mb-4">Todo marcado, todo más fácil</p>
              <h2 className="font-serif font-extralight text-[#403C3C] text-[clamp(2rem,4.2vw,3.2rem)] leading-tight mb-6">
                Que nada se pierda este ciclo escolar
              </h2>
              <p className="font-sans text-[17px] leading-[28px] text-[var(--color-muted)] mb-4">
                Las etiquetas escolares ayudan a que los niños identifiquen sus cosas y a que sea más fácil recuperar útiles, loncheras, termos, colores, libretas y materiales durante todo el año.
              </p>
              <p className="font-sans text-[17px] leading-[28px] text-[var(--color-muted)]">
                En Papela las hacemos con nombre, grado, grupo, personaje, colores o el estilo que quieras: diseños tiernos, divertidos, coloridos o minimalistas, según la personalidad de cada niño.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <FotoPlaceholder
              src="/images/back-to-school/intro.jpg"
              alt="Etiquetas escolares aplicadas en libretas, lápices y termo"
              tint="#F0D9CC"
              className="aspect-[4/3] w-full rounded-[28px]"
              sizes="(max-width: 1024px) 90vw, 45vw"
            />
          </ScrollReveal>
        </div>
      </section>

      {/* 3 · ¿Dónde las puedes usar? */}
      <section className="w-[90%] mx-auto py-16 md:py-20">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="label text-[var(--color-terracota)] mb-4">¿Dónde las puedes usar?</p>
            <h2 className="font-serif font-extralight text-[#403C3C] text-[clamp(2rem,4vw,3rem)] leading-tight">
              Perfectas para marcar todo lo de la escuela
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {USOS.map((uso, i) => {
            const color = USO_COLORS[i % USO_COLORS.length];
            const Icon = uso.Icon;
            return (
              <ScrollReveal key={uso.label} delay={(i % 6) * 0.05}>
                <div className="flex h-full flex-col items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-white/60 p-5 text-center transition-transform duration-300 hover:-translate-y-1">
                  <span
                    className="flex h-14 w-14 items-center justify-center rounded-full"
                    style={{ backgroundColor: color.bg, color: color.text }}
                  >
                    <Icon className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <span className="font-sans text-[14px] font-medium text-[#403C3C]">{uso.label}</span>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* 4 · Materiales */}
      <section className="w-[90%] mx-auto py-16 md:py-20">
        <ScrollReveal>
          <div className="max-w-2xl mb-12">
            <p className="label text-[var(--color-terracota)] mb-4">Materiales</p>
            <h2 className="font-serif font-extralight text-[#403C3C] text-[clamp(2rem,4vw,3rem)] leading-tight mb-4">
              Elige el material ideal para cada uso
            </h2>
            <p className="font-sans text-[17px] leading-[26px] text-[var(--color-muted)]">
              Tenemos distintos materiales para que tus etiquetas se adapten mejor a cada superficie. Te ayudamos a elegir la mejor opción según dónde las quieras pegar.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {MATERIALES.map((mat, i) => (
            <ScrollReveal key={mat.titulo} delay={i * 0.06}>
              <article className="flex h-full flex-col gap-3 rounded-2xl border-2 border-[#CED8D9] bg-[#e2ebec] p-7">
                <span className="font-sans text-[13px] font-bold tracking-[2px] text-[#1e4a52]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-serif italic text-[22px] leading-[28px] text-[#1e2d36]">{mat.titulo}</h3>
                <p className="font-sans text-[15px] leading-[24px] text-[#4a5b62]">{mat.texto}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>

        <p className="mt-6 rounded-2xl bg-[var(--color-cremita-3)] border border-[var(--color-border)] px-6 py-4 font-sans text-[15px] leading-[24px] text-[var(--color-muted)]">
          ¿No sabes qué material elegir? Escríbenos y te recomendamos la mejor opción según tus útiles.
        </p>
      </section>

      {/* 5 · Paquetes */}
      <section className="w-[90%] mx-auto py-16 md:py-24">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-6">
            <p className="label text-[var(--color-terracota)] mb-4">Paquetes Back to School</p>
            <h2 className="font-serif font-extralight text-[#403C3C] text-[clamp(2rem,4vw,3rem)] leading-tight mb-4">
              Elige el que mejor se acomode a lo que necesitas
            </h2>
            <p className="font-sans text-[17px] leading-[26px] text-[var(--color-muted)]">
              Todos se personalizan con nombre, colores y estilo visual.
            </p>
          </div>
        </ScrollReveal>

        {/* Todos los paquetes incluyen */}
        <ScrollReveal>
          <div className="mx-auto max-w-4xl rounded-2xl bg-[var(--color-verde)] px-6 py-6 md:px-10 md:py-7 mb-10">
            <p className="label text-[var(--color-cremita)]/70 mb-4 text-center">Todos los paquetes incluyen</p>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {INCLUYE_TODOS.map((item) => (
                <li key={item} className="flex items-start gap-2.5 font-sans text-[14px] leading-[21px] text-[var(--color-cremita)]">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-cremita)]/80" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </ScrollReveal>

        {/* Las dos tarjetas de paquete */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {PAQUETES.map((paq, i) => {
            const dark = paq.destacado;
            return (
              <ScrollReveal key={paq.nombre} delay={i * 0.08}>
                <article
                  className={`relative flex h-full flex-col rounded-[28px] p-8 md:p-9 ${
                    dark
                      ? "bg-[var(--color-verde)] text-[var(--color-cremita)]"
                      : "bg-[var(--color-cremita-3)] border-2 border-[var(--color-border)] text-[#403C3C]"
                  }`}
                >
                  {dark && (
                    <span className="absolute right-6 top-7 rounded-full bg-[var(--color-cremita)] px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-widest text-[var(--color-verde)]">
                      Más completo
                    </span>
                  )}
                  <h3 className={`font-serif italic text-[26px] leading-[32px] ${dark ? "" : "text-[#403C3C]"}`}>
                    {paq.nombre}
                  </h3>
                  <p className={`mt-2 font-sans text-[14px] leading-[21px] ${dark ? "text-[var(--color-cremita)]/80" : "text-[var(--color-muted)]"}`}>
                    {paq.ideal}
                  </p>

                  <div className="my-6 flex items-end gap-1">
                    <span className="font-serif font-extralight text-[44px] leading-none">${paq.precio}</span>
                    <span className={`mb-1 font-sans text-[13px] ${dark ? "text-[var(--color-cremita)]/70" : "text-[var(--color-muted)]"}`}>MXN</span>
                  </div>

                  <p className={`mb-5 rounded-xl px-4 py-3 font-sans text-[13px] leading-[19px] ${dark ? "bg-white/10 text-[var(--color-cremita)]/90" : "bg-white/70 text-[var(--color-muted)]"}`}>
                    <span className="font-semibold">Material:</span> {paq.material}
                  </p>

                  <ul className="flex flex-1 flex-col gap-3 mb-8">
                    {paq.contenido.map((linea) => (
                      <li key={linea} className="flex items-start gap-2.5 font-sans text-[14px] leading-[21px]">
                        <CheckCircleIcon className={`mt-0.5 h-5 w-5 shrink-0 ${dark ? "text-[var(--color-cremita)]/80" : "text-[var(--color-verde)]"}`} aria-hidden="true" />
                        {linea}
                      </li>
                    ))}
                  </ul>

                  {dark ? (
                    <a
                      href={wa(paq.msg)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-cremita)] px-7 py-3.5 font-sans text-[15px] font-semibold text-[var(--color-verde)] transition-opacity hover:opacity-90"
                    >
                      Me interesa
                      <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                    </a>
                  ) : (
                    <CtaMeInteresa msg={paq.msg} variant="outline" />
                  )}
                </article>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* 6 · Arma tu paquete */}
      <section className="w-[90%] mx-auto py-16 md:py-20">
        <ScrollReveal>
          <div className="max-w-2xl mb-10">
            <p className="label text-[var(--color-terracota)] mb-4">Arma tu paquete</p>
            <h2 className="font-serif font-extralight text-[#403C3C] text-[clamp(2rem,4vw,3rem)] leading-tight mb-4">
              ¿Necesitas otra cantidad o tamaño?
            </h2>
            <p className="font-sans text-[17px] leading-[26px] text-[var(--color-muted)]">
              Compra planillas sueltas por tamaño y arma el paquete a tu medida. Combínalas con bordados y acabados especiales.
            </p>
          </div>
        </ScrollReveal>

        {/* Planillas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {PLANILLAS.map((p, i) => (
            <ScrollReveal key={p.nombre} delay={(i % 4) * 0.05}>
              <div className="flex h-full flex-col justify-between gap-4 rounded-2xl border border-[var(--color-border)] bg-white/70 p-6">
                <div>
                  <h3 className="font-serif italic text-[19px] leading-[24px] text-[#403C3C]">{p.nombre}</h3>
                  <p className="mt-1 font-sans text-[13px] text-[var(--color-muted)]">{p.medida}</p>
                  <p className="mt-3 font-sans text-[12px] font-semibold uppercase tracking-widest text-[var(--color-terracota)]">{p.cantidad}</p>
                </div>
                <span className="font-serif font-extralight text-[28px] leading-none text-[var(--color-verde)]">${p.precio}</span>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Bordados + Acabados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ScrollReveal>
            <div className="rounded-2xl border-2 border-[#C9D3C0] bg-[#dde5d5] p-7">
              <h3 className="font-serif italic text-[22px] text-[#2f5d4a] mb-5">Bordados por pieza</h3>
              <ul className="flex flex-col divide-y divide-[#c2d0b8]">
                {BORDADOS.map((b) => (
                  <li key={b.nombre} className="flex items-center justify-between py-3 font-sans text-[15px] text-[#3a4a3a]">
                    <span>{b.nombre}</span>
                    <span className="font-semibold text-[#2f5d4a]">${b.precio}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <div className="rounded-2xl border-2 border-[#F0D9CC] bg-[#f6e3d9] p-7">
              <h3 className="font-serif italic text-[22px] text-[#8C482A] mb-2 flex items-center gap-2">
                <SparklesIcon className="h-5 w-5" aria-hidden="true" /> Acabados especiales
              </h3>
              <p className="font-sans text-[14px] text-[#8a5a44] mb-4">Dale un toque extra a cualquier etiqueta.</p>
              <ul className="flex flex-col divide-y divide-[#e6c9bb]">
                {ACABADOS.map((a) => (
                  <li key={a.nombre} className="flex items-center justify-between py-3 font-sans text-[15px] text-[#7a4632]">
                    <span>{a.nombre}</span>
                    <span className="font-semibold text-[#8C482A]">{a.precio}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>

        <div className="mt-10 flex justify-center">
          <CtaMeInteresa msg={MSG_ARMA} label="Arma tu paquete" />
        </div>
      </section>

      {/* 7 · Así funciona */}
      <section className="w-[90%] mx-auto py-16 md:py-20">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="label text-[var(--color-terracota)] mb-4">Así funciona</p>
            <h2 className="font-serif font-extralight text-[#403C3C] text-[clamp(2rem,4vw,3rem)] leading-tight">
              Pedir tus etiquetas es muy fácil
            </h2>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PASOS.map((paso, i) => (
            <ScrollReveal key={paso.n} delay={i * 0.06}>
              <div className="flex h-full flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-white/60 p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-verde)] font-serif text-[20px] text-[var(--color-cremita)]">
                  {paso.n}
                </span>
                <h3 className="font-serif italic text-[20px] text-[#403C3C]">{paso.titulo}</h3>
                <p className="font-sans text-[15px] leading-[24px] text-[var(--color-muted)]">{paso.texto}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* 8 · Personalización visual */}
      <section className="w-[90%] mx-auto py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <ScrollReveal direction="left">
            <div className="max-w-md">
              <p className="label text-[var(--color-terracota)] mb-4">Diseño a la medida</p>
              <h2 className="font-serif italic text-[#403C3C] text-[clamp(2.2rem,4.5vw,3.4rem)] leading-[1.1] mb-6">
                Diseños tan únicos como tus peques
              </h2>
              <p className="font-sans text-[17px] leading-[28px] text-[var(--color-muted)] mb-6">
                Adaptamos las etiquetas al estilo de cada niño: colores favoritos, personajes, temas escolares, animalitos, flores, dinosaurios, espacio, deportes, arcoíris o estilos minimalistas. La idea es que sus útiles se vean bonitos, ordenados y fáciles de identificar.
              </p>
              <div className="flex flex-wrap gap-2.5">
                {ESTILOS.map((e, i) => {
                  const color = USO_COLORS[i % USO_COLORS.length];
                  return (
                    <span
                      key={e}
                      className="rounded-full px-4 py-2 font-sans text-[14px]"
                      style={{ backgroundColor: color.bg, color: color.text }}
                    >
                      {e}
                    </span>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <FotoPlaceholder
              src="/images/back-to-school/estilos.jpg"
              alt="Estilos de etiquetas escolares personalizadas"
              tint="#C9D3C0"
              className="aspect-[4/3] w-full rounded-[28px]"
              sizes="(max-width: 1024px) 90vw, 45vw"
            />
          </ScrollReveal>
        </div>
      </section>

      {/* 9 · Galería */}
      <section className="w-[90%] mx-auto py-16 md:py-20">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="label text-[var(--color-terracota)] mb-4">Galería</p>
            <h2 className="font-serif font-extralight text-[#403C3C] text-[clamp(2rem,4vw,3rem)] leading-tight">
              Así se ven en la vida real
            </h2>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {GALERIA.map((img, i) => (
            <ScrollReveal key={img.src} delay={(i % 4) * 0.05}>
              <FotoPlaceholder
                src={img.src}
                alt={img.alt}
                tint={USO_COLORS[i % USO_COLORS.length].bg}
                className="aspect-square w-full rounded-2xl"
                sizes="(max-width: 1024px) 45vw, 22vw"
              />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* 10 · FAQ */}
      <section className="w-[90%] mx-auto py-16 md:py-20">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="label text-[var(--color-terracota)] mb-4">Preguntas frecuentes</p>
            <h2 className="font-serif font-extralight text-[#403C3C] text-[clamp(2rem,4vw,3rem)] leading-tight">
              Lo que suelen preguntarnos
            </h2>
          </div>
        </ScrollReveal>
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-[var(--color-border)] bg-white/60 px-6 py-5 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-serif text-[18px] italic text-[#403C3C]">
                {item.q}
                <ArrowRightIcon className="h-4 w-4 shrink-0 text-[var(--color-verde)] transition-transform duration-300 group-open:rotate-90" aria-hidden="true" />
              </summary>
              <p className="mt-3 font-sans text-[15px] leading-[25px] text-[var(--color-muted)]">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* 11 · CTA final */}
      <section className="w-[90%] mx-auto pb-24 pt-4">
        <div className="relative overflow-hidden rounded-[32px] bg-[#C08A4A] px-8 py-14 md:px-16 md:py-20 text-center">
          <h2 className="font-serif italic text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.1] text-[var(--color-cremita)] max-w-2xl mx-auto mb-5">
            ¿Listos para marcar todo este regreso a clases?
          </h2>
          <p className="font-sans text-[var(--color-cremita)]/90 text-[17px] leading-[26px] max-w-xl mx-auto mb-9">
            Elige tu paquete y escríbenos por WhatsApp. Te ayudamos a crear etiquetas bonitas, prácticas y personalizadas para que todo esté listo antes de volver a clases.
          </p>
          <div className="flex justify-center">
            <a
              href={wa(MSG_FINAL)}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-[var(--color-verde)] px-8 py-4 font-sans text-[16px] font-semibold text-[var(--color-cremita)] transition-opacity hover:opacity-90"
            >
              Me interesa
              <ArrowRightIcon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
