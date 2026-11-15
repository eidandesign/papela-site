import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  ChevronDownIcon,
  GiftIcon,
  ShoppingBagIcon,
  DevicePhoneMobileIcon,
  ChatBubbleLeftRightIcon,
  BuildingStorefrontIcon,
  CheckBadgeIcon,
  BanknotesIcon,
  ClockIcon,
  SparklesIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";
import HeroSection from "@/components/site/HeroSection";
import ScrollReveal from "@/components/site/ScrollReveal";
import TarjetaPreview from "@/components/site/club/TarjetaPreview";
import { TarjetaAnatomiaVisual, TarjetaAnatomiaLeyenda } from "@/components/site/club/TarjetaAnatomia";
import WhatsAppLink from "@/components/site/WhatsAppLink";

// Página que explica la Tarjeta de Lealtad del Club Creativo (nov-2026).
// Las reglas salen del admin (tabla `club_cashback_config` + cómo se han
// registrado las ventas): 3% de cashback en compras de $100 o más, calculado
// sobre lo pagado en dinero (no sobre lo pagado con Coins); sin vencimiento;
// se puede pagar hasta el 100% con Coins. Cada compra da 1 estampita y su
// rareza depende del monto (`estampitas_niveles`: raro desde $200,
// legendario desde $500). Los premios de ejemplo son reales de `club_stickers`.
// ⚠️ Si cambian en el admin, actualizar PROGRAMA y PREMIOS aquí.
const PROGRAMA = {
  porcentaje: 3,
  compraMinima: 100,
  raroDesde: 200,
  legendarioDesde: 500,
  ejemploCompra: 500,
};

const PREMIOS: Record<"comun" | "raro" | "legendario", string[]> = {
  comun: ["Impresiones a color", "Sacapuntas metálico", "10% en tu próxima compra", "Bolsita de diamantina", "Lápiz con las tablas"],
  raro: ["Cerámica mini", "20% en tu próxima clase de arte", "Botón personalizado", "Lápiz con semilla", "Impresión fotográfica"],
  legendario: ["Cabalgata en Calpan", "Planilla de stickers personalizada", "Tarjetas de presentación con diseño"],
};

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: "Tarjeta de Lealtad — Club Creativo Papela" },
  description: `Gratis: gana ${PROGRAMA.porcentaje}% en Papela Coins en cada compra y una estampita sorpresa que puede traer premio. Así funciona la Tarjeta de Lealtad de Papela.`,
  alternates: { canonical: "https://www.papela-atelier.com/club-creativo/tarjeta" },
  openGraph: {
    title: "Tarjeta de Lealtad — Club Creativo Papela",
    description: "Papela Coins, estampitas con premios y una tarjeta que es solo tuya.",
  },
};

const mxn = (n: number) =>
  n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 });
const mxn0 = (n: number) => n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });

const TEXTO_WA = "Hola Papela 🌿 quiero mi Tarjeta de Lealtad del Club Creativo";

function CtaPedir({ ubicacion, claro = false }: { ubicacion: string; claro?: boolean }) {
  return (
    <WhatsAppLink
      ubicacion={ubicacion}
      texto={TEXTO_WA}
      itemName="Tarjeta de Lealtad"
      lead={{ tipo: "club", item_name: "Tarjeta de Lealtad" }}
      className={`group relative inline-flex items-center gap-2 overflow-hidden rounded-full font-sans text-[15px] font-semibold px-7 py-3.5 ${
        claro ? "bg-[var(--color-cremita)] text-[var(--color-verde)]" : "bg-[var(--color-verde)] text-[var(--color-cremita)]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-0 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out ${
          claro ? "bg-white" : "bg-[var(--color-terracota)]"
        }`}
      />
      <span className="relative">Pedir mi tarjeta</span>
      <ArrowRightIcon className="relative w-4 h-4" aria-hidden="true" />
    </WhatsAppLink>
  );
}

function Encabezado({ eyebrow, titulo, texto }: { eyebrow: string; titulo: string; texto?: string }) {
  return (
    <ScrollReveal>
      <p className="label text-[var(--color-terracota)] mb-3">{eyebrow}</p>
      <h2 className="font-serif font-extralight text-[#403C3C] text-[clamp(2rem,4vw,3.25rem)] leading-[1.1] mb-4 max-w-3xl">
        {titulo}
      </h2>
      {texto && <p className="font-sans text-[18px] leading-[26px] text-[var(--color-muted)] max-w-2xl">{texto}</p>}
    </ScrollReveal>
  );
}

