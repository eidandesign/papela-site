import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRightIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import HeroSection from "@/components/site/HeroSection";
import ScrollReveal from "@/components/site/ScrollReveal";
import BackToSchoolPlane from "@/components/site/BackToSchoolPlane";
import HeroNinosParallax from "@/components/site/HeroNinosParallax";
import BackToSchoolPaquetesTabs from "@/components/site/BackToSchoolPaquetesTabs";
import BackToSchoolAcabadosModal from "@/components/site/BackToSchoolAcabadosModal";
import { CtaMeInteresa, Foto, PaqueteCard, FormatosCard } from "@/components/site/BackToSchoolUI";
import { ACABADOS, BORDADOS, PAQUETES } from "@/lib/back-to-school-data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: "Back to School — Etiquetas escolares personalizadas | Papela Atelier" },
  description:
    "Etiquetas escolares personalizadas para el regreso a clases: libretas, lápices, colores, termos, loncheras y mochilas. Diseño a la medida, materiales resistentes y paquetes desde $220. Recoge en Papela Atelier, Puebla.",
  alternates: { canonical: "https://www.papela-atelier.com/back-to-school" },
  openGraph: {
    title: "Back to School — Etiquetas escolares personalizadas | Papela Atelier",
    description:
      "Todo lo que necesitas en un solo lugar. Etiquetas bonitas, resistentes y hechas a la medida. Paquetes desde $220.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Back to School — Etiquetas escolares personalizadas | Papela Atelier",
    description:
      "Todo lo que necesitas en un solo lugar. Etiquetas bonitas, resistentes y hechas a la medida. Paquetes desde $220.",
  },
};

const MSG_ARMA =
  "Hola Papela, quiero armar mi propio paquete de etiquetas escolares Back to School. ¿Me ayudan a cotizar?";
const MSG_FINAL =
  "Hola Papela, me interesan las etiquetas escolares Back to School. ¿Me pueden ayudar a elegir un paquete?";
const MSG_FORMATOS =
  "Hola Papela, me interesan formatos personalizados de etiquetas escolares Back to School. ¿Me ayudan con las medidas que necesito?";
const MSG_LISTA_UTILES =
  "Hola Papela, me interesa que me ayuden a surtir la lista de útiles escolares completa. ¿Me pueden compartir más información?";

// ── Datos ──────────────────────────────────────────────────────────────────

// "Todos los paquetes incluyen" — 4 columnas.
const INCLUYE = [
  {
    titulo: "Diseño Personalizado",
    texto:
      "Diseño 100% personalizado con nombre, colores y temática. Nuestros diseños son profesionales, creados por diseñadores e ilustradores.",
  },
  {
    titulo: "Material Premium",
    texto:
      "En Papela sabemos el valor y la diferencia de un material que resiste y se ve de calidad; por eso elegimos trabajar con los mejores.",
  },
  {
    titulo: "Etiquetas DTF",
    texto:
      "5 etiquetas de 6 cm contra agua para los materiales que se deben lavar: termos, loncheras, botellas, plásticos y acrílico.",
  },
  {
    titulo: "Recorte silueta",
    texto:
      "El corte de los stickers es sobre la silueta del diseño, dándole un estilo más lindo y vistoso para todas las aplicaciones.",
  },
];

const PASOS = [
  { n: "1", titulo: "Elige tu paquete", texto: "Selecciona la opción que mejor se acomode a tus útiles, o arma el tuyo con planillas sueltas." },
  { n: "2", titulo: "Mándanos los datos", texto: "Compártenos nombre, grado, grupo, colores, temática o referencias." },
  { n: "3", titulo: "Preparamos tu diseño", texto: "Creamos tus etiquetas y revisamos juntos que todo quede perfecto." },
  { n: "4", titulo: "Recoge en Papela", texto: "Te avisamos cuando estén listas para pasar por ellas." },
];

