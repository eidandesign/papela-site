import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  ChevronDownIcon,
  GiftIcon,
  SparklesIcon,
  BellIcon,
  PaintBrushIcon,
  ShoppingBagIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/solid";
import HeroSection from "@/components/site/HeroSection";
import ScrollReveal from "@/components/site/ScrollReveal";
import TarjetaPreview from "@/components/site/club/TarjetaPreview";
import WhatsAppLink from "@/components/site/WhatsAppLink";

// Página que explica la Tarjeta de Lealtad del Club Creativo (nov-2026).
// Las cifras salen de `club_cashback_config` en el admin (3% de cashback,
// compra mínima de $100 para GANAR, sin vencimiento, canje hasta el 100%).
// ⚠️ Si se cambian en el admin, actualizar PROGRAMA aquí.
const PROGRAMA = {
  porcentaje: 3,
  compraMinima: 100,
  ejemploCompra: 500,
};

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: "Tarjeta de Lealtad — Club Creativo Papela" },
  description: `Gana ${PROGRAMA.porcentaje}% en Papela Coins en cada compra, colecciona estampitas con premios y personaliza tu tarjeta digital. Es gratis.`,
  alternates: { canonical: "https://www.papela-atelier.com/club-creativo/tarjeta" },
  openGraph: {
    title: "Tarjeta de Lealtad — Club Creativo Papela",
    description: "Papela Coins, estampitas con premios y una tarjeta que es solo tuya.",
  },
};

const mxn = (n: number) =>
  n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 });

const PASOS = [
  {
    n: "01",
    titulo: "Pide tu tarjeta",
    texto: "Pídela en tienda o por WhatsApp. Es gratis y te llega como un enlace personal: vive en tu celular, sin app ni contraseña.",
  },
  {
    n: "02",
    titulo: "Compra y acumula",
    texto: `En cada compra ganas ${PROGRAMA.porcentaje}% en Papela Coins y una estampita sorpresa para rascar en tu tarjeta.`,
  },
  {
    n: "03",
    titulo: "Usa tus recompensas",
    texto: "Paga con tus Papela Coins en caja y reclama los premios que traen algunas estampitas.",
  },
];

const RAREZAS = [
  { nombre: "Común", img: "flor", texto: "Las que más vas a encontrar. Arma tu colección poco a poco." },
  { nombre: "Raro ✦", img: "monstera", texto: "Más difíciles de conseguir, con marco holográfico en tu planilla." },
  { nombre: "Legendario ★", img: "caballo", texto: "Las joyas de la colección. Entre más grande tu compra, más chance de que te toque una." },
];

const EXTRAS = [
  { Icon: PaintBrushIcon, titulo: "Hazla tuya", texto: "Elige colores, fondos, texturas, brillo holográfico y charms. Tu tarjeta no se parece a ninguna otra." },
  { Icon: SparklesIcon, titulo: "Tu portada", texto: "Escoge tus 6 estampitas favoritas para lucirlas al frente de tu tarjeta." },
  { Icon: GiftIcon, titulo: "Regala repetidas", texto: "¿Te salió doble? Regálala a otro miembro con un código que dura 72 horas." },
  { Icon: BellIcon, titulo: "Avisos primero", texto: "En la campana de tu tarjeta te llegan noticias, lanzamientos y sorpresas del Club." },
];

const PREGUNTAS = [
  {
    p: "¿Cuánto cuesta?",
    r: "Nada. La Tarjeta de Lealtad del Club Creativo es gratuita.",
  },
  {
    p: "¿Cómo gano Papela Coins?",
    r: `Con cada compra de ${mxn(PROGRAMA.compraMinima)} o más recibes el ${PROGRAMA.porcentaje}% de lo que pagaste en Papela Coins. Por ejemplo, en una compra de ${mxn(PROGRAMA.ejemploCompra)} ganas ${mxn((PROGRAMA.ejemploCompra * PROGRAMA.porcentaje) / 100)}.`,
  },
  {
    p: "¿Cómo uso mis Papela Coins?",
    r: "Avísanos en caja que quieres pagar con tus Coins. Puedes usarlos para cubrir parte o el total de tu compra. Tu saldo siempre está a la vista en tu tarjeta.",
  },
  {
    p: "¿Mis Papela Coins vencen?",
    r: "Hoy no tienen fecha de vencimiento. Si algún día cambia, lo verás en tu tarjeta junto al saldo, con la fecha exacta.",
  },
  {
    p: "¿Qué son las estampitas y cómo las gano?",
    r: "Son coleccionables digitales que aparecen en tu tarjeta después de compras, talleres, clases y actividades de Papela. Llegan tapadas: las rascas con el dedo para descubrir cuál te tocó.",
  },
  {
    p: "¿Qué premios traen las estampitas?",
    r: "Algunas estampitas traen un premio: puede ser un descargable (como un imprimible) o algo físico que recoges en tienda. Lo ves en la ficha de la estampita en cuanto la rascas. Los premios no son canjeables por dinero.",
  },
  {
    p: "¿Puedo compartir mi tarjeta?",
    r: "Tu tarjeta es personal e intransferible y vive en un enlace: quien lo tenga puede verla, así que compártelo solo con quien quieras. Lo que sí puedes regalar son tus estampitas repetidas.",
  },
];