const PASOS = [
  { n: "01", titulo: "Pide tu tarjeta", texto: "En caja o por WhatsApp. Es gratis y te mandamos tu enlace personal: vive en tu celular, sin app ni contraseña." },
  { n: "02", titulo: "Compra como siempre", texto: `Cada compra suma ${PROGRAMA.porcentaje}% en Papela Coins y te da una estampita sorpresa para rascar.` },
  { n: "03", titulo: "Disfruta tus recompensas", texto: "Paga con tus Coins y reclama en caja los premios que traen tus estampitas." },
];

const NIVELES = [
  { clave: "comun" as const, nombre: "Común", img: "flor", monto: `Compras de hasta ${mxn0(PROGRAMA.raroDesde - 1)}`, bg: "#F0D9CC" },
  { clave: "raro" as const, nombre: "Raro ✦", img: "monstera", monto: `Compras desde ${mxn0(PROGRAMA.raroDesde)}`, bg: "#EEC3D7" },
  { clave: "legendario" as const, nombre: "Legendario ★", img: "caballo", monto: `Compras desde ${mxn0(PROGRAMA.legendarioDesde)}`, bg: "#E8C9A8" },
];

const REGLAS = [
  { Icon: BanknotesIcon, titulo: "Cuesta $0", texto: "La tarjeta es gratis, sin mensualidad ni compra mínima para tenerla." },
  { Icon: CheckBadgeIcon, titulo: "Ya está activa", texto: "No es una preventa: desde hoy tus compras ya suman." },
  { Icon: ShoppingBagIcon, titulo: "Papelería y clases", texto: "Aplica en papelería, materiales e impresiones, y en clases y paquetes de clases." },
  { Icon: SparklesIcon, titulo: `Cashback desde ${mxn0(PROGRAMA.compraMinima)}`, texto: `Las compras de ${mxn0(PROGRAMA.compraMinima)} o más generan Coins. La estampita te toca en cualquier compra.` },
  { Icon: ClockIcon, titulo: "Sin vencimiento", texto: "Tus Papela Coins no caducan. Si algún día cambia, lo verás en tu tarjeta con fecha." },
  { Icon: GiftIcon, titulo: "Premios en tienda", texto: "Los premios físicos se recogen en Papela y no se cambian por dinero." },
];