// "Arma tu paquete" — planillas sueltas con imagen.
const PLANILLAS = [
  { nombre: "Etiquetas para lápices", medida: "2.7 × 5 cm", cantidad: "Planilla de 27", precio: 50, imagen: "/images/back-to-school/planilla-lapices.webp", tint: "#F0E6D0" },
  { nombre: "Libros y cuadernos", medida: "8 × 4.5 cm", cantidad: "Planilla de 10", precio: 50, imagen: "/images/back-to-school/planilla-libros.webp", tint: "#F0D9CC" },
  { nombre: "Etiquetas minis", medida: "2.4 × 2.1 cm", cantidad: "Planilla de 66", precio: 50, imagen: "/images/back-to-school/planilla-minis.webp", tint: "#CED8D9" },
  { nombre: "Grandes de siluetas", medida: "10 × 5 cm", cantidad: "Planilla de 6", precio: 50, imagen: "/images/back-to-school/planilla-siluetas.webp", tint: "#C9D3C0" },
  { nombre: "Circulares", medida: "5 cm", cantidad: "Planilla de 15", precio: 50, imagen: "/images/back-to-school/planilla-circulares.webp", tint: "#F0E6D0" },
  { nombre: "Multiusos", medida: "Todo lo que quepa en una hoja A4", cantidad: "Planilla", precio: 50, imagen: "/images/back-to-school/planilla-multiusos.webp", tint: "#F0D9CC" },
  { nombre: "DTF contra agua", medida: "Termos, toppers, estucheras", cantidad: "Planilla 20 × 30 cm", precio: 60, imagen: "/images/back-to-school/planilla-dtf-agua.webp", tint: "#CED8D9" },
  { nombre: "DTF textil", medida: "Para ropa", cantidad: "Planilla 20 × 30 cm", precio: 100, imagen: "/images/back-to-school/planilla-dtf-textil.webp", tint: "#C9D3C0" },
];

const ESTILOS = [
  "Colorido y divertido", "Tierno y pastel", "Minimalista", "Dinosaurios",
  "Espacio", "Flores", "Animalitos", "Deportes", "Fantasía", "Escolar clásico",
];
const ESTILO_COLORS = [
  { bg: "#F0D9CC", text: "#8C482A" },
  { bg: "#C9D3C0", text: "#2f5d4a" },
  { bg: "#CED8D9", text: "#1e4a52" },
  { bg: "#F0E6D0", text: "#946233" },
];