function CtaPedir({ ubicacion }: { ubicacion: string }) {
  return (
    <WhatsAppLink
      ubicacion={ubicacion}
      texto="Hola Papela 🌿 quiero mi Tarjeta de Lealtad del Club Creativo"
      itemName="Tarjeta de Lealtad"
      lead={{ tipo: "club", item_name: "Tarjeta de Lealtad" }}
      className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[var(--color-verde)] text-[var(--color-cremita)] font-sans text-[15px] font-semibold px-7 py-3.5"
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-[var(--color-terracota)] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"
      />
      <span className="relative">Pedir mi tarjeta</span>
      <ArrowRightIcon className="relative w-4 h-4" aria-hidden="true" />
    </WhatsAppLink>
  );
}

function CtaPedirHero() {
  return (
    <WhatsAppLink
      ubicacion="tarjeta_lealtad_hero"
      texto="Hola Papela 🌿 quiero mi Tarjeta de Lealtad del Club Creativo"
      itemName="Tarjeta de Lealtad"
      lead={{ tipo: "club", item_name: "Tarjeta de Lealtad" }}
      className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[var(--color-cremita)] text-[var(--color-verde)] font-sans text-[15px] font-semibold px-7 py-3.5"
    >
      <span aria-hidden="true" className="absolute inset-0 bg-white origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
      <span className="relative">Pedir mi tarjeta</span>
      <ArrowRightIcon className="relative w-4 h-4" aria-hidden="true" />
    </WhatsAppLink>
  );
}