const PREGUNTAS = [
  { p: "¿Cuánto cuesta?", r: "Nada. La Tarjeta de Lealtad del Club Creativo es gratuita." },
  {
    p: "¿Cuánto cashback me dan?",
    r: `El ${PROGRAMA.porcentaje}% de lo que pagas, en compras de ${mxn0(PROGRAMA.compraMinima)} o más. En una compra de ${mxn0(PROGRAMA.ejemploCompra)} ganas ${mxn((PROGRAMA.ejemploCompra * PROGRAMA.porcentaje) / 100)} en Papela Coins.`,
  },
  {
    p: "¿Se acumula? ¿Cómo lo uso?",
    r: "Sí, tus Coins se van sumando compra tras compra. Para usarlos, avísanos en caja: pagas parte o el total de tu compra con ellos. No hay mínimo para usarlos.",
  },
  {
    p: "Si pago con Coins, ¿también gano cashback?",
    r: `Sí, sobre la parte que pagas con dinero. Por ejemplo, si tu compra es de $350 y usas $200 en Coins, ganas ${PROGRAMA.porcentaje}% de los $150 restantes.`,
  },
  {
    p: "¿Es un sello por compra? ¿Cuántos necesito para un regalo?",
    r: `No hay que juntar sellos: cada compra te da una estampita y cada estampita es su propia sorpresa. Algunas traen un premio directo, sin importar cuántas tengas. Entre más grande la compra, más rara la estampita: común hasta ${mxn0(PROGRAMA.raroDesde - 1)}, rara desde ${mxn0(PROGRAMA.raroDesde)} y legendaria desde ${mxn0(PROGRAMA.legendarioDesde)}.`,
  },
  {
    p: "¿Todas las estampitas traen premio?",
    r: "No, más o menos la mitad. Las demás son para coleccionar, lucir en tu portada o regalar si te salen repetidas.",
  },
  {
    p: "¿Cómo reclamo un premio?",
    r: "Abre la estampita en tu tarjeta y enséñala en caja. Los premios descargables (como imprimibles) los bajas directo desde la ficha.",
  },
  {
    p: "¿Qué pasa si me sale una repetida?",
    r: "Puedes regalarla a otro miembro del Club con un código de un solo uso que dura 72 horas.",
  },
  {
    p: "¿Puedo compartir mi tarjeta?",
    r: "Tu tarjeta es personal e intransferible y vive en un enlace: quien lo tenga puede verla, así que compártelo solo con quien quieras.",
  },
];

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
            {PROGRAMA.porcentaje}% en Papela Coins y una estampita sorpresa en cada compra. Gratis y ya activa.
          </p>
          <div className="my-4 md:my-8">
            <TarjetaPreview className="-rotate-[4deg] scale-110 md:scale-125" />
          </div>
          <div className="mt-10 md:mt-12">
            <CtaPedir ubicacion="tarjeta_lealtad_hero" claro />
          </div>
        </div>
      </HeroSection>

      {/* Resumen en 3 pasos */}
      <section className="w-[90%] mx-auto py-12 md:py-16">
        <Encabezado eyebrow="Cómo funciona" titulo="Tres pasos, cero complicaciones" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 md:mt-10">
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

      {/* Anatomía de la tarjeta */}
      <section className="w-[90%] mx-auto py-12 md:py-16">
        <Encabezado
          eyebrow="Anatomía"
          titulo="Conoce tu tarjeta"
          texto="Así se ve tu tarjeta en el celular. Cada número es algo que puedes hacer con ella."
        />
        <div className="mt-10 md:mt-12 rounded-[32px] md:rounded-[48px] bg-[var(--color-cremita-3)] border border-[var(--color-border)] px-6 py-10 md:px-14 md:py-14 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-12 lg:gap-16 items-center">
          <ScrollReveal>
            <TarjetaAnatomiaVisual />
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <TarjetaAnatomiaLeyenda />
          </ScrollReveal>
        </div>
      </section>

      {/* Papela Coins — par Raíz */}
      <section className="w-[90%] mx-auto py-12 md:py-16">
        <ScrollReveal>
          <div className="rounded-[32px] md:rounded-[48px] bg-[var(--color-verde)] text-[var(--color-cremita)] px-7 py-10 md:px-16 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <p className="label text-[var(--color-cremita)]/85 mb-4">Cashback</p>
              <h2 className="font-serif italic text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[1.05] text-[var(--color-pistache)] mb-5">
                Papela Coins
              </h2>
              <p className="font-sans text-[18px] leading-[26px] text-[var(--color-cremita)]/90 mb-6 max-w-md">
                Dinero que vuelve a ti: en cada compra de {mxn0(PROGRAMA.compraMinima)} o más te regresamos el {PROGRAMA.porcentaje}% en Papela Coins.
              </p>
              <ul className="font-sans text-[16px] leading-[24px] text-[var(--color-cremita)]/90 space-y-3">
                <li className="flex gap-3"><ArrowPathIcon className="w-5 h-5 mt-0.5 shrink-0 text-[var(--color-pistache)]" aria-hidden="true" /><span><strong className="font-semibold text-[var(--color-cremita)]">Se acumulan</strong> compra tras compra.</span></li>
                <li className="flex gap-3"><ShoppingBagIcon className="w-5 h-5 mt-0.5 shrink-0 text-[var(--color-pistache)]" aria-hidden="true" /><span><strong className="font-semibold text-[var(--color-cremita)]">Se canjean en caja:</strong> pagas parte o el total de tu compra con ellos, sin mínimo.</span></li>
                <li className="flex gap-3"><DevicePhoneMobileIcon className="w-5 h-5 mt-0.5 shrink-0 text-[var(--color-pistache)]" aria-hidden="true" /><span><strong className="font-semibold text-[var(--color-cremita)]">Siempre a la vista</strong> en tu tarjeta.</span></li>
                <li className="flex gap-3"><ClockIcon className="w-5 h-5 mt-0.5 shrink-0 text-[var(--color-pistache)]" aria-hidden="true" /><span><strong className="font-semibold text-[var(--color-cremita)]">No vencen.</strong></span></li>
              </ul>
            </div>

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
                en Papela Coins, más una estampita legendaria 🐴. Si pagas una parte con Coins, el cashback se calcula sobre lo que pagas con dinero.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Estampitas y premios */}
      <section className="w-[90%] mx-auto py-12 md:py-16">
        <Encabezado
          eyebrow="Estampitas y regalos"
          titulo="Una estampita en cada compra, sin juntar sellos"
          texto="Aquí no cuentas sellos: cada compra te da una estampita sorpresa que rascas en tu tarjeta, y cada una es su propio premio. Su rareza depende del monto de tu compra."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 md:mt-12 mb-6">
          {NIVELES.map((nv, i) => (
            <ScrollReveal key={nv.clave} delay={i * 0.08} className="h-full">
              <div className="h-full rounded-[28px] p-7 flex flex-col" style={{ backgroundColor: nv.bg }}>
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-cacao)] mb-1.5">{nv.monto}</p>
                    <h3 className="font-serif italic text-[30px] leading-tight text-[var(--color-cacao)]">{nv.nombre}</h3>
                  </div>
                  <div className="relative w-20 h-20 shrink-0 -mt-1">
                    <Image src={`/images/club/preview/${nv.img}.webp`} alt="" fill sizes="80px" className="object-contain" />
                  </div>
                </div>
                <p className="font-sans text-[13px] font-semibold text-[var(--color-cacao)] mb-2.5">Premios que puedes encontrar</p>
                <ul className="flex flex-wrap gap-2">
                  {PREMIOS[nv.clave].map((pr) => (
                    <li key={pr} className="rounded-full bg-white/65 px-3 py-1.5 font-sans text-[13px] leading-tight text-[var(--color-cacao)]">
                      {pr}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <div className="rounded-[28px] bg-[var(--color-cacao)] text-[var(--color-rosa-papel)] p-7 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <GiftIcon className="w-7 h-7 mb-3" aria-hidden="true" />
              <h3 className="font-serif italic text-[24px] leading-tight mb-2">Premio directo</h3>
              <p className="font-sans text-[15px] leading-[22px]">Más o menos la mitad de las estampitas trae un regalo. Lo ves en cuanto la rascas, con un 🎁.</p>
            </div>
            <div>
              <BuildingStorefrontIcon className="w-7 h-7 mb-3" aria-hidden="true" />
              <h3 className="font-serif italic text-[24px] leading-tight mb-2">Reclámalo en caja</h3>
              <p className="font-sans text-[15px] leading-[22px]">Enseña la estampita en Papela y te damos tu premio. Los imprimibles los descargas desde la tarjeta.</p>
            </div>
            <div>
              <ArrowPathIcon className="w-7 h-7 mb-3" aria-hidden="true" />
              <h3 className="font-serif italic text-[24px] leading-tight mb-2">¿Te salió repetida?</h3>
              <p className="font-sans text-[15px] leading-[22px]">Regálala a otro miembro del Club con un código que dura 72 horas.</p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Cómo se consigue */}
      <section className="w-[90%] mx-auto py-12 md:py-16">
        <Encabezado
          eyebrow="Cómo se consigue"
          titulo="Pídela en caja o por WhatsApp"
          texto="La tarjeta es digital: no hay que descargar nada ni crear contraseña."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 md:mt-12">
          {[
            { Icon: BuildingStorefrontIcon, titulo: "En caja", texto: "Pídela en tu próxima visita a Papela y te registramos ahí mismo." },
            { Icon: ChatBubbleLeftRightIcon, titulo: "Por WhatsApp", texto: "Escríbenos y te damos de alta sin ir a la tienda." },
            { Icon: DevicePhoneMobileIcon, titulo: "Te llega un enlace", texto: "Tu tarjeta vive en un enlace personal. Guárdalo en favoritos o en la pantalla de inicio de tu celular." },
          ].map(({ Icon, titulo, texto }, i) => (
            <ScrollReveal key={titulo} delay={i * 0.06} className="h-full">
              <div className="h-full rounded-[28px] bg-[#CED8D9] p-7">
                <span className="w-10 h-10 rounded-full bg-[var(--color-verde)] flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-[var(--color-cremita)]" aria-hidden="true" />
                </span>
                <h3 className="font-serif italic text-[24px] leading-tight text-[#403C3C] mb-2">{titulo}</h3>
                <p className="font-sans text-[16px] leading-[24px] text-[#403C3C]/80">{texto}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
        <div className="mt-8">
          <CtaPedir ubicacion="tarjeta_lealtad_consigue" />
        </div>
      </section>

      {/* Reglas */}
      <section className="w-[90%] mx-auto py-12 md:py-16">
        <Encabezado eyebrow="Reglas" titulo="Lo importante, en corto" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 md:mt-12">
          {REGLAS.map(({ Icon, titulo, texto }, i) => (
            <ScrollReveal key={titulo} delay={i * 0.05} className="h-full">
              <div className="h-full rounded-[28px] bg-[#C9D3C0] p-7 flex gap-4">
                <span className="shrink-0 w-10 h-10 rounded-full bg-[var(--color-verde)] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[var(--color-cremita)]" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-serif italic text-[22px] leading-tight text-[#403C3C] mb-1.5">{titulo}</h3>
                  <p className="font-sans text-[15px] leading-[22px] text-[#403C3C]/80">{texto}</p>
                </div>
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
              Escríbenos por WhatsApp o pídela en tu próxima visita. Empiezas a ganar desde tu siguiente compra.
            </p>
            <CtaPedir ubicacion="tarjeta_lealtad_final" />
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