const FAQ = [
  {
    q: "¿Las etiquetas son resistentes al agua?",
    a: "Depende del material. Para termos, loncheras y botellas usamos DTF contra agua o vinil, con mayor resistencia al uso y a la limpieza. El papel del Paquete Básico no es contra agua.",
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
    a: "Sí. Puedes comprar planillas sueltas por tamaño, agregar bordados o acabados especiales, y armar el paquete a tu medida.",
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

// ── Página ─────────────────────────────────────────────────────────────────

export default function BackToSchoolPage() {
  return (
    <>
      {/* 1 · Hero */}
      <HeroSection bgColor="#263834">
        {/* Textura de pizarrón (imagen) sobre el verde base — soft-light conserva el verde del video */}
        <Image
          src="/images/back-to-school/pizarron.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 object-cover"
          style={{ mixBlendMode: "soft-light", opacity: 0.5, filter: "grayscale(1) contrast(1.05)" }}
        />
        {/* Viñeta muy sutil, pareja, sin foco de luz */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(130% 100% at 50% 50%, transparent 45%, rgba(0,0,0,0.22) 100%)",
          }}
        />

        {/* Avioneta de gis volando arriba-izquierda */}
        <BackToSchoolPlane />

        {/* Texto — indentado a la izquierda, centrado vertical (subtítulo y CTA centrados bajo el título) */}
        <div className="relative z-20 flex-1 flex flex-col justify-center px-6 md:pl-[7%] md:pr-6 pt-[230px] md:pt-[120px] pb-6 md:pb-24 w-full md:max-w-[54%] lg:max-w-[660px]">
          <h1 className="font-serif italic text-[clamp(2.4rem,4.6vw,4.2rem)] leading-[1.08] text-[var(--color-cremita)] text-center mb-6">
            Todo lo que necesitas en un solo lugar
          </h1>
          <p className="font-sans text-[var(--color-cremita)]/90 text-[17px] leading-[26px] text-center max-w-md mx-auto mb-8">
            Este regreso a clases te ayudamos con todo lo que necesitas: desde tu material escolar y etiquetas, hasta personalizar todo lo que se te ocurra.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#etiquetas"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-cremita)] px-7 py-3.5 font-sans text-[15px] font-semibold text-[var(--color-verde)] transition-opacity hover:opacity-90"
            >
              Paquetes Etiquetas
              <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </a>
            <a
              href="#lista-utiles"
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border border-[var(--color-cremita)] px-6 py-3 font-sans text-[15px] font-semibold text-[var(--color-cremita)] transition-colors duration-500 hover:text-[var(--color-verde)]"
              style={{ isolation: "isolate" }}
            >
              <span className="absolute inset-0 -z-10 origin-left scale-x-0 bg-[var(--color-cremita)] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-x-100" />
              Lista de Útiles
              <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Niños — pegados al borde inferior, sin fondo, grandes, con sombra.
            Parallax propio (zoom + subida) que cancela el desplazamiento
            compartido del hero para no dejar un corte visible al hacer scroll. */}
        <HeroNinosParallax
          src="/images/back-to-school/hero-ninos.png"
          alt="Dos niños listos para el regreso a clases con sus útiles personalizados"
        />
      </HeroSection>

      {/* 2 · Etiquetas — incluye + paquetes */}
      <section id="etiquetas" className="w-[90%] mx-auto pt-20 md:pt-24 pb-8">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="label text-[var(--color-terracota)] mb-4">Etiquetas</p>
            <h2 className="font-serif font-extralight text-[#403C3C] text-[clamp(2rem,4.4vw,3.4rem)] leading-tight">
              Creamos las etiquetas personalizadas más bonitas y resistentes.
            </h2>
          </div>
        </ScrollReveal>

        {/* Todos los paquetes incluyen — 4 columnas */}
        <ScrollReveal>
          <div className="flex items-center justify-center gap-4 mb-10">
            <span className="h-px w-12 bg-[var(--color-border)]" />
            <span className="label text-[var(--color-muted)]">Todos los paquetes incluyen</span>
            <span className="h-px w-12 bg-[var(--color-border)]" />
          </div>
        </ScrollReveal>
        {/* Mobile: acordeón vertical (mismo patrón que FAQ) — ahorra espacio,
            cada item se abre/cierra en vez de ocupar 4 tarjetas seguidas. */}
        <div className="sm:hidden mb-16 flex flex-col gap-3">
          {INCLUYE.map((item, i) => (
            <details
              key={item.titulo}
              open={i === 0}
              className="group rounded-2xl border border-[var(--color-border)] bg-white/50 px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5 shrink-0 text-[#3a8a6d]" aria-hidden="true" />
                  <h3 className="font-serif text-[17px] leading-tight text-[#403C3C]">{item.titulo}</h3>
                </span>
                <ArrowRightIcon className="h-4 w-4 shrink-0 text-[var(--color-verde)] transition-transform duration-300 group-open:rotate-90" aria-hidden="true" />
              </summary>
              <p className="mt-3 font-sans text-[13px] leading-[20px] text-[var(--color-muted)]">{item.texto}</p>
            </details>
          ))}
        </div>

        {/* Tablet/desktop: grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {INCLUYE.map((item, i) => (
            <ScrollReveal key={item.titulo} delay={(i % 4) * 0.06}>
              <div className="flex h-full flex-col rounded-2xl border border-[var(--color-border)] bg-white/50 p-6">
                <div className="mb-3 flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5 shrink-0 text-[#3a8a6d]" aria-hidden="true" />
                  <h3 className="font-serif text-[19px] text-[#403C3C]">{item.titulo}</h3>
                </div>
                <p className="font-sans text-[14px] leading-[22px] text-[var(--color-muted)]">{item.texto}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Paquetes — mobile: tabs por nombre (evita el scroll largo de 3 tarjetas
            apiladas); tablet/desktop: grid normal, sin cambios. */}
        <BackToSchoolPaquetesTabs paquetes={PAQUETES} msgFormatos={MSG_FORMATOS} />
        <div className="hidden sm:grid sm:grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {PAQUETES.map((paq, i) => (
            <ScrollReveal key={paq.nombre} delay={i * 0.08}>
              <PaqueteCard paquete={paq} size="full" />
            </ScrollReveal>
          ))}

          {/* Formatos Personalizados */}
          <ScrollReveal delay={0.16}>
            <FormatosCard msg={MSG_FORMATOS} size="full" />
          </ScrollReveal>
        </div>
      </section>

      {/* 2.5 · Lista de útiles — servicio de compra y armado de la lista escolar */}
      <section id="lista-utiles" className="w-[90%] mx-auto py-16 md:py-20">
        <ScrollReveal>
          <div className="rounded-[32px] bg-[#CED8D9] px-8 py-12 md:px-12 md:py-14 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 lg:items-center">
              <div className="text-center lg:text-left">
                <p className="label text-[var(--color-terracota)] mb-4">Lista de útiles</p>
                <h2 className="font-serif italic text-[#403C3C] text-[clamp(1.8rem,3.6vw,2.6rem)] leading-[1.15]">
                  También surtimos tu lista de útiles escolares completa
                </h2>
              </div>

              {/* Mobile: imagen justo debajo del título. Desktop: se oculta aquí y se usa la de la columna derecha. */}
              <Foto
                src="/images/back-to-school/lista-utiles-ninos.webp"
                alt="Niños regresando a clases con sus mochilas"
                tint="#E3C3B8"
                className="aspect-[4/3] w-full rounded-[28px] lg:hidden"
                sizes="90vw"
              />

              <div className="text-center lg:text-left">
                <p className="font-sans text-[17px] leading-[26px] text-[var(--color-muted)] mb-5">
                  Mándanos la lista que pide tu colegio y nosotros compramos y armamos todo por ti: cuadernos, libretas, colores y demás materiales, listos para recoger en Papela.
                </p>
                <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-verde)]/10 px-4 py-2 mb-8">
                  <span className="font-sans text-[14px] font-semibold text-[var(--color-verde)]">
                    🎁 De regalo: una planilla de stickers personalizados totalmente gratis
                  </span>
                </div>
                <div className="flex justify-center lg:justify-start">
                  <CtaMeInteresa msg={MSG_LISTA_UTILES} label="Enviar lista de útiles" />
                </div>
              </div>

              <Foto
                src="/images/back-to-school/lista-utiles-ninos.webp"
                alt="Niños regresando a clases con sus mochilas"
                tint="#E3C3B8"
                className="hidden lg:block aspect-[4/3] w-full rounded-[28px] lg:row-span-2 lg:col-start-2 lg:row-start-1"
                sizes="(max-width: 1024px) 90vw, 45vw"
              />
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 3 · Elige el acabado */}
      <section className="w-[90%] mx-auto py-16 md:py-20">
        <ScrollReveal>
          <h2 className="text-center font-serif font-extralight text-[#403C3C] text-[clamp(2rem,4vw,3rem)] leading-tight mb-12">
            Nuestros Acabados
          </h2>
        </ScrollReveal>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {ACABADOS.map((ac, i) => (
            <ScrollReveal key={ac.nombre} delay={(i % 6) * 0.05}>
              <div className="flex h-full flex-col rounded-2xl border border-[#D5E0E1] bg-[#E8EFEF] p-4">
                <span className="font-sans text-[12px] font-bold tracking-[1px] text-[#7a9195] mb-2">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Foto
                  src={ac.imagen}
                  alt={`Acabado ${ac.nombre}`}
                  tint="#DCE6E7"
                  className="aspect-[4/3] w-full rounded-xl mb-3"
                  sizes="(max-width: 1024px) 45vw, 16vw"
                />
                <h3 className="font-serif italic text-[17px] text-[#1e2d36] mb-1">{ac.nombre}</h3>
                <p className="font-sans text-[12px] leading-[18px] text-[#4a5b62] mb-3 flex-1">{ac.texto}</p>
                <p className="font-sans text-[12px] font-semibold uppercase tracking-widest text-[var(--color-verde)]">
                  +${ac.precio}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* 4 · Así funciona */}
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

      {/* 5 · Arma tu paquete — planillas + bordados */}
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
              <div className="flex h-full flex-col rounded-2xl border border-[var(--color-border)] bg-white/70 overflow-hidden">
                <Foto
                  src={p.imagen}
                  alt={p.nombre}
                  tint={p.tint}
                  className="aspect-[16/10] w-full"
                  sizes="(max-width: 1024px) 50vw, 22vw"
                />
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-serif italic text-[19px] leading-[24px] text-[#403C3C]">{p.nombre}</h3>
                  <p className="mt-1 font-sans text-[13px] text-[var(--color-muted)]">{p.medida}</p>
                  <p className="mt-3 font-sans text-[12px] font-semibold uppercase tracking-widest text-[var(--color-terracota)]">{p.cantidad}</p>
                  <span className="mt-3 font-serif font-extralight text-[28px] leading-none text-[var(--color-verde)]">${p.precio}</span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Bordados */}
        <ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-2xl bg-[#dde5d5] p-7 md:p-9">
            <div className="flex flex-col justify-center">
              <h3 className="font-serif italic text-[24px] text-[#2f5d4a] mb-5">Bordados por pieza</h3>
              <ul className="flex flex-col divide-y divide-[#c2d0b8]">
                {BORDADOS.map((b) => (
                  <li key={b.nombre} className="flex items-center justify-between py-3 font-sans text-[15px] text-[#3a4a3a]">
                    <span>{b.nombre}</span>
                    <span className="font-semibold text-[#2f5d4a]">${b.precio}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Foto
                src="/images/back-to-school/bordado-nombre.webp"
                alt="Sudadera con nombre bordado"
                tint="#cfdac4"
                className="aspect-[3/4] w-full rounded-xl"
                sizes="(max-width: 768px) 45vw, 22vw"
              />
              <Foto
                src="/images/back-to-school/bordado-corazon.webp"
                alt="Prenda con bordado de corazón"
                tint="#cfdac4"
                className="aspect-[3/4] w-full rounded-xl"
                sizes="(max-width: 768px) 45vw, 22vw"
              />
            </div>
          </div>
        </ScrollReveal>

        <div className="mt-10 flex justify-center">
          <CtaMeInteresa msg={MSG_ARMA} label="Arma tu paquete" />
        </div>
      </section>

      {/* 6 · Diseños tan únicos */}
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
                  const color = ESTILO_COLORS[i % ESTILO_COLORS.length];
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
            <Foto
              src="/images/back-to-school/estilos.webp"
              alt="Estilos de etiquetas escolares personalizadas"
              tint="#C9D3C0"
              className="aspect-[4/3] w-full rounded-[28px]"
              sizes="(max-width: 1024px) 90vw, 45vw"
            />
          </ScrollReveal>
        </div>
      </section>

      {/* 7 · FAQ */}
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

      {/* 8 · CTA final */}
      <section className="w-[90%] mx-auto pb-24 pt-4">
        <div className="relative overflow-hidden rounded-[32px] bg-[#C4846A] px-8 py-14 md:px-16 md:py-20 text-center">
          <h2 className="font-serif italic text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.1] text-[var(--color-cremita)] max-w-2xl mx-auto mb-5">
            ¿Listos para marcar todo este regreso a clases?
          </h2>
          <p className="font-sans text-[var(--color-cremita)]/90 text-[17px] leading-[26px] max-w-xl mx-auto mb-9">
            Elige tu paquete y escríbenos por WhatsApp. Te ayudamos a crear etiquetas bonitas, prácticas y personalizadas para que todo esté listo antes de volver a clases.
          </p>
          <div className="flex justify-center">
            <CtaMeInteresa msg={MSG_FINAL} light />
          </div>
        </div>
      </section>

      <BackToSchoolAcabadosModal />
    </>
  );
}