export default function TarjetaLealtadPage() {
  const ejemploCoins = (PROGRAMA.ejemploCompra * PROGRAMA.porcentaje) / 100;

  return (
    <>
      <HeroSection>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 md:px-20 pt-[140px] md:pt-[180px] pb-16 md:pb-20">
          <span data-hero-badge className="inline-flex items-center border border-[var(--color-cremita)]/40 rounded-full px-5 py-2 mb-6 md:mb-8">
            <span className="label text-[var(--color-cremita)]/85">Club Creativo · Tarjeta de Lealtad</span>
          </span>
          <h1 className="font-serif italic text-[clamp(2.5rem,5.5vw,5rem)] leading-[1.05] text-[var(--color-cremita)] max-w-3xl mb-5 md:mb-6">
            Cada compra te regresa algo
          </h1>
          <p className="font-sans text-[18px] leading-[24px] text-[var(--color-cremita)]/90 max-w-xl mb-10">
            Gana {PROGRAMA.porcentaje}% en Papela Coins, rasca estampitas con premios y lleva en tu celular una tarjeta que es solo tuya. Gratis.
          </p>
          <div className="my-4 md:my-8">
            <TarjetaPreview className="-rotate-[4deg] scale-110 md:scale-125" />
          </div>
          <div className="mt-10 md:mt-12">
            <CtaPedirHero />
          </div>
        </div>
      </HeroSection>

      {/* Cómo funciona */}
      <section className="w-[90%] mx-auto py-12 md:py-16">
        <ScrollReveal>
          <p className="label text-[var(--color-terracota)] mb-3">Cómo funciona</p>
          <h2 className="font-serif font-extralight text-[#403C3C] text-[clamp(2rem,4vw,3.25rem)] leading-[1.1] mb-10 md:mb-12">
            Tres pasos, cero complicaciones
          </h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PASOS.map((paso, i) => (
            <ScrollReveal key={paso.n} delay={i * 0.08} className="h-full">
              <div className="h-full rounded-[28px] bg-white/60 border border-[var(--color-border)] p-7 md:p-8">
                <p className="font-serif italic text-[var(--color-verde)] text-[44px] leading-none mb-6">{paso.n}</p>
                <h3 className="font-serif italic text-[26px] leading-tight text-[#403C3C] mb-3">{paso.titulo}</h3>
                <p className="font-sans text-[16px] leading-[24px] text-[var(--color-muted)]">{paso.texto}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Papela Coins — par Raíz */}
      <section className="w-[90%] mx-auto py-6 md:py-10">
        <ScrollReveal>
          <div className="rounded-[32px] md:rounded-[48px] bg-[var(--color-verde)] text-[var(--color-cremita)] px-7 py-10 md:px-16 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <p className="label text-[var(--color-cremita)]/85 mb-4">Cashback</p>
              <h2 className="font-serif italic text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[1.05] text-[var(--color-pistache)] mb-5">
                Papela Coins
              </h2>
              <p className="font-sans text-[18px] leading-[26px] text-[var(--color-cremita)]/90 mb-6 max-w-md">
                Es dinero que vuelve a ti. En cada compra de {mxn(PROGRAMA.compraMinima)} o más te regresamos el {PROGRAMA.porcentaje}% en Papela Coins, y los usas como pago en tu siguiente visita.
              </p>
              <ul className="font-sans text-[16px] leading-[24px] text-[var(--color-cremita)]/90 space-y-2.5">
                <li className="flex gap-3"><ShoppingBagIcon className="w-5 h-5 mt-0.5 shrink-0 text-[var(--color-pistache)]" aria-hidden="true" />Paga parte o el total de tu compra con tus Coins.</li>
                <li className="flex gap-3"><DevicePhoneMobileIcon className="w-5 h-5 mt-0.5 shrink-0 text-[var(--color-pistache)]" aria-hidden="true" />Tu saldo siempre visible en tu tarjeta.</li>
                <li className="flex gap-3"><SparklesIcon className="w-5 h-5 mt-0.5 shrink-0 text-[var(--color-pistache)]" aria-hidden="true" />Sin fecha de vencimiento.</li>
              </ul>
            </div>

            {/* Ejemplo */}
            <div className="rounded-[28px] bg-[var(--color-cremita)] text-[#403C3C] p-7 md:p-9">
              <p className="label text-[var(--color-terracota)] mb-5">Por ejemplo</p>
              <div className="flex items-baseline justify-between border-b border-[var(--color-border)] pb-4 mb-4">
                <span className="font-sans text-[16px] text-[var(--color-muted)]">Tu compra</span>
                <span className="font-serif text-[28px]">{mxn(PROGRAMA.ejemploCompra)}</span>
              </div>
              <div className="flex items-baseline justify-between border-b border-[var(--color-border)] pb-4 mb-5">
                <span className="font-sans text-[16px] text-[var(--color-muted)]">Cashback</span>
                <span className="font-serif text-[28px]">{PROGRAMA.porcentaje}%</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-sans text-[16px] font-semibold">Ganas</span>
                <span className="font-serif italic text-[clamp(2.5rem,5vw,3.5rem)] leading-none text-[var(--color-verde)]">
                  {mxn(ejemploCoins)}
                </span>
              </div>
              <p className="font-sans text-[14px] leading-[20px] text-[var(--color-muted)] mt-5">
                en Papela Coins, listos para tu próxima compra.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Estampitas — par Cacao */}
      <section className="w-[90%] mx-auto py-12 md:py-16">
        <ScrollReveal>
          <p className="label text-[var(--color-terracota)] mb-3">Coleccionables</p>
          <h2 className="font-serif font-extralight text-[#403C3C] text-[clamp(2rem,4vw,3.25rem)] leading-[1.1] mb-4 max-w-2xl">
            Estampitas que se rascan y traen premios
          </h2>
          <p className="font-sans text-[18px] leading-[26px] text-[var(--color-muted)] max-w-2xl mb-10 md:mb-12">
            Después de tus compras, talleres y clases aparece una estampita sorpresa en tu tarjeta. La rascas con el dedo, descubres cuál te tocó y la guardas en tu planilla. Hay 100 por coleccionar.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {RAREZAS.map((r, i) => (
            <ScrollReveal key={r.nombre} delay={i * 0.08} className="h-full">
              <div className="h-full rounded-[28px] bg-[#F0D9CC] p-7 flex flex-col">
                <div className="relative w-24 h-24 mb-6">
                  <Image src={`/images/club/preview/${r.img}.webp`} alt="" fill sizes="96px" className="object-contain" />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-terracota)] mb-2">Rareza</p>
                <h3 className="font-serif italic text-[28px] leading-tight text-[#403C3C] mb-2">{r.nombre}</h3>
                <p className="font-sans text-[16px] leading-[24px] text-[#403C3C]/80">{r.texto}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <div className="rounded-[28px] bg-[var(--color-cacao)] text-[var(--color-rosa-papel)] p-7 md:p-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
            <span className="shrink-0 w-16 h-16 rounded-full bg-[var(--color-rosa-papel)] flex items-center justify-center">
              <GiftIcon className="w-8 h-8 text-[var(--color-cacao)]" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-serif italic text-[clamp(1.75rem,3vw,2.5rem)] leading-tight mb-2">Algunas traen premio 🎁</h3>
              <p className="font-sans text-[17px] leading-[25px] text-[var(--color-rosa-papel)] max-w-2xl">
                Cuando una estampita trae premio lo verás en cuanto la rasques: puede ser un descargable, como un imprimible, o un regalo físico que recoges en tienda.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Extras */}
      <section className="w-[90%] mx-auto py-12 md:py-16">
        <ScrollReveal>
          <p className="label text-[var(--color-terracota)] mb-3">Y además</p>
          <h2 className="font-serif font-extralight text-[#403C3C] text-[clamp(2rem,4vw,3.25rem)] leading-[1.1] mb-10 md:mb-12">
            Una tarjeta que se siente tuya
          </h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {EXTRAS.map(({ Icon, titulo, texto }, i) => (
            <ScrollReveal key={titulo} delay={i * 0.06} className="h-full">
              <div className="h-full rounded-[28px] bg-[#C9D3C0] p-7">
                <span className="w-10 h-10 rounded-full bg-[var(--color-verde)] flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-[var(--color-cremita)]" aria-hidden="true" />
                </span>
                <h3 className="font-serif italic text-[24px] leading-tight text-[#403C3C] mb-2">{titulo}</h3>
                <p className="font-sans text-[16px] leading-[24px] text-[#403C3C]/80">{texto}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Preguntas frecuentes */}
      <section className="w-[90%] mx-auto py-12 md:py-16 grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-8 lg:gap-16">
        <ScrollReveal>
          <p className="label text-[var(--color-terracota)] mb-3">Dudas</p>
          <h2 className="font-serif font-extralight text-[#403C3C] text-[clamp(2rem,4vw,3.25rem)] leading-[1.1]">
            Preguntas frecuentes
          </h2>
        </ScrollReveal>
        <div className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
          {PREGUNTAS.map((q) => (
            <details key={q.p} className="group py-5">
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span className="font-serif italic text-[22px] leading-tight text-[#403C3C]">{q.p}</span>
                <ChevronDownIcon
                  className="w-5 h-5 shrink-0 text-[var(--color-verde)] transition-transform duration-300 group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="font-sans text-[16px] leading-[24px] text-[var(--color-muted)] mt-3 max-w-2xl">{q.r}</p>
            </details>
          ))}
          <p className="font-sans text-[14px] text-[var(--color-muted)] pt-5">
            Consulta las reglas completas en nuestros{" "}
            <Link href="/terminos" className="text-[var(--color-verde)] underline underline-offset-2">
              términos y condiciones
            </Link>
            .
          </p>
        </div>
      </section>

      {/* CTA final */}
      <section className="w-[90%] mx-auto pt-6 pb-16 md:pb-24">
        <ScrollReveal>
          <div className="rounded-[32px] md:rounded-[48px] bg-[#E0D2CA] px-7 py-12 md:px-16 md:py-16 flex flex-col items-center text-center">
            <h2 className="font-serif italic text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[1.05] text-[#4A3B31] mb-4 max-w-2xl">
              Empieza a juntar recompensas
            </h2>
            <p className="font-sans text-[18px] leading-[26px] text-[#403C3C]/85 max-w-lg mb-8">
              Escríbenos por WhatsApp o pídela en tu próxima visita a Papela. Empiezas a ganar desde tu siguiente compra.
            </p>
            <CtaPedir ubicacion="tarjeta_lealtad_final" />
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
